import assert from "node:assert/strict";
import { readFile, writeFile, rename, unlink } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { join } from "node:path";

const base = "http://localhost:3000";
const id = randomUUID();
const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aV1sAAAAASUVORK5CYII=", "base64");
const jsonFile = join(process.cwd(), "data", "memories.json");
let saved;
try {
  const form = new FormData();
  form.set("id", id); form.set("title", "HTTP storage check"); form.set("note", "Temporary test memory"); form.set("date", "2026-10-12");
  form.set("image", new File([png], "check.png", { type: "image/png" }));
  const response = await fetch(`${base}/api/memories`, { method: "POST", body: form });
  assert.equal(response.status, 201, await response.clone().text());
  saved = await response.json();
  assert.equal(saved.id, id);
  const memories = await (await fetch(`${base}/api/memories`)).json();
  assert.ok(memories.some((item) => item.id === id));
  const photo = await fetch(`${base}/api/photos/${id}.png`);
  assert.equal(photo.status, 200);
  assert.equal(photo.headers.get("content-type"), "image/png");
  assert.deepEqual(Buffer.from(await photo.arrayBuffer()), png);
  const retry = await fetch(`${base}/api/memories`, { method: "POST", body: form });
  assert.equal((await retry.json()).id, id);
  assert.equal((await (await fetch(`${base}/api/memories`)).json()).filter((item) => item.id === id).length, 1);
  console.log("HTTP upload, JSON persistence, photo serving and retry passed.");
} finally {
  if (saved) {
    const records = JSON.parse(await readFile(jsonFile, "utf8"));
    const temporary = `${jsonFile}.${id}.tmp`;
    await writeFile(temporary, JSON.stringify(records.filter((item) => item.id !== id), null, 2) + "\n");
    await rename(temporary, jsonFile);
    await unlink(join(process.cwd(), "public", "uploads", `${id}.png`));
  }
}

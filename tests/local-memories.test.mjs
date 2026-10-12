import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { createMemoryStore, MemoryValidationError } from "../lib/local-memories.ts";

const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aV1sAAAAASUVORK5CYII=", "base64");
function form(id = randomUUID(), date = "2026-10-12") {
  const data = new FormData();
  data.set("id", id); data.set("title", "A memory"); data.set("note", "A long note\nSecond line"); data.set("date", date);
  data.set("image", new File([png], "../../photo.png", { type: "image/png" }));
  return data;
}
test("JSON storage persists images, serializes writes and deduplicates retries", async () => {
  const root = await mkdtemp(join(tmpdir(), "luvia-memories-"));
  try {
    const store = createMemoryStore(root);
    assert.deepEqual(await store.read(), []);
    const request = form();
    const saved = await store.save(request);
    assert.match(saved.image, /^\/uploads\/[0-9a-f-]+\.png$/);
    assert.deepEqual(await readFile(join(root, "public", saved.image)), png);
    assert.equal((await createMemoryStore(root).read())[0].note, "A long note\nSecond line");
    assert.equal((await store.save(request)).id, saved.id);
    await Promise.all([store.save(form(undefined, "2026-01-01")), store.save(form(undefined, "2026-02-01"))]);
    const records = await store.read();
    assert.equal(records.length, 3);
    assert.equal(records[0].date, "2026-01-01");
    assert.equal((await readdir(join(root, "public", "uploads"))).length, 3);
    assert.equal(JSON.parse(await readFile(join(root, "data", "memories.json"), "utf8")).length, 3);
  } finally { await rm(root, { recursive: true, force: true }); }
});
test("invalid input and corrupt JSON cannot overwrite stored memories", async () => {
  const root = await mkdtemp(join(tmpdir(), "luvia-memories-"));
  try {
    const store = createMemoryStore(root);
    await store.save(form());
    await assert.rejects(store.save(form(undefined, "2026-02-30")), MemoryValidationError);
    const invalid = form(); invalid.set("image", new File(["not an image"], "bad.png", { type: "image/png" }));
    await assert.rejects(store.save(invalid), MemoryValidationError);
    assert.equal((await store.read()).length, 1);
    const file = join(root, "data", "memories.json");
    await writeFile(file, "broken-json");
    await assert.rejects(store.save(form()));
    assert.equal(await readFile(file, "utf8"), "broken-json");
    assert.equal((await readdir(join(root, "public", "uploads"))).length, 1);
  } finally { await rm(root, { recursive: true, force: true }); }
});

import { mkdir, readFile, writeFile, rename, unlink } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import type { SavedMemory } from "./memories";

export class MemoryValidationError extends Error {}
export function createMemoryStore(root: string) {
  const directory = join(root, "data");
  const jsonFile = join(directory, "memories.json");
  const uploads = join(root, "public", "uploads");
  let queue: Promise<unknown> = Promise.resolve();
  async function read(): Promise<SavedMemory[]> {
    let text;
    try { text = await readFile(jsonFile, "utf8"); }
    catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return []; throw error; }
    const data = JSON.parse(text);
    if (!Array.isArray(data) || data.some((item) => !item || ["id", "title", "note", "date", "image", "createdAt"].some((key) => typeof item[key] !== "string"))) throw new Error("Invalid data/memories.json");
    return data.sort((a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id));
  }
  async function insert(form: FormData): Promise<SavedMemory> {
    const image = form.get("image");
    const id = String(form.get("id") ?? "");
    const title = String(form.get("title") ?? "").trim();
    const note = String(form.get("note") ?? "").trim();
    const date = String(form.get("date") ?? "");
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) throw new MemoryValidationError("Mã kỷ niệm không hợp lệ.");
    if (!title || title.length > 120 || note.length > 1200) throw new MemoryValidationError("Tiêu đề tối đa 120 ký tự, ghi chú tối đa 1200 ký tự.");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date)) || new Date(date).toISOString().slice(0, 10) !== date) throw new MemoryValidationError("Ngày kỷ niệm không hợp lệ.");
    if (!(image instanceof File) || image.size < 1 || image.size > 10 * 1024 * 1024) throw new MemoryValidationError("Chọn ảnh tối đa 10 MB.");
    const bytes = Buffer.from(await image.arrayBuffer());
    const extension = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff ? "jpg"
      : bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) ? "png"
      : bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP" ? "webp" : null;
    if (!extension || image.type !== ({ jpg: "image/jpeg", png: "image/png", webp: "image/webp" }[extension])) throw new MemoryValidationError("Chỉ nhận ảnh JPG, PNG hoặc WebP.");
    const data = await read();
    const existing = data.find((item) => item.id === id);
    if (existing) return existing;
    const filename = `${id}.${extension}`;
    const saved: SavedMemory = { id, title, note, date, image: `/uploads/${filename}`, createdAt: new Date().toISOString() };
    await mkdir(directory, { recursive: true });
    await mkdir(uploads, { recursive: true });
    const temporary = `${jsonFile}.${randomUUID()}.tmp`;
    await writeFile(join(uploads, filename), bytes, { flag: "wx" });
    try {
      // Replace atomically so a failed write cannot truncate existing memories.
      await writeFile(temporary, JSON.stringify([...data, saved], null, 2) + "\n", { flag: "wx" });
      await rename(temporary, jsonFile);
    } catch (error) {
      await Promise.allSettled([unlink(temporary), unlink(join(uploads, filename))]);
      throw error;
    }
    return saved;
  }
  return {
    read,
    save(form: FormData) {
      // Serialize writes for one local Node server to avoid lost updates.
      const result = queue.then(() => insert(form));
      queue = result.catch(() => {});
      return result;
    },
  };
}

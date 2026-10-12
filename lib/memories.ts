export type SavedMemory = { id: string; title: string; note: string; date: string; image: string; createdAt: string };
export function imageUrl(path: string) {
  return path.startsWith("/uploads/") ? `/api/photos/${encodeURIComponent(path.slice("/uploads/".length))}` : path;
}
export async function loadMemories(): Promise<SavedMemory[]> {
  const response = await fetch("/api/memories", { cache: "no-store" });
  if (!response.ok) throw new Error("Không thể đọc file kỷ niệm.");
  return response.json();
}
export async function saveMemory(file: File, values: { title: string; note: string; date: string }, id: string): Promise<SavedMemory> {
  const form = new FormData();
  form.set("image", file); form.set("id", id);
  for (const [key, value] of Object.entries(values)) form.set(key, value);
  const response = await fetch("/api/memories", { method: "POST", body: form });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error ?? "Không thể lưu kỷ niệm.");
  return result;
}

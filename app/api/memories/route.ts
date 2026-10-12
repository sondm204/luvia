import { createMemoryStore, MemoryValidationError } from "@/lib/local-memories";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const store = createMemoryStore(process.cwd());
export async function GET() {
  try { return Response.json(await store.read(), { headers: { "Cache-Control": "no-store" } }); }
  catch (error) { console.error("Read memories failed", error); return Response.json({ error: "Không thể đọc data/memories.json." }, { status: 500 }); }
}
export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return Response.json({ error: "Origin không hợp lệ." }, { status: 403 });
  if (Number(request.headers.get("content-length")) > 11 * 1024 * 1024) return Response.json({ error: "Ảnh quá lớn." }, { status: 413 });
  let form;
  try { form = await request.formData(); }
  catch { return Response.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 }); }
  try { return Response.json(await store.save(form), { status: 201 }); }
  catch (error) {
    if (error instanceof MemoryValidationError) return Response.json({ error: error.message }, { status: 400 });
    console.error("Save memory failed", error);
    return Response.json({ error: "Không thể ghi file kỷ niệm. Kiểm tra quyền ghi thư mục project." }, { status: 500 });
  }
}

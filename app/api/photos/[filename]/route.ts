import { readFile } from "node:fs/promises";
import { join } from "node:path";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(_request: Request, context: RouteContext<"/api/photos/[filename]">) {
  const { filename } = await context.params;
  if (!/^[a-zA-Z0-9_-]+\.(jpg|jpeg|png|webp)$/.test(filename)) return new Response(null, { status: 404 });
  try {
    const image = await readFile(join(process.cwd(), "public", "uploads", filename));
    const type = filename.endsWith(".png") ? "image/png" : filename.endsWith(".webp") ? "image/webp" : "image/jpeg";
    return new Response(image, { headers: { "Content-Type": type, "X-Content-Type-Options": "nosniff", "Cache-Control": "no-cache" } });
  } catch (error) { return new Response(null, { status: (error as NodeJS.ErrnoException).code === "ENOENT" ? 404 : 500 }); }
}

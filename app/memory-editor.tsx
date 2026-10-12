"use client";
import { ImagePlus, LoaderCircle, Plus, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { saveMemory, type SavedMemory } from "@/lib/memories";
export default function MemoryEditor({ onSaved, onClose }: { onSaved: (memory: SavedMemory) => void; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const submissionId = useRef<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState("");
  useEffect(() => { dialog.current?.showModal(); }, []);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    if (!file || !["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size < 1 || file.size > 10 * 1024 * 1024) { setError("Chọn ảnh JPG, PNG hoặc WebP, tối đa 10 MB."); return; }
    const values = new FormData(event.currentTarget);
    const title = String(values.get("title") ?? "").trim();
    if (!title) { setError("Hãy nhập tiêu đề."); return; }
    setBusy(true); setError("");
    submissionId.current ??= crypto.randomUUID();
    try { onSaved(await saveMemory(file, { title, note: String(values.get("note") ?? "").trim(), date: String(values.get("date")) }, submissionId.current)); onClose(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Không thể lưu kỷ niệm."); }
    finally { setBusy(false); }
  }
  return <dialog ref={dialog} className="memory-dialog" aria-labelledby="editor-title" onCancel={(event) => { event.preventDefault(); if (!busy) onClose(); }}>
    <form onSubmit={submit}>
      <header><h2 id="editor-title">Thêm kỷ niệm</h2><button type="button" className="icon-button" title="Đóng" aria-label="Đóng" onClick={onClose} disabled={busy}><X size={20} /></button></header>
      <label className="upload-field">{preview ? <Image src={preview} alt="Ảnh đã chọn" width={400} height={160} unoptimized /> : <ImagePlus size={32} />}<span>{file ? file.name : "Chọn ảnh"}</span><input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={(event) => { const next = event.target.files?.[0] ?? null; setFile(next); setPreview(next ? URL.createObjectURL(next) : ""); setError(""); }} /></label>
      <label>Tiêu đề<input name="title" required maxLength={120} disabled={busy} autoFocus /></label>
      <label>Ngày kỷ niệm<input type="date" name="date" required defaultValue={new Date().toLocaleDateString("en-CA")} disabled={busy} /></label>
      <label>Ghi chú<textarea name="note" rows={3} maxLength={1200} disabled={busy} /></label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <footer><button type="button" onClick={onClose} disabled={busy}>Hủy</button><button className="primary-button" disabled={busy} type="submit">{busy ? <LoaderCircle size={18} className="spin" /> : <Plus size={18} />}{busy ? "Đang lưu..." : "Lưu kỷ niệm"}</button></footer>
    </form>
  </dialog>;
}

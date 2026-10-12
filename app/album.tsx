"use client";

import Image from "next/image";
import { FlipBook, Page, type Book } from "@openpageflip/react";
import "@openpageflip/core/styles.css";
import { useEffect, useRef, useState } from "react";
import { Plus, RefreshCw, Expand, X } from "lucide-react";
import MemoryEditor from "./memory-editor";
import { imageUrl, loadMemories, type SavedMemory } from "@/lib/memories";

type Memory = { image: string; alt: string; title: string; note: string; date: string; className?: string };

function MemoryCard({ memory, index, onSelect }: { memory: Memory; index: number; onSelect: (memory: Memory) => void }) {
  return (
    <article className={`memory ${memory.className ?? ""}`} style={{ "--delay": `${index * 90}ms` } as React.CSSProperties}>
      <div className="photo-frame">
        <Image src={memory.image} alt={memory.alt} fill unoptimized sizes="(max-width: 700px) 42vw, 340px" />
        <span className="tape" aria-hidden="true" />
      </div>
      <div className="memory-copy"><p className="memory-date">{memory.date}</p><h2>{memory.title}</h2><p>{memory.note}</p></div>
      <button className="memory-expand icon-button" title="Xem kỷ niệm" aria-label={`Xem kỷ niệm: ${memory.title}`} onClick={(event) => { event.stopPropagation(); onSelect(memory); }}><Expand size={16} /></button>
    </article>
  );
}

function PaperPage({ memories, number, side, onSelect }: { memories: Memory[]; number: number; side: "left" | "right"; onSelect: (memory: Memory) => void }) {
  return (
    <div className={`paper-page paper-${side}`}>
      <span className="paper-grain" aria-hidden="true" />
      <div className="page-memories">{memories.map((memory, index) => <MemoryCard key={`${memory.image}-${index}`} memory={memory} index={index} onSelect={onSelect} />)}</div>
      <span className="page-number">— {number} —</span>
    </div>
  );
}

function AlbumCover({ back = false }: { back?: boolean }) {
  return (
    <div className={`album-cover ${back ? "album-cover-back" : ""}`}>
      <span className="cover-border" />
      <span className="cover-flower" aria-hidden="true">✣</span>
      {!back && <><span className="cover-kicker">Kỷ niệm của</span><strong>Chúng Mình</strong><span className="cover-year">2023 — 2026</span><span className="cover-hint">kéo góc bìa để mở</span></>}
      {back && <><strong>Hẹn những<br />ngày sau</strong><span className="cover-year">— hết một chương —</span></>}
    </div>
  );
}

function MemoryViewer({ memory, onClose }: { memory: Memory; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { dialog.current?.showModal(); }, []);
  return <dialog ref={dialog} className="memory-dialog memory-viewer" aria-labelledby="memory-title" onCancel={(event) => { event.preventDefault(); onClose(); }}>
    <header><h2 id="memory-title">{memory.title}</h2><button className="icon-button" title="Đóng" aria-label="Đóng" onClick={onClose}><X size={20} /></button></header>
    <Image src={memory.image} alt={memory.alt} width={800} height={600} unoptimized />
    <p className="memory-date">{memory.date}</p><p className="full-note">{memory.note}</p>
  </dialog>;
}

export default function Album() {
  const book = useRef<Book>(null);
  const [page, setPage] = useState(0);
  const [memories, setMemories] = useState<SavedMemory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState<Memory | null>(null);
  const [reload, setReload] = useState(0);
  useEffect(() => {
    let active = true;
    loadMemories().then((data) => { if (active) setMemories(data); }).catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : "Không tải được kỷ niệm."); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [reload]);
  const sheets = Array.from({ length: Math.ceil(memories.length / 4) }, (_, index) => {
    const items: Memory[] = memories.slice(index * 4, index * 4 + 4).map((memory, offset) => ({
      image: imageUrl(memory.image), alt: memory.title, title: memory.title, note: memory.note,
      date: new Date(`${memory.date}T00:00:00`).toLocaleDateString("vi-VN"),
      className: offset % 2 === 0 ? "memory-large tilt-left" : "memory-small tilt-right",
    }));
    return { label: `Kỷ niệm ${index + 1}`, front: items.slice(0, 2), back: items.slice(2, 4) };
  });
  const pageCount = sheets.length * 2 + 2;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (editing || selected || event.target instanceof HTMLElement && event.target.closest("input, textarea, select, button, [contenteditable]")) return;
      if (event.key === "ArrowLeft") void book.current?.flipPrev();
      if (event.key === "ArrowRight" || event.key === "Enter") void book.current?.flipNext();
      if (event.key === "Escape") void book.current?.flipTo(0);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [editing, selected]);

  const sheetIndex = Math.max(0, Math.min(sheets.length - 1, Math.floor((page - 1) / 2)));
  const spreadLabel = page === 0 ? "Bìa trước" : page >= pageCount - 1 ? "Bìa sau" : sheets[sheetIndex]?.label ?? "Kỷ niệm";

  return (
    <main className="album-stage">
      <div className="memory-toolbar"><button className="add-memory" disabled={loading || Boolean(error)} onClick={() => setEditing(true)}><Plus size={18} />Thêm kỷ niệm</button></div>
      {(loading || error || memories.length === 0) && <div className="storage-status" role="status">
        {loading ? "Đang tải kỷ niệm..." : error ? <>Không tải được kỷ niệm. <button className="icon-button" title="Thử lại" aria-label="Thử lại" onClick={() => { setLoading(true); setError(""); setReload((value) => value + 1); }}><RefreshCw size={16} /></button></> : "Chưa có kỷ niệm"}
      </div>}
      {editing && <MemoryEditor onClose={() => setEditing(false)} onSaved={(memory) => { setMemories((values) => [...values.filter((item) => item.id !== memory.id), memory].sort((a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id))); setPage(0); }} />}
      {selected && <MemoryViewer memory={selected} onClose={() => setSelected(null)} />}
      <div className="ambient-light" aria-hidden="true" />
      <section className="book-wrap" aria-label="Album kỷ niệm tương tác">
        <div className="book-shadow" aria-hidden="true" />
        <FlipBook key={memories.map((memory) => memory.id).join("-")} ref={book} className={`memory-book memory-book-framed ${page === 0 ? "memory-book-front-cover" : page >= pageCount - 1 ? "memory-book-back-cover" : "memory-book-spread"}`} width={520} height={640} size="stretch" minWidth={280} maxWidth={560} layout="auto" cover flipDuration={950} shadowOpacity={0.45} click="edges" drag swipe hover onFlip={({ page: nextPage }) => setPage(nextPage)}>
          <Page density="hard" className="book-page cover-page"><AlbumCover /></Page>
          {sheets.flatMap((sheet, index) => [
            <Page className="book-page paper-leaf" key={`${sheet.label}-front`}><PaperPage memories={sheet.front} number={index * 2 + 1} side="right" onSelect={setSelected} /></Page>,
            <Page className="book-page paper-leaf" key={`${sheet.label}-back`}><PaperPage memories={sheet.back} number={index * 2 + 2} side="left" onSelect={setSelected} /></Page>,
          ])}
          <Page density="hard" className="book-page cover-page"><AlbumCover back /></Page>
        </FlipBook>
      </section>
      <nav className="album-controls" aria-label="Điều khiển album">
        <button onClick={() => void book.current?.flipPrev()} disabled={page === 0} aria-label="Trang trước">←</button>
        <div className="progress-wrap"><span className="spread-label" aria-live="polite">{spreadLabel}</span><div className="progress-dots" aria-hidden="true">{Array.from({ length: pageCount }, (_, index) => <span className={index === page ? "active" : ""} key={index} />)}</div></div>
        <button onClick={() => void book.current?.flipNext()} disabled={page >= pageCount - 1} aria-label="Trang sau">→</button>
      </nav>
      <p className="keyboard-hint">Kéo mép giấy, vuốt hoặc dùng phím mũi tên · ESC để về bìa</p>
    </main>
  );
}

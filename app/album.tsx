"use client";

import Image from "next/image";
import { FlipBook, Page, type Book } from "@openpageflip/react";
import "@openpageflip/core/styles.css";
import { useEffect, useRef, useState } from "react";

type Memory = { image: string; alt: string; title: string; note: string; date: string; className?: string };

const sheets: { label: string; front: Memory[]; back: Memory[] }[] = [
  {
    label: "Mùa hè đầu tiên",
    front: [
      { image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=85", alt: "Bờ biển xanh dưới nắng", title: "Ngày mình ra biển", note: "Chúng mình đã chạy chân trần đến khi trời chuyển màu mật ong.", date: "18.06.2023", className: "memory-large tilt-left" },
      { image: "https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=800&q=85", alt: "Cây xanh trong nắng", title: "Con đường đầy nắng", note: "Một lối rẽ ngẫu nhiên, một buổi chiều không thể quên.", date: "19.06.2023", className: "memory-small tilt-right" },
    ],
    back: [
      { image: "https://images.unsplash.com/photo-1511988617509-a57c8a288659e?auto=format&fit=crop&w=900&q=85", alt: "Hai người bạn vui vẻ bên nhau", title: "Nụ cười hôm ấy", note: "Ảnh hơi rung, nhưng niềm vui thì rõ ràng hơn bao giờ hết.", date: "02.09.2023", className: "memory-wide tilt-right" },
      { image: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=85", alt: "Khu rừng yên tĩnh", title: "Trốn vào rừng", note: "Mùi lá ẩm và tiếng bước chân rất khẽ.", date: "03.09.2023", className: "memory-small tilt-left" },
    ],
  },
  {
    label: "Những chuyến đi",
    front: [
      { image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1000&q=85", alt: "Hồ nước giữa núi", title: "Chạm vào mây", note: "Đi thật xa để biết điều mình muốn nhớ nhất vẫn là người bên cạnh.", date: "12.12.2023", className: "memory-large tilt-right" },
      { image: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=800&q=85", alt: "Hoàng hôn trên đồng cỏ", title: "Chiều không vội", note: "Chúng mình ngồi yên nghe nắng tắt.", date: "13.12.2023", className: "memory-small tilt-left" },
    ],
    back: [
      { image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=85", alt: "Núi tuyết dưới trời sao", title: "Đêm đầy sao", note: "Lạnh đến run tay, vậy mà chẳng ai muốn về.", date: "14.12.2023", className: "memory-wide tilt-left" },
      { image: "https://images.unsplash.com/photo-1516972810927-80185027ca84?auto=format&fit=crop&w=700&q=85", alt: "Bữa tối ấm cúng", title: "Bữa tối muộn", note: "Một chiếc bàn nhỏ, những câu chuyện thật dài.", date: "15.12.2023", className: "memory-small tilt-right" },
    ],
  },
  {
    label: "Ngày bình thường",
    front: [
      { image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=85", alt: "Tách cà phê cạnh cửa sổ", title: "Quán quen góc phố", note: "Vẫn chiếc bàn cạnh cửa sổ, vẫn hai ly như mọi lần.", date: "07.04.2024", className: "memory-large tilt-left" },
      { image: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=800&q=85", alt: "Căn phòng ấm áp", title: "Một ngày ở nhà", note: "Hạnh phúc đôi khi chỉ là chẳng cần đi đâu cả.", date: "21.04.2024", className: "memory-small tilt-right" },
    ],
    back: [
      { image: "https://images.unsplash.com/photo-1504198322253-cfa87a0ff25f?auto=format&fit=crop&w=1000&q=85", alt: "Hai người đứng dưới bầu trời chiều", title: "Và còn nhiều nữa...", note: "Chúng mình vẫn đang viết tiếp cuốn album này — từng ngày một.", date: "Hôm nay", className: "memory-finale tilt-right" },
    ],
  },
];

function MemoryCard({ memory, index }: { memory: Memory; index: number }) {
  return (
    <article className={`memory ${memory.className ?? ""}`} style={{ "--delay": `${index * 90}ms` } as React.CSSProperties}>
      <div className="photo-frame">
        <Image src={memory.image} alt={memory.alt} fill sizes="(max-width: 700px) 42vw, 340px" />
        <span className="tape" aria-hidden="true" />
      </div>
      <div className="memory-copy"><p className="memory-date">{memory.date}</p><h2>{memory.title}</h2><p>{memory.note}</p></div>
    </article>
  );
}

function PaperPage({ memories, number, side }: { memories: Memory[]; number: number; side: "left" | "right" }) {
  return (
    <div className={`paper-page paper-${side}`}>
      <span className="paper-grain" aria-hidden="true" />
      <div className="page-memories">{memories.map((memory, index) => <MemoryCard key={memory.title} memory={memory} index={index} />)}</div>
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

export default function Album() {
  const book = useRef<Book>(null);
  const [page, setPage] = useState(0);
  const pageCount = sheets.length * 2 + 2;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") void book.current?.flipPrev();
      if (event.key === "ArrowRight" || event.key === "Enter") void book.current?.flipNext();
      if (event.key === "Escape") void book.current?.flipTo(0);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const sheetIndex = Math.max(0, Math.min(sheets.length - 1, Math.floor((page - 1) / 2)));
  const spreadLabel = page === 0 ? "Bìa trước" : page >= pageCount - 1 ? "Bìa sau" : sheets[sheetIndex].label;

  return (
    <main className="album-stage">
      <div className="ambient-light" aria-hidden="true" />
      <section className="book-wrap" aria-label="Album kỷ niệm tương tác">
        <div className="book-shadow" aria-hidden="true" />
        <FlipBook ref={book} className={`memory-book memory-book-framed ${page === 0 ? "memory-book-front-cover" : page >= pageCount - 1 ? "memory-book-back-cover" : "memory-book-spread"}`} width={520} height={640} size="stretch" minWidth={280} maxWidth={560} layout="auto" cover flipDuration={950} shadowOpacity={0.45} click="edges" drag swipe hover onFlip={({ page: nextPage }) => setPage(nextPage)}>
          <Page density="hard" className="book-page cover-page"><AlbumCover /></Page>
          {sheets.flatMap((sheet, index) => [
            <Page className="book-page paper-leaf" key={`${sheet.label}-front`}><PaperPage memories={sheet.front} number={index * 2 + 1} side="right" /></Page>,
            <Page className="book-page paper-leaf" key={`${sheet.label}-back`}><PaperPage memories={sheet.back} number={index * 2 + 2} side="left" /></Page>,
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

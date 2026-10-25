"use client";

import { useState } from "react";
import { Loader } from "./loader";

const STICKERS = ["/assets/Images/mapinly.png", "/assets/Images/bountydesk.png", "/assets/Images/poinu.png", "/assets/Images/portfolio.png"];

export default function LoaderDemo() {
  const [run, setRun] = useState(0);
  const [handoff, setHandoff] = useState(false);
  const [stickers, setStickers] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const replay = () => {
    setRevealed(false);
    setRun((n) => n + 1);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="relative h-80 overflow-hidden rounded-xl border border-neutral-300 bg-neutral-100 md:h-[28rem]">
        {/* the "page" underneath: starts from a centred square, which is what a handoff continues from */}
        <div className="absolute inset-0 grid place-items-center">
          <div
            className="grid place-items-center overflow-hidden bg-black text-sm text-white transition-[width,height,border-radius] duration-700 ease-snappy"
            style={{ width: revealed ? 220 : 8, height: revealed ? 140 : 8, borderRadius: revealed ? 12 : 0 }}
          >
            {revealed && <span className="animate-pulse">Your page</span>}
          </div>
        </div>
        <Loader key={run} contained handoff={handoff} stickers={stickers ? STICKERS : []} onReveal={() => setRevealed(true)} />
      </div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
        <button type="button" onClick={replay} className="rounded-full bg-black px-5 py-2 text-white transition-opacity hover:opacity-80">
          Replay
        </button>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={handoff} onChange={(e) => setHandoff(e.target.checked)} />
          handoff
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={stickers} onChange={(e) => setStickers(e.target.checked)} />
          stickers
        </label>
      </div>
    </div>
  );
}

import { CursorFollower } from "./cursor-follower";

// the portfolio's Projects heading: the dot grows over it and inverts the type underneath
export default function CursorFollowerDemo() {
  return (
    <div className="relative grid h-64 w-96 place-items-center overflow-hidden rounded-2xl">
      <CursorFollower />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/demo/dunes.jpg" alt="" className="absolute inset-0 size-full object-cover" />
      <div className="relative rounded-2xl bg-background px-10 py-8 text-center text-foreground">
        <h2 data-cursor-scale="8" className="text-5xl italic">Projects</h2>
        <p className="mt-3 text-sm text-muted-foreground">Design is thinking made visual. — Saul Bass</p>
      </div>
    </div>
  );
}

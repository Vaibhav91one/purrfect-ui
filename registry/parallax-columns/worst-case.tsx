// Dev-only fixture (not in registry.json, never installed): the realistic worst props for ParallaxColumns, shown at /dev?c=parallax-columns.
import type { ReactNode } from "react";
import { ParallaxColumns } from "./parallax-columns";

const tile = (n: number) => <div key={n} className="grid aspect-[3/4] place-items-center rounded-2xl bg-muted text-2xl">{n}</div>;
const col = (from: number, count: number) => Array.from({ length: count }, (_, i) => tile(from + i));
const page = (node: ReactNode) => <div className="py-[60svh]">{node}</div>;

export const states: Record<string, ReactNode> = {
  Demo: page(<ParallaxColumns columns={[col(1, 3), col(4, 3), col(7, 3)]} />),
  "Worst case": page(
    <div className="flex flex-col gap-[40svh]">
      <ParallaxColumns columns={[col(1, 12), col(13, 2), col(15, 7)]} />
      <ParallaxColumns columns={[col(1, 3), col(4, 3), col(7, 3), col(10, 3), col(13, 3)]} speeds={[0.3, 0.1]} />
      <ParallaxColumns columns={[col(1, 4)]} />
      <ParallaxColumns columns={[[], col(1, 3), []]} />
    </div>,
  ),
  Empty: page(<ParallaxColumns columns={[]} />),
};

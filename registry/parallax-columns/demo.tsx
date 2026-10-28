import { ParallaxColumns } from "./parallax-columns";

const tile = (n: number) => <div key={n} className="grid aspect-[3/4] place-items-center rounded-2xl bg-muted text-2xl">{n}</div>;

export default function ParallaxColumnsDemo() {
  return <ParallaxColumns columns={[[1, 2, 3].map(tile), [4, 5, 6].map(tile), [7, 8, 9].map(tile)]} />;
}

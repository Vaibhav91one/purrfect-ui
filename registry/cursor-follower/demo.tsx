import { CursorFollower } from "./cursor-follower";

// a heading: the dot grows over it and inverts the type underneath
export default function CursorFollowerDemo() {
  return (
    <div className="relative grid h-64 w-96 place-items-center overflow-hidden rounded-2xl">
      <CursorFollower />
      <h2 data-cursor-scale="8" className="relative text-5xl italic text-foreground">Follow me</h2>
    </div>
  );
}

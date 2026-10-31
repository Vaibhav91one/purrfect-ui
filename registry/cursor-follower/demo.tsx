import { CursorFollower } from "./cursor-follower";

export default function CursorFollowerDemo() {
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <CursorFollower />
      <p className="text-4xl font-medium">Move the mouse</p>
      <a href="#hello" data-cursor-scale="4" className="rounded-full border border-foreground px-6 py-3">
        Hover me: it grows
      </a>
    </div>
  );
}

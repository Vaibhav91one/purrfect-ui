import { cn } from "@/lib/utils";
import { PixelWave } from "./pixel-wave";

// Just the loader, drawn large and centred
// playing/speed come from the gallery's Pause and Speed controls; the !important class beats the loops' own play state
export default function PixelWaveDemo({ playing, speed = 1 }: { playing?: boolean; speed?: number }) {
  return (
    <div className={cn("grid h-[240px] w-[240px] place-items-center", playing === false && "[&_*]:![animation-play-state:paused]")}>
      <PixelWave size={20} gap={5} duration={0.65 / speed} stagger={0.09 / speed} className="text-foreground" aria-label="Loading" />
    </div>
  );
}

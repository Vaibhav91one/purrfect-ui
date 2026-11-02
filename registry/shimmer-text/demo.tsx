import { cn } from "@/lib/utils";
import { ShimmerText } from "./shimmer-text";

// Armour's listening pill: a dark pill, the label shimmering while it listens
// playing/speed come from the gallery's Pause and Speed controls; the !important class beats the loop's inline play state
export default function ShimmerTextDemo({ playing, speed = 1 }: { playing?: boolean; speed?: number }) {
  return (
    <div className={cn("relative grid h-[300px] w-[420px] place-items-center overflow-hidden rounded-3xl", playing === false && "[&_*]:![animation-play-state:paused]")}>
      {/* .dark scopes the tokens, so the pill stays dark with a light band in either theme, like the original */}
      <div className="dark relative rounded-full bg-card px-5 py-2 shadow-lg">
        <ShimmerText duration={2.8 / speed} className="text-base">
          <span className="font-semibold">Armour</span> is listening
        </ShimmerText>
      </div>
    </div>
  );
}

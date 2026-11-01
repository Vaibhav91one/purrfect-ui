/* eslint-disable @next/next/no-img-element */
import { VoiceBars } from "./voice-bars";

// Armour's "Multi-channel" feature card: the brand orb (a mesh gradient on the site) with the voice meter under it
const ORB =
  "radial-gradient(circle at 72% 22%, #fff 0 12%, transparent 34%), radial-gradient(circle at 62% 46%, #ff0000aa, transparent 45%), radial-gradient(circle at 20% 40%, #e38810cc, transparent 60%), linear-gradient(135deg, #e38810, #f39db2 55%, #ff3b2f)";

export default function VoiceBarsDemo() {
  return (
    <div className="relative grid h-[640px] w-[600px] place-items-center overflow-hidden rounded-3xl">
      <img src="/demo/dunes.jpg" alt="" className="absolute inset-0 size-full object-cover" />
      <div className="relative flex h-[480px] w-[448px] flex-col overflow-hidden rounded-xl bg-card text-card-foreground shadow-lg">
        <div className="px-6 pt-6">
          <div className="mx-auto grid size-70 place-items-center p-8">
            <div className="size-full rounded-full" style={{ background: ORB }} />
          </div>
          <VoiceBars className="text-foreground" />
        </div>
        <div className="mt-auto p-6">
          <h2 className="text-3xl font-normal text-foreground">Multi-channel</h2>
        </div>
      </div>
    </div>
  );
}

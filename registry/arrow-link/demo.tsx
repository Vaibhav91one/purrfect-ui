/* eslint-disable @next/next/no-img-element */
import { ArrowLink } from "./arrow-link";

export default function ArrowLinkDemo() {
  return (
    <div className="relative h-[180px] w-[480px] overflow-hidden rounded-2xl">
      <img src="/demo/coast.jpg" alt="" className="absolute inset-0 size-full object-cover" />
      <div className="absolute inset-4 grid place-items-center rounded-xl bg-background text-foreground shadow-xl">
        <ArrowLink href="#next">Mapinly</ArrowLink>
      </div>
    </div>
  );
}

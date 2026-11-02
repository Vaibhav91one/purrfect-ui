import { SwapCard } from "./swap-card";

// eslint-disable-next-line @next/next/no-img-element -- a registry demo cannot assume next/image
const photo = (name: string) => <img src={`/demo/${name}.jpg`} alt="" className="size-full object-cover" />;

// one product card from the Poinu shop (the site clip shows the whole grid); `hover` holds its hover state for a looping demo
export default function SwapCardDemo({ hover }: { hover?: boolean }) {
  return (
    <div className="grid h-[528px] w-[720px] place-items-center text-sm text-foreground">
      <SwapCard image={photo("coast")} hoverImage={photo("fjord")} title="Low tide" subtitle="Giclée print" className="w-[320px]" data-hover={hover || undefined} />
    </div>
  );
}

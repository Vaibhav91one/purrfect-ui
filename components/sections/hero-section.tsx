import { ArrowRight } from "lucide-react";
import { GradientCat } from "@/components/gallery/gradient-cat";
import { RotatingInstall } from "@/components/gallery/rotating-install";
import { Button } from "@/registry/button/button";
import { sectionClasses } from "@/lib/layout-classes";

export function HeroSection() {
  return (
    <section id="hero" className={`${sectionClasses} items-center justify-center overflow-x-clip px-6 pt-24 pb-12 text-center md:px-8 md:pt-32 lg:px-12`}>
      <h1 style={{ "--d": "0ms" } as React.CSSProperties} className="intro-item max-w-[16ch] pb-1 text-5xl font-light tracking-[-0.05em] sm:text-7xl lg:text-8xl">UI that purrs.</h1>
      <div style={{ "--d": "150ms" } as React.CSSProperties} className="intro-item relative isolate mt-10 mb-6 grid h-44 place-items-center sm:h-56">
        {/* Milky Way: a soft tilted band of colour and a few stars, centred on the cat only */}
        <div aria-hidden className="galaxy pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[150%] w-[330%] " style={{ opacity: "var(--glow)" }}>
          <div className="absolute inset-0 blur-2xl" style={{ background: "radial-gradient(ellipse 50% 30% at 50% 50%, #ec4899 0%, #7c3aed 35%, #312e81 65%, transparent 100%)" }} />
          <div className="absolute inset-x-[15%] top-[46%] h-[8%] bg-[#c4b5fd] opacity-60 blur-xl" />
          <i className="star star-tw" style={{ left: "35.2%", top: "36.0%", width: 1, height: 1, animationDelay: "0.0s" }} />
          <i className="star" style={{ left: "14.1%", top: "51.4%", width: 1.5, height: 1.5, animationDelay: "-0.7s" }} />
          <i className="star" style={{ left: "57.0%", top: "66.4%", width: 1, height: 1, animationDelay: "-1.4s" }} />
          <i className="star" style={{ left: "11.1%", top: "47.3%", width: 1, height: 1, animationDelay: "-2.1s" }} />
          <i className="star" style={{ left: "28.2%", top: "52.0%", width: 1, height: 1, animationDelay: "-2.8s" }} />
          <i className="star star-tw" style={{ left: "77.5%", top: "35.0%", width: 1, height: 1, animationDelay: "-3.5s" }} />
          <i className="star" style={{ left: "61.0%", top: "53.3%", width: 1, height: 1, animationDelay: "-4.2s" }} />
          <i className="star" style={{ left: "56.5%", top: "45.9%", width: 1, height: 1, animationDelay: "-4.9s" }} />
          <i className="star" style={{ left: "11.9%", top: "64.3%", width: 1.5, height: 1.5, animationDelay: "-5.6s" }} />
          <i className="star" style={{ left: "43.2%", top: "51.6%", width: 1.5, height: 1.5, animationDelay: "-6.3s" }} />
          <i className="star star-tw" style={{ left: "55.1%", top: "57.3%", width: 1, height: 1, animationDelay: "-7.0s" }} />
          <i className="star" style={{ left: "56.9%", top: "55.6%", width: 1.5, height: 1.5, animationDelay: "-7.7s" }} />
          <i className="star" style={{ left: "16.2%", top: "58.5%", width: 1, height: 1, animationDelay: "-8.4s" }} />
          <i className="star" style={{ left: "60.0%", top: "49.9%", width: 2, height: 2, animationDelay: "-9.1s" }} />
          <i className="star" style={{ left: "73.3%", top: "48.6%", width: 2, height: 2, animationDelay: "-9.8s" }} />
          <i className="star star-tw" style={{ left: "38.4%", top: "39.9%", width: 1, height: 1, animationDelay: "-10.5s" }} />
        </div>
        <GradientCat />
      </div>
      <p style={{ "--d": "300ms" } as React.CSSProperties} className="intro-item max-w-[46ch] text-lg text-muted-foreground">React components that wiggle, stretch and snap back. One file each. Copy, paste, play.</p>
      <div style={{ "--d": "450ms" } as React.CSSProperties} className="intro-item mt-8 flex w-full max-w-3xl flex-wrap items-center justify-center gap-3">
        <div className="min-w-0 flex-1 basis-80">
          <RotatingInstall />
        </div>
        <Button href="/components" cue="navigate" icon={<ArrowRight className="size-4" />} iconPosition="end" className="h-12 px-6 text-[15px]">
          Browse components
        </Button>
      </div>
    </section>
  );
}

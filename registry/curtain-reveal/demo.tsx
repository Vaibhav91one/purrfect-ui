import { CurtainReveal } from "./curtain-reveal";

export default function CurtainRevealDemo() {
  return (
    <div className="w-full">
      <section className="grid h-[60svh] place-items-center bg-background text-3xl">Scroll down</section>
      <CurtainReveal height="60svh" className="grid place-items-center">
        <p className="text-4xl font-medium">Let&apos;s work together</p>
      </CurtainReveal>
    </div>
  );
}

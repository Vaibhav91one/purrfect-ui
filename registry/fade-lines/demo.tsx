import { FadeLines } from "./fade-lines";

export default function FadeLinesDemo() {
  return (
    <div className="grid h-[300px] w-[560px] place-items-center overflow-hidden rounded-3xl px-10">
      <FadeLines className="text-2xl leading-snug tracking-tight text-foreground" text="Helping brands thrive in the digital world. Every line fades in after the last as the text scrolls into view." />
    </div>
  );
}

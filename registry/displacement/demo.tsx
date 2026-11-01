"use client";

import { useEffect, useState, type ComponentProps } from "react";
import { Displacement } from "./displacement";

/** Displacement over a painted word. A client component, because `paint` is a function and cannot cross from the server. */
export function Painted({ word, fill, ...props }: { word: string; fill?: string } & Omit<ComponentProps<typeof Displacement>, "paint">) {
  // Displacement paints once per mount and resize: remount it when the notch flips the `dark` class, so the colours follow
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const html = document.documentElement;
    const read = () => setDark(html.classList.contains("dark"));
    read();
    const mo = new MutationObserver(read);
    mo.observe(html, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, []);
  const paint = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    // read the theme's colours, so it follows light and dark
    const css = getComputedStyle(document.documentElement);
    ctx.fillStyle = fill ?? (css.getPropertyValue("--foreground") || "#000");
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = fill ? "#fff" : css.getPropertyValue("--background") || "#fff";
    ctx.font = `600 ${Math.round(Math.min(h * 0.3, w * 0.12))}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(word, w / 2, h / 2);
  };
  return <Displacement key={dark ? "dark" : "light"} paint={paint} alt={word} {...props} />;
}

// the portfolio's hero: the photo bends under the pointer, with the role list resting on top
export default function DisplacementDemo() {
  return (
    <div className="relative h-[340px] w-[600px] overflow-hidden rounded-3xl">
      <Displacement src="/demo/jellyfish.jpg" alt="A jellyfish" className="absolute inset-0" />
      {/* check-ignore: hardcoded-color white type over a photo, in either theme */}
      <ul className="pointer-events-none absolute top-1/2 right-8 grid -translate-y-1/2 gap-1 text-lg text-white">
        <li>Design Engineer</li>
        <li>Software Developer</li>
        <li>Freelancer</li>
      </ul>
    </div>
  );
}

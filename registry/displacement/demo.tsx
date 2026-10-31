"use client";

import type { ComponentProps } from "react";
import { Displacement } from "./displacement";

/** Displacement over a painted word. A client component, because `paint` is a function and cannot cross from the server. */
export function Painted({ word, fill, ...props }: { word: string; fill?: string } & Omit<ComponentProps<typeof Displacement>, "paint">) {
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
  return <Displacement paint={paint} alt={word} {...props} />;
}

export default function DisplacementDemo() {
  return <Painted word="Move me" className="h-72 w-full max-w-xl rounded-3xl" />;
}

// Looks for the cat: the four gradient blob colours, the shade behind them, and the shape of the eye cut out of it.
export type EyeKind = "round" | "wide" | "sleepy" | "happy" | "wink";
export type CatVariant = { blobs: [string, string, string, string]; base: string; eye: EyeKind };

export const VARIANTS: CatVariant[] = [
  { blobs: ["#f97316", "#6366f1", "#10b981", "#ec4899"], base: "#1e1b4b", eye: "round" }, // sunset (the original)
  { blobs: ["#06b6d4", "#3b82f6", "#a78bfa", "#2dd4bf"], base: "#0c1a3a", eye: "wide" }, // ocean
  { blobs: ["#f472b6", "#c084fc", "#fb7185", "#fbbf24"], base: "#3b0a45", eye: "happy" }, // candy
  { blobs: ["#84cc16", "#22c55e", "#facc15", "#14b8a6"], base: "#052e16", eye: "sleepy" }, // forest
  { blobs: ["#fbbf24", "#f97316", "#ef4444", "#fde68a"], base: "#3a1604", eye: "wink" }, // ember
];

/** Eye shapes in the sitting cat's coordinates (the visible eye sits at about 74,84). Filled shapes and strokes are both drawn black in the mask. */
export const EYES: Record<EyeKind, { d: string; stroke?: number }> = {
  round: { d: "M70 84 a4 3 0 1 0 8 0 a4 3 0 1 0 -8 0Z" },
  wide: { d: "M69 84 a5 4.5 0 1 0 10 0 a5 4.5 0 1 0 -10 0Z" },
  sleepy: { d: "M69.5 84.5 h9 a1.5 1.5 0 0 1 0 3 h-9 a1.5 1.5 0 0 1 0 -3Z" },
  happy: { d: "M69.5 87 Q74 80 78.5 87", stroke: 2.6 },
  wink: { d: "M69.5 83 L78.5 85.5 L69.5 88", stroke: 2.4 },
};

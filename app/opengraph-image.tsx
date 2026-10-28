import { ImageResponse } from "next/og";

export const alt = "purrfect ui: animated React components with sound";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 96, background: "#000", color: "#fff" }}>
        <div style={{ fontSize: 120, fontWeight: 300, letterSpacing: -6 }}>purrfect ui</div>
        <div style={{ marginTop: 24, fontSize: 40, color: "#a3a3a3", maxWidth: 900 }}>Animated React components with sound, built from real projects.</div>
        <div style={{ marginTop: 56, fontSize: 28, color: "#737373" }}>purrfectui.com</div>
      </div>
    ),
    size,
  );
}

"use client";

import { useEffect, useRef, type ComponentProps } from "react";
import { cn } from "@/lib/utils";

export interface DisplacementProps extends Omit<ComponentProps<"div">, "children" | "ref"> {
  /** The image to distort. Same-origin or served with CORS, or WebGL cannot read it (the plain image still shows). */
  src?: string;
  alt?: string;
  /** Or draw what gets distorted yourself, on a 2D canvas in CSS pixels. Called on mount and on every resize. */
  paint?: (ctx: CanvasRenderingContext2D, width: number, height: number) => void;
  /** Size of the area around the pointer that bends, as a share of the shorter side. */
  radius?: number;
  /** How far pixels are dragged along with the pointer. 0 turns it off. */
  strength?: number;
  /** How far apart the red and blue channels split along the drag, 0 to 1. */
  aberration?: number;
  /** Film grain over the moving area, 0 to 1. */
  grain?: number;
}

const VERT = `#version 300 es
out vec2 uv;
void main() {
  vec2 p = vec2(gl_VertexID & 1, gl_VertexID >> 1) * 2.0; // one triangle that covers the screen
  uv = p;
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

const FRAG = `#version 300 es
precision highp float;
in vec2 uv;
out vec4 color;
uniform sampler2D tex;
uniform vec2 res, texSize, trail, lag;
uniform float radius, strength, aberration, grain, seed;
float noise(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233)) + seed) * 43758.5453); }
void main() {
  vec2 px = uv * res;
  float r = radius * min(res.x, res.y);
  vec2 off = px - trail;
  float fall = exp(-dot(off, off) / (r * r));            // 1 at the trail point, fading out smoothly
  vec2 drag = -lag / res * fall * strength;              // sample from behind the pointer: the picture is pulled along
  float ra = res.x / res.y, ta = texSize.x / texSize.y;  // object-fit: cover
  vec2 fit = ra > ta ? vec2(1.0, ta / ra) : vec2(ra / ta, 1.0);
  vec2 st = (uv - 0.5) * fit + 0.5;
  vec4 g = texture(tex, st + drag);
  float red = texture(tex, st + drag * (1.0 + aberration)).r;
  float blue = texture(tex, st + drag * (1.0 - aberration)).b;
  float amount = min(1.0, length(lag) / r) * fall;
  color = vec4(vec3(red, g.g, blue) + (noise(px) - 0.5) * grain * amount, g.a);
}`;

const K = 90; // trail spring stiffness; damping is critical, so it settles without wobbling

/**
 * An image (or anything you paint) that bends around the pointer like wet glass: a trail point follows the pointer on a
 * spring, the gap between them drags the pixels nearby, and the red and blue channels split along the drag with a little
 * grain. WebGL2, one full-screen triangle, no dependencies. It only draws while the trail is moving and stops while off
 * screen, so a still page costs nothing; props are read live. If WebGL2 is missing or the context is lost, the plain
 * image (or your painted canvas) shows instead. Reduced motion: the plain image, no bending.
 */
export function Displacement({ src, alt = "", paint, radius = 0.22, strength = 0.6, aberration = 0.5, grain = 0.08, className, ...rest }: DisplacementProps) {
  const root = useRef<HTMLDivElement>(null);
  const flat = useRef<HTMLCanvasElement>(null); // the 2D canvas: what `paint` draws, the texture, and the fallback
  const gl = useRef<HTMLCanvasElement>(null);
  const live = useRef({ paint, radius, strength, aberration, grain });
  useEffect(() => {
    live.current = { paint, radius, strength, aberration, grain };
  });

  useEffect(() => {
    const box = root.current, c2d = flat.current, cgl = gl.current;
    if (!box || !c2d || !cgl) return;
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    let stop = () => {};
    let img: HTMLImageElement | null = null;
    let glResize = () => {};
    // the 2D canvas is drawn whether or not WebGL runs: it is the fallback, and the texture when `paint` is used
    const paintFlat = () => {
      const r = box.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1);
      c2d.width = Math.max(1, Math.round(r.width * dpr));
      c2d.height = Math.max(1, Math.round(r.height * dpr));
      const ctx = c2d.getContext("2d");
      if (ctx && live.current.paint) { ctx.setTransform(dpr, 0, 0, dpr, 0, 0); live.current.paint(ctx, r.width, r.height); }
    };
    let pending = 0;
    const ro = new ResizeObserver(() => { cancelAnimationFrame(pending); pending = requestAnimationFrame(() => { paintFlat(); glResize(); }); });
    ro.observe(box);
    paintFlat();

    const start = () => {
      stop();
      if (mq.matches) return void (cgl.style.opacity = "0");
      const g = cgl.getContext("webgl2", { premultipliedAlpha: false, antialias: false });
      if (!g) return;
      const sh = (type: number, code: string) => {
        const s = g.createShader(type)!;
        g.shaderSource(s, code);
        g.compileShader(s);
        return s;
      };
      const prog = g.createProgram()!;
      g.attachShader(prog, sh(g.VERTEX_SHADER, VERT));
      g.attachShader(prog, sh(g.FRAGMENT_SHADER, FRAG));
      g.linkProgram(prog);
      if (!g.getProgramParameter(prog, g.LINK_STATUS)) return;
      g.useProgram(prog);
      g.bindVertexArray(g.createVertexArray());
      const u = (n: string) => g.getUniformLocation(prog, n);
      const U = { res: u("res"), texSize: u("texSize"), trail: u("trail"), lag: u("lag"), radius: u("radius"), strength: u("strength"), aberration: u("aberration"), grain: u("grain"), seed: u("seed") };
      const tex = g.createTexture();
      g.bindTexture(g.TEXTURE_2D, tex);
      for (const [k, v] of [[g.TEXTURE_MIN_FILTER, g.LINEAR], [g.TEXTURE_MAG_FILTER, g.LINEAR], [g.TEXTURE_WRAP_S, g.CLAMP_TO_EDGE], [g.TEXTURE_WRAP_T, g.CLAMP_TO_EDGE]]) g.texParameteri(g.TEXTURE_2D, k, v);
      g.pixelStorei(g.UNPACK_FLIP_Y_WEBGL, true);

      let w = 0, h = 0, dpr = 1, tw = 1, th = 1, raf = 0, last = 0, seen = true, ready = false;
      const mouse = { x: 0, y: 0 }, trail = { x: 0, y: 0 }, vel = { x: 0, y: 0 };
      const upload = () => {
        const source = img?.complete && img.naturalWidth ? img : live.current.paint ? c2d : null;
        if (!source) return;
        try {
          g.texImage2D(g.TEXTURE_2D, 0, g.RGBA, g.RGBA, g.UNSIGNED_BYTE, source);
        } catch {
          return; // a cross-origin image without CORS: leave the plain image showing
        }
        tw = source === img ? img.naturalWidth : c2d.width;
        th = source === img ? img.naturalHeight : c2d.height;
        ready = true;
        cgl.style.opacity = "1";
        draw();
      };
      const draw = () => {
        if (!ready) return;
        const p = live.current;
        g.viewport(0, 0, cgl.width, cgl.height);
        g.uniform2f(U.res, cgl.width, cgl.height);
        g.uniform2f(U.texSize, tw, th);
        g.uniform2f(U.trail, trail.x * dpr, (h - trail.y) * dpr); // GL's y runs up
        g.uniform2f(U.lag, (mouse.x - trail.x) * dpr, -(mouse.y - trail.y) * dpr);
        g.uniform1f(U.radius, p.radius);
        g.uniform1f(U.strength, p.strength);
        g.uniform1f(U.aberration, p.aberration);
        g.uniform1f(U.grain, p.grain);
        g.uniform1f(U.seed, (performance.now() / 1000) % 100);
        g.drawArrays(g.TRIANGLES, 0, 3);
      };
      const frame = (now: number) => {
        const dt = Math.min(0.05, last ? (now - last) / 1000 : 1 / 60);
        last = now;
        for (const a of ["x", "y"] as const) {
          vel[a] += ((mouse[a] - trail[a]) * K - vel[a] * 2 * Math.sqrt(K)) * dt;
          trail[a] += vel[a] * dt;
        }
        draw();
        const moving = Math.hypot(mouse.x - trail.x, mouse.y - trail.y) > 0.1 || Math.hypot(vel.x, vel.y) > 0.1;
        raf = moving && seen ? requestAnimationFrame(frame) : 0;
        if (!raf) last = 0;
      };
      const kick = () => { if (!raf && seen) raf = requestAnimationFrame(frame); };

      const size = () => {
        const r = box.getBoundingClientRect();
        w = r.width; h = r.height; dpr = Math.min(2, devicePixelRatio || 1);
        cgl.width = Math.max(1, Math.round(w * dpr));
        cgl.height = Math.max(1, Math.round(h * dpr));
        upload(); // the 2D canvas was just repainted at the new size
      };
      glResize = size;
      const io = new IntersectionObserver(([e]) => { seen = e.isIntersecting; if (seen) kick(); });
      io.observe(box);
      const move = (e: PointerEvent) => {
        const r = box.getBoundingClientRect();
        mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
        if (e.type === "pointerenter") { trail.x = mouse.x; trail.y = mouse.y; vel.x = vel.y = 0; } // no sweep in from the last exit
        kick();
      };
      box.addEventListener("pointerenter", move);
      box.addEventListener("pointermove", move);
      if (img && !img.complete) img.addEventListener("load", upload, { once: true });
      size();

      stop = () => {
        cancelAnimationFrame(raf);
        glResize = () => {};
        io.disconnect();
        box.removeEventListener("pointerenter", move);
        box.removeEventListener("pointermove", move);
        img?.removeEventListener("load", upload);
        g.deleteTexture(tex);
        g.deleteProgram(prog);
        cgl.style.opacity = "0";
        stop = () => {};
      };
    };

    if (src) {
      img = new Image();
      img.crossOrigin = "anonymous";
      img.decoding = "async";
      img.src = src;
    }
    const lost = (e: Event) => { e.preventDefault(); stop(); }; // the plain image shows until the context comes back
    cgl.addEventListener("webglcontextlost", lost);
    cgl.addEventListener("webglcontextrestored", start);
    mq.addEventListener("change", start);
    start();
    return () => {
      stop();
      cancelAnimationFrame(pending);
      ro.disconnect();
      cgl.removeEventListener("webglcontextlost", lost);
      cgl.removeEventListener("webglcontextrestored", start);
      mq.removeEventListener("change", start);
    };
  }, [src, !!paint]); // eslint-disable-line react-hooks/exhaustive-deps -- the rest is read live through `live`

  return (
    <div ref={root} role={alt ? "img" : undefined} aria-label={alt || undefined} className={cn("relative overflow-hidden", className)} {...rest}>
      {/* eslint-disable-next-line @next/next/no-img-element -- a registry file cannot assume next/image */}
      {src && <img src={src} alt="" aria-hidden className="absolute inset-0 size-full object-cover" />}
      <canvas ref={flat} aria-hidden className={cn("absolute inset-0 size-full", src && "invisible")} />
      <canvas ref={gl} aria-hidden className="absolute inset-0 size-full opacity-0" />
    </div>
  );
}

import { notFound } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { FIXTURES } from "./fixtures";

const WIDTHS = ["320", "480", "full"] as const;
const pill = (on: boolean) => `rounded-full px-3 py-1.5 text-sm whitespace-nowrap ${on ? "bg-white text-neutral-900" : "text-neutral-300 hover:text-white"}`;

async function Fixture({ searchParams }: { searchParams: PageProps<"/dev">["searchParams"] }) {
  const q = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const slug = one(q.c) && FIXTURES[one(q.c)!] ? one(q.c)! : Object.keys(FIXTURES)[0];
  const states = FIXTURES[slug];
  const state = one(q.s) && states[one(q.s)!] ? one(q.s)! : Object.keys(states)[0];
  const w = WIDTHS.find((x) => x === one(q.w)) ?? "full";
  const rtl = one(q.dir) === "rtl";
  const href = (o: Record<string, string>) => `/dev?${new URLSearchParams({ c: slug, s: state, w, ...(rtl ? { dir: "rtl" } : {}), ...o }).toString()}`;
  return (
    <>
      <div dir={rtl ? "rtl" : "ltr"} className="mx-auto p-6" style={{ width: w === "full" ? "100%" : `${w}px`, maxWidth: "100%" }}>
        <div className="outline-1 outline-dashed outline-border">{states[state]}</div>
      </div>
      <nav aria-label="Fixture controls" className="fixed bottom-4 left-1/2 flex max-w-[calc(100vw-1rem)] -translate-x-1/2 items-center gap-1 overflow-x-auto rounded-full bg-neutral-900 p-1 text-sm shadow-lg">
        {Object.keys(FIXTURES).length > 1 && Object.keys(FIXTURES).map((c) => <Link key={c} href={href({ c, s: Object.keys(FIXTURES[c])[0] })} className={pill(c === slug)}>{c}</Link>)}
        {Object.keys(states).map((s) => (
          <Link key={s} href={href({ s })} className={pill(s === state)}>
            {s}
          </Link>
        ))}
        <span className="mx-1 h-4 w-px bg-neutral-700" />
        {WIDTHS.map((x) => (
          <Link key={x} href={href({ w: x })} className={pill(x === w)}>
            {x === "full" ? "Full" : `${x}px`}
          </Link>
        ))}
        <Link href={href({ dir: rtl ? "ltr" : "rtl" })} className={pill(rtl)}>
          RTL
        </Link>
      </nav>
    </>
  );
}

/** Worst-case fixtures for QA (pnpm check, break-ui). Development only: 404 in production builds. */
export default function DevPage(props: PageProps<"/dev">) {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <main className="min-h-svh pb-24">
      <Suspense>
        <Fixture searchParams={props.searchParams} />
      </Suspense>
    </main>
  );
}

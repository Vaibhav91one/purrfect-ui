import { ArrowRight, LoaderCircle } from "lucide-react";
import type { ReactNode } from "react";
import { ColumnHop, type ColumnHopColumn } from "./column-hop";

// BountyDesk's review queue: its phase colours (light / dark), dots, spinners and card anatomy
const TONE = {
  triaging: "bg-[oklch(0.52_0.17_250)] dark:bg-[oklch(0.7_0.15_250)]",
  reproducing: "bg-[oklch(0.55_0.13_195)] dark:bg-[oklch(0.75_0.13_195)]",
  approval: "bg-[oklch(0.62_0.15_75)] dark:bg-[oklch(0.8_0.15_75)]",
};
const INK = {
  triaging: "text-[oklch(0.52_0.17_250)] dark:text-[oklch(0.7_0.15_250)]",
  reproducing: "text-[oklch(0.55_0.13_195)] dark:text-[oklch(0.75_0.13_195)]",
};
const OUTCOME = {
  Reproduced: "bg-[oklch(0.7_0.17_162/0.15)] text-[oklch(0.5_0.13_162)] dark:text-[oklch(0.77_0.15_162)]",
  "Not reproduced": "bg-[oklch(0.68_0.15_237/0.15)] text-[oklch(0.5_0.13_237)] dark:text-[oklch(0.83_0.1_230)]",
};

const dot = (phase: keyof typeof TONE) => <span aria-hidden className={`size-2 shrink-0 rounded-full ${TONE[phase]}`} />;

const card = (
  title: string,
  source: string,
  events: number,
  status: ReactNode,
  outcome?: keyof typeof OUTCOME,
) => (
  <div className="flex flex-col gap-3">
    <div className="flex min-w-0 flex-col gap-1">
      <span className="line-clamp-2 font-medium text-foreground">{title}</span>
      <span className="line-clamp-1 text-xs break-all text-muted-foreground">{source} · juice-shop-v17.3.0</span>
    </div>
    {outcome && <span className={`w-fit rounded-md px-1.5 py-0.5 text-xs font-medium ${OUTCOME[outcome]}`}>{outcome}</span>}
    <div className="flex items-center justify-between gap-x-3 border-t border-border/50 pt-3 text-xs text-muted-foreground">
      <span className="flex items-center gap-2">{status}</span>
      <span>
        {events} {events === 1 ? "event" : "events"}
      </span>
    </div>
    {outcome && (
      <span className="mt-1 flex h-8 items-center justify-center gap-1.5 rounded-md border border-border text-xs font-medium text-foreground">
        Review evidence <ArrowRight aria-hidden className="size-3.5" />
      </span>
    )}
  </div>
);

const running = (phase: keyof typeof INK, label: string) => (
  <>
    <LoaderCircle aria-hidden className={`size-3.5 shrink-0 animate-spin motion-reduce:animate-none ${INK[phase]}`} />
    {label}
  </>
);
const review = (
  <>
    {dot("approval")}
    Needs review
  </>
);

const title = (phase: keyof typeof TONE, label: string) => (
  <span className="flex items-center gap-2.5">
    {dot(phase)}
    {label}
  </span>
);

const COLUMNS: ColumnHopColumn[] = [
  {
    title: title("triaging", "Triaging"),
    items: [
      card("Stored XSS in the product review field", "#175151", 1, running("triaging", "Triaging")),
      card("Reflected XSS in the search results page", "#175157", 1, running("triaging", "Triaging")),
    ],
  },
  {
    title: title("reproducing", "Reproducing"),
    items: [
      card("SQL injection in /rest/products/search", "#175152", 2, running("reproducing", "Reproducing")),
      card("Unrestricted file type on the complaint upload", "#175158", 2, running("reproducing", "Reproducing")),
    ],
  },
  {
    title: title("approval", "Awaiting approval"),
    items: [
      card("Auth bypass via SQL injection on login", "#175156", 3, review, "Not reproduced"),
      card("IDOR on the basket endpoint", "#175159", 4, review, "Reproduced"),
    ],
  },
];

const HOP = "Weak JWT signing key on the login endpoint";

export default function ColumnHopDemo() {
  return (
    <div className="relative grid h-[560px] w-[800px] place-items-center overflow-hidden rounded-3xl">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/demo/canyon.jpg" alt="" className="absolute inset-0 size-full object-cover" />
      <div className="relative w-[720px] rounded-xl border border-border/50 bg-card p-4 text-card-foreground">
        <ColumnHop
          columns={COLUMNS}
          className="gap-4 [&>section]:bg-transparent [&>section]:p-0"
          itemClassName="rounded-xl border-border/50 p-4"
          item={card(HOP, "#175153", 2, running("triaging", "Triaging"))}
          itemByColumn={[undefined, card(HOP, "#175153", 2, running("reproducing", "Reproducing"))]}
        />
      </div>
    </div>
  );
}

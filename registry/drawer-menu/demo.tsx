import { DrawerMenu } from "./drawer-menu";

const links = [
  { label: "Work", href: "#projects" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

const social = "block rounded-full p-5 transition-colors hover:text-background/60";
const icon = { width: 18, height: 18, viewBox: "0 0 24 24", "aria-hidden": true } as const;
const line = { ...icon, fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" } as const;

// the portfolio's footer: GitHub, X and LinkedIn as icons (brand marks are not in lucide-react 1.x, so drawn inline)
export const footer = (
  <div className="-ms-5 flex">
    <a href="#github" aria-label="GitHub" className={social}>
      <svg {...line}>
        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
        <path d="M9 18c-4.51 2-5-2-7-2" />
      </svg>
    </a>
    <a href="#x" aria-label="X (Twitter)" className={social}>
      <svg {...icon} fill="currentColor">
        <path d="m2.367 3 7.096 10.14L2.74 21h2.64l5.265-6.17L14.96 21h6.91L14.45 10.375 20.74 3h-2.6l-4.869 5.688L9.3 3H2.367zm3.84 2h2.049l9.777 14h-2.031L6.207 5z" />
      </svg>
    </a>
    <a href="#linkedin" aria-label="LinkedIn" className={social}>
      <svg {...line}>
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect width="4" height="12" x="2" y="9" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    </a>
  </div>
);

export { links };

export default function DrawerMenuDemo() {
  return (
    <div className="relative h-[640px] w-[390px] overflow-hidden rounded-3xl bg-background">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/demo/coast.jpg" alt="" className="absolute inset-0 size-full object-cover" />
      <DrawerMenu contained active="#projects" links={links} footer={footer} />
    </div>
  );
}

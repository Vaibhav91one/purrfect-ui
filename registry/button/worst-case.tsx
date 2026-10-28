// Dev-only fixture (not in registry.json, never installed): the realistic worst props for Button, shown at /dev?c=button.
// Each state is one screen; add a state when a bug shows up so it stays fixed.
import { ArrowRight, Mail } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "./button";

const row = (...kids: ReactNode[]) => (
  <div className="flex flex-col items-start gap-4">
    {kids.map((k, i) => (
      <div key={i} className="max-w-full">
        {k}
      </div>
    ))}
  </div>
);

const Apple = () => (
  <svg viewBox="0 0 384 512" aria-hidden className="size-4 fill-current">
    <path d="M318.7 268.7c-.2-36.7 16.3-64.4 50.6-85.2-19.2-27.7-48.2-42.9-86.5-46.4-36.3-3.4-75.9 21.4-90.5 21.4-15.5 0-50.6-20.4-78.2-20.4-56.8.9-117 45.3-117 138.9 0 27.7 5.1 56.3 15.4 85.7 13.7 38.4 62.6 132.5 113.6 130.9 26.7-.7 45.6-19 80.2-19 33.7 0 51.2 19 80.8 19 51.4-.7 95.8-86.5 108.8-124.9-73.2-34.5-77.2-96.9-77.2-100zM260.4 101.2c27.9-33 25.4-63.1 24.6-74.2-24.7 1.4-53.3 16.8-69.6 35.8-18 20.8-28.6 46.5-26.3 74.4 26.6 2.1 50-11.4 71.3-36z" />
  </svg>
);

export const states: Record<string, ReactNode> = {
  // the Armour "Get the app" button: 64px, #1B1B1B, white label (colours overridden with !, the way a site would theme it)
  Armour: row(
    <Button size="lg" icon={<Apple />} className="bg-[#1B1B1B]! text-white! [@media(hover:hover)]:hover:bg-zinc-800! data-[hover=true]:bg-zinc-800!">
      Get the app
    </Button>,
  ),
  Demo: row(<Button>Get started</Button>, <Button variant="ghost">Read the docs</Button>, <Button icon={<Mail className="size-4" />}>Get in touch</Button>, <Button iconPosition="end" icon={<ArrowRight className="size-4" />}>Continue</Button>, <Button size="lg">Get started</Button>),
  "Worst case": row(
    <Button>Subscribe to the quarterly engineering newsletter and product updates</Button>,
    <Button>Anmeldung-abschließen-und-bestätigen</Button>,
    <Button variant="ghost" icon={<Mail className="size-4" />}>Verify the email address you registered with</Button>,
    <Button>メールアドレスを確認して登録を完了する</Button>,
    <Button>🚀 Launch 🎉</Button>,
    <Button dir="rtl">إرسال الرسالة الآن</Button>,
    <Button wide>Subscribe to the quarterly engineering newsletter and product updates</Button>,
    <Button disabled>Saving your changes…</Button>,
  ),
  One: row(<Button>A</Button>, <Button icon={<Mail className="size-4" />}>{""}</Button>),
  Empty: row(<Button>{""}</Button>),
};

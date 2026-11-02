import { Mail } from "lucide-react";
import { FillButton } from "./fill-button";

// just the outlined "Get in touch" pill, centred
export default function FillButtonDemo() {
  return (
    <div className="grid h-[300px] w-[420px] place-items-center text-foreground">
      <FillButton href="#contact" className="px-8 py-4 text-[13px] uppercase">
        Get in touch <Mail className="size-5" />
      </FillButton>
    </div>
  );
}

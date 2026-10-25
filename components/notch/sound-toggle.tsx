"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useSound } from "@/components/providers/sound-provider";
import { soloButton } from "./styles";

export function SoundToggle() {
  const { enabled, toggle } = useSound();
  return (
    <button type="button" onClick={toggle} aria-label="Sound" aria-pressed={enabled} className={soloButton}>
      {enabled ? <Volume2 className="size-4 sm:size-5" /> : <VolumeX className="size-4 sm:size-5" />}
    </button>
  );
}

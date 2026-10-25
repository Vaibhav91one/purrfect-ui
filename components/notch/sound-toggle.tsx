"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useSound } from "@/components/providers/sound-provider";
import { iconButton } from "./styles";

export function SoundToggle() {
  const { enabled, toggle } = useSound();
  return (
    <button type="button" onClick={toggle} aria-label={enabled ? "Mute sound" : "Turn sound on"} aria-pressed={enabled} className={iconButton}>
      {enabled ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
    </button>
  );
}

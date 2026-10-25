// Thin adapter over Cuelume so the sound engine can be swapped without touching components.
import { bind, play, setEnabled, setVolume, unlock, type SoundName } from "cuelume";

export type Cue = SoundName;
export const sound = { bind, play, setEnabled, setVolume, unlock };

// Thin adapter over Cuelume so the sound engine can be swapped without touching components.
import { bind, play, setEnabled, setTheme, setVolume, unlock, type PlayOptions, type SoundName } from "cuelume";

export type Cue = SoundName;
export type CueOptions = PlayOptions;
export const sound = { bind, play, setEnabled, setTheme, setVolume, unlock };

// The bot's expressions. Each face is just numbers (eye centre, size, corner radius, tilt, mouth path), so adding or
// editing one is a data change. Every mouth path has the same shape (M, Q) so motion can morph between any two.
// Canvas is 40 x 28.

export type Eye = { x: number; y: number; w: number; h: number; r: number; rot: number };
export type Face = { left: Eye; right: Eye; mouth: string; tint?: string };

const eye = (x: number, y: number, w = 6, h = 10, r = 3, rot = 0): Eye => ({ x, y, w, h, r, rot });

const data = {
  idle: { left: eye(13, 12), right: eye(27, 12), mouth: "M16 22 Q20 24 24 22" },
  lookLeft: { left: eye(9.5, 12), right: eye(23.5, 12), mouth: "M14 22 Q18 23.5 22 22" },
  lookRight: { left: eye(16.5, 12), right: eye(30.5, 12), mouth: "M18 22 Q22 23.5 26 22" },
  happy: { left: eye(13, 12.5, 9, 3.2, 1.6, -14), right: eye(27, 12.5, 9, 3.2, 1.6, 14), mouth: "M14 21 Q20 28 26 21" },
  thinking: { left: eye(13, 12), right: eye(28, 8, 4, 4, 2), mouth: "M16 23 Q20 22 24 21" },
  sleepy: { left: eye(13, 13, 9, 2.6, 1.3), right: eye(27, 13, 9, 2.6, 1.3), mouth: "M18 22 Q20 22.6 22 22" },
  surprised: { left: eye(13, 11, 8, 8, 4), right: eye(27, 11, 8, 8, 4), mouth: "M18 22 Q20 27 22 22" },
  wink: { left: eye(13, 12), right: eye(27, 12.5, 9, 2.6, 1.3), mouth: "M15 21.5 Q20 25.5 25 21.5" },
  love: { left: eye(13, 12, 8, 8, 4), right: eye(27, 12, 8, 8, 4), mouth: "M14 21 Q20 28 26 21", tint: "#ff6b9a" },
} satisfies Record<string, Face>;

export type FaceName = keyof typeof data;
export const FACES: Record<FaceName, Face> = data;

/** What the bot cycles through while idle, in order. */
export const SEQUENCE: FaceName[] = ["idle", "lookLeft", "lookRight", "happy", "thinking", "sleepy", "surprised", "wink"];

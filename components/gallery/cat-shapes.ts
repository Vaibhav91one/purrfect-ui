// The cat drawings, kept out of the client components so server components (the footer wordmark cats) can reuse the
// exact same shapes. Every part is drawn twice by its user: a fattened outline copy, and a white copy inside the
// gradient mask.
export const OUTLINE = 4; // px of outline drawn outside each part

/** The hero's sitting cat (`gradient-cat.tsx`), seen from behind and looking up. viewBox 0 0 240 250. */
export const SITTING = {
  TAIL: "M128 222 C176 232 204 222 206 192 C208 166 198 150 184 154",
  BODY: "M58 228 C44 196 50 150 74 120 C88 102 118 104 132 124 C152 152 156 196 142 228 C132 244 68 244 58 228 Z",
  PAWS: "M72 236 a12 8 0 1 0 24 0 a12 8 0 1 0 -24 0Z M104 236 a12 8 0 1 0 24 0 a12 8 0 1 0 -24 0Z",
  HEAD: [
    "M104 52 C112 40 120 32 128 26 C130 40 131 58 126 80 Z", // far ear
    "M64 70 C60 52 62 40 66 30 C76 38 84 46 88 56 Z", // near ear
    "M60 90 C58 66 74 54 94 54 C116 54 128 70 126 92 C124 112 108 120 92 118 C72 116 61 106 60 90 Z", // skull
  ],
  TAIL_PIVOT: "132px 222px",
  NECK: "92px 118px",
  // where each of the four gradient blobs sits (its colour comes from the variant)
  BLOB_AT: [
    [62, 96],
    [178, 100],
    [120, 196],
    [150, 150],
  ],
} as const;

/** The cat curled up asleep (`sleeping-cat.tsx`), side on, face to the right. viewBox 0 0 260 140. */
export const SLEEPING = {
  BODY: "M30 112 C22 80 52 56 110 54 C170 52 214 66 224 96 C230 116 214 122 190 122 L60 122 C42 122 32 120 30 112 Z",
  TAIL: "M38 112 C14 110 6 88 16 72", // curls up behind the back, away from the face
  HEAD: [
    "M182 68 L184 44 L200 58 Z", // ears
    "M208 58 L222 42 L228 66 Z",
    "M176 92 C172 70 190 58 208 60 C228 62 238 78 234 96 C230 112 210 118 194 116 C182 114 177 104 176 92 Z", // skull
  ],
  EYES: [
    [200, 85],
    [216, 85],
  ],
  NECK: "200px 112px",
  TAIL_PIVOT: "38px 112px",
  BLOB_AT: [
    [60, 90],
    [190, 80],
    [120, 118],
    [150, 70],
  ],
} as const;

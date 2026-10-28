// Shell motion tokens: the notch, the explorer and the section effects all move with these. Registry components
// keep their own settings (each ships as one installable file).
export const EASE = [0.23, 1, 0.32, 1] as const;
export const SPRING = { type: "spring", stiffness: 420, damping: 34 } as const;
export const FAST = 0.15;
export const BASE = 0.2;
// Scroll-linked values (parallax columns) ease toward the scroll position with this, instead of following it step by step.
export const SCROLL_SPRING = { stiffness: 200, damping: 30, mass: 0.4 } as const;

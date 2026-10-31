import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// the same file `shadcn init` writes, so registry components import `cn` from here in this repo and in yours
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

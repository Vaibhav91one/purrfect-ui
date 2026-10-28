import type { ReactNode } from "react";
import { states as button } from "@/registry/button/worst-case";
import { states as magnetic } from "@/registry/magnetic/worst-case";
import { states as notch } from "@/registry/notch/worst-case";
import { states as heroReveal } from "@/registry/hero-reveal/worst-case";
import { states as layeredMenu } from "@/registry/layered-menu/worst-case";
import { states as toggle } from "@/registry/toggle/worst-case";
import { states as counter } from "@/registry/counter/worst-case";
import { states as tabs } from "@/registry/tabs/worst-case";

/** Dev-only worst-case states per component (see /dev). Add a component's `registry/<slug>/worst-case.tsx` here when you port it. */
export const FIXTURES: Record<string, Record<string, ReactNode>> = { button, magnetic, notch, "hero-reveal": heroReveal, "layered-menu": layeredMenu, toggle, counter, tabs };

import { cloneElement, isValidElement, type ComponentProps, type ReactElement, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface RollLinkProps extends ComponentProps<"a"> {
  /** The label. A string; it is drawn twice, the second copy waiting on the face below. */
  children: ReactNode;
  /** Render the one child (a Next `<Link>`) as the link: it gets the classes and props, its own children are the label. */
  asChild?: boolean;
}

const EASE = "ease-[cubic-bezier(0.23,1,0.32,1)]";

/**
 * A link whose label rolls over on a 3D axis on hover or keyboard focus: the front face tips back and away while a copy
 * swings up from below, as if the text were printed on two faces of a turning bar. CSS only, so it renders on the server
 * and ships no JavaScript. Hover only runs on devices that can hover. Reduced motion: the faces cross-fade, nothing turns.
 */
export function RollLink({ children, asChild, className, ...rest }: RollLinkProps) {
  const child = asChild && isValidElement(children) ? (children as ReactElement<{ className?: string; children?: ReactNode }>) : null;
  const label = child ? child.props.children : children;
  const face = `block transition-[transform,opacity] duration-300 ${EASE} [backface-visibility:hidden] motion-reduce:transition-opacity`;
  const content = (
    <>
      <span className="sr-only">{label}</span>
      <span aria-hidden className="relative block [perspective:600px] [transform-style:preserve-3d]">
        <span className={cn(face, "origin-[50%_50%_-0.5em] [@media(hover:hover)]:group-hover/roll:[transform:rotateX(90deg)] [@media(hover:hover)]:group-hover/roll:opacity-0 group-focus-visible/roll:[transform:rotateX(90deg)] group-focus-visible/roll:opacity-0 motion-reduce:!transform-none")}>{label}</span>
        <span className={cn(face, "absolute inset-0 origin-[50%_50%_-0.5em] opacity-0 [transform:rotateX(-90deg)] [@media(hover:hover)]:group-hover/roll:[transform:rotateX(0deg)] [@media(hover:hover)]:group-hover/roll:opacity-100 group-focus-visible/roll:[transform:rotateX(0deg)] group-focus-visible/roll:opacity-100 motion-reduce:!transform-none")}>{label}</span>
      </span>
    </>
  );
  const cls = cn("group/roll relative inline-block whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current", child?.props.className, className);
  if (child) return cloneElement(child, { ...rest, className: cls }, content);
  return (
    <a className={cls} {...rest}>
      {content}
    </a>
  );
}

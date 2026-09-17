import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import type { MotionStyle, Variants } from "motion/react";

export interface InkProps {
  d: string;
  delay?: number | undefined;
  duration?: number | undefined;
  strokeWidth?: number | undefined;
  opacity?: number | undefined;
  className?: string | undefined;
  fill?: string | undefined;
}

/**
 * A single henna stroke that genuinely draws itself using
 * stroke-dasharray / stroke-dashoffset (via motion's pathLength).
 */
export function Ink({
  d,
  delay = 0,
  duration = 1.6,
  strokeWidth = 1,
  opacity = 1,
  className,
  fill = "none",
}: InkProps) {
  const reduced = useReducedMotion();
  const variants: Variants = reduced
    ? { hidden: { pathLength: 1, opacity }, draw: { pathLength: 1, opacity } }
    : {
        hidden: { pathLength: 0, opacity: 0 },
        draw: {
          pathLength: 1,
          opacity,
          transition: {
            pathLength: { duration, delay, ease: [0.22, 0.61, 0.36, 1] },
            opacity: { duration: 0.35, delay },
          },
        },
      };

  return (
    <motion.path
      d={d}
      fill={fill}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      vectorEffect="non-scaling-stroke"
      className={className}
      initial={reduced ? { pathLength: 1, opacity } : { pathLength: 0, opacity: 0 }}
      variants={variants}
      {...(reduced ? { animate: { pathLength: 1, opacity, transition: { duration: 0 } } } : {})}
    />
  );
}

/** A henna dot — pops in rather than draws. */
export function Dot({
  cx,
  cy,
  r = 1.6,
  delay = 0,
  opacity = 0.9,
  className,
}: {
  cx: number;
  cy: number;
  r?: number | undefined;
  delay?: number | undefined;
  opacity?: number | undefined;
  className?: string | undefined;
}) {
  const reduced = useReducedMotion();
  // Round to keep SSR and client serialization identical (no hydration drift).
  const x = Math.round(cx * 1000) / 1000;
  const y = Math.round(cy * 1000) / 1000;
  const variants: Variants = reduced
    ? { hidden: { scale: 1, opacity }, draw: { scale: 1, opacity } }
    : {
        hidden: { scale: 0, opacity: 0 },
        draw: {
          scale: 1,
          opacity,
          transition: { duration: 0.5, delay, ease: [0.34, 1.4, 0.64, 1] },
        },
      };

  return (
    <motion.circle
      cx={x}
      cy={y}
      r={r}
      className={className}
      initial={reduced ? { scale: 1, opacity } : { scale: 0, opacity: 0 }}
      variants={variants}
      {...(reduced ? { animate: { scale: 1, opacity, transition: { duration: 0 } } } : {})}
      style={{ transformOrigin: `${x}px ${y}px` }}
    />
  );
}

/** Wraps a motif and triggers the choreography when scrolled into view. */
export function DrawnSvg({
  children,
  viewBox,
  className,
  amount = 0.35,
  once = true,
  style,
  preserveAspectRatio,
}: {
  children: ReactNode;
  viewBox: string;
  className?: string | undefined;
  amount?: number | undefined;
  once?: boolean | undefined;
  style?: MotionStyle | undefined;
  preserveAspectRatio?: string | undefined;
}) {
  return (
    <motion.svg
      viewBox={viewBox}
      className={className}
      style={style ?? {}}
      preserveAspectRatio={preserveAspectRatio ?? "xMidYMid meet"}
      aria-hidden="true"
      focusable="false"
      initial="hidden"
      whileInView="draw"
      viewport={{ once, amount }}
    >
      {children}
    </motion.svg>
  );
}

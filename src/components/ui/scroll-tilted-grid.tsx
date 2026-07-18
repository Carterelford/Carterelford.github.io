"use client";

import {
  motion,
  useScroll,
  useTransform,
  useMotionTemplate,
  useReducedMotion,
  cubicBezier,
} from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

export const DEFAULT_GRID_IMAGES: readonly string[] = [
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&q=80",
  "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=600&q=80",
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&q=80",
  "https://images.unsplash.com/photo-1506765515384-028b60a970df?w=600&q=80",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80",
  "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&q=80",
  "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=600&q=80",
  "https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=600&q=80",
  "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&q=80",
  "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=600&q=80",
  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=600&q=80",
  "https://images.unsplash.com/photo-1504700610630-ac6aba3536d3?w=600&q=80",
];

const easeIntoFocus = cubicBezier(0.22, 1, 0.36, 1);
const easeOutOfFocus = cubicBezier(0, 0, 0.58, 1);
const focusEase: [typeof easeIntoFocus, typeof easeOutOfFocus] = [
  easeIntoFocus,
  easeOutOfFocus,
];

export type MaxWidthToken = "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "none";
export type GapToken = 4 | 6 | 8 | 10 | 12 | 14;

const MAX_WIDTH_CLASS: Record<MaxWidthToken, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  none: "",
};

const GAP_CLASS: Record<GapToken, string> = {
  4: "gap-4",
  6: "gap-6",
  8: "gap-8",
  10: "gap-10",
  12: "gap-12",
  14: "gap-14",
};

type Side = "L" | "R";

type TileConfig = {
  aspectRatio: string;
  perspective: number;
  maxTilt: number;
  maxBlur: number;
  rounded: string;
};

function Tile({ src, side, config }: { src: string; side: Side; config: TileConfig }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress: p } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const reduce = useReducedMotion();
  const sign = side === "L" ? -1 : 1;
  const { aspectRatio, perspective, maxTilt, maxBlur, rounded } = config;

  const blur     = useTransform(p, [0, 0.5, 1], [maxBlur * 0.5, 0, maxBlur * 0.5], { ease: focusEase });
  const bright   = useTransform(p, [0, 0.5, 1], [0.75, 1, 0.75],                  { ease: focusEase });
  const contrast = useTransform(p, [0, 0.5, 1], [1.2, 1, 1.2],                    { ease: focusEase });

  const ty = useTransform(p, [0, 0.5, 1], ["30%", "0%", "-30%"], { ease: focusEase });
  const tz = useTransform(p, [0, 0.5, 1], [100, 0, 100],         { ease: focusEase });
  const rx = useTransform(p, [0, 0.5, 1], [maxTilt * 0.5, 0, -maxTilt * 0.5], { ease: focusEase });

  const tx  = useTransform(p, [0, 0.5, 1], [`${sign * 15}%`, "0%", `${sign * 15}%`], { ease: focusEase });
  const rot = useTransform(p, [0, 0.5, 1], [-sign * 3, 0, sign * 3],   { ease: focusEase });
  const sk  = useTransform(p, [0, 0.5, 1], [sign * 8, 0, -sign * 8],   { ease: focusEase });

  const innerSY = useTransform(p, [0, 0.5, 1], [1.3, 1, 1.3], { ease: focusEase });

  const filter = useMotionTemplate`blur(${blur}px) brightness(${bright}) contrast(${contrast})`;

  if (reduce) {
    return (
      <figure ref={ref} className="relative z-10 m-0">
        <div className="relative w-full overflow-hidden" style={{ aspectRatio, borderRadius: rounded }}>
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url("${src}")` }} />
        </div>
      </figure>
    );
  }

  return (
    <motion.figure ref={ref} className="relative z-10 m-0" style={{ perspective, willChange: "transform" }}>
      <motion.div
        className="relative w-full overflow-hidden will-change-[filter,transform]"
        style={{ aspectRatio, borderRadius: rounded, filter, x: tx, y: ty, z: tz, rotate: rot, rotateX: rx, skewX: sk }}
      >
        <motion.div
          className="absolute inset-0 bg-cover bg-center will-change-transform"
          style={{ backgroundImage: `url("${src}")`, scaleY: innerSY, backfaceVisibility: "hidden" }}
        />
      </motion.div>
    </motion.figure>
  );
}

export type ScrollTiltedGridProps = {
  images?: readonly string[];
  loop?: boolean;
  initialCycles?: number;
  aspectRatio?: string;
  maxWidth?: MaxWidthToken;
  gap?: GapToken;
  perspective?: number;
  maxTilt?: number;
  maxBlur?: number;
  rounded?: string;
  className?: string;
};

export function ScrollTiltedGrid({
  images = DEFAULT_GRID_IMAGES,
  loop = false,
  initialCycles = 3,
  aspectRatio = "3/4",
  maxWidth = "lg",
  gap = 10,
  perspective = 900,
  maxTilt = 70,
  maxBlur = 8,
  rounded = "0.375rem",
  className,
}: ScrollTiltedGridProps = {}) {
  const [cycles, setCycles] = useState(loop ? initialCycles : 1);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loop) return;
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => { if (entries.some((e) => e.isIntersecting)) setCycles((c) => c + 2); },
      { rootMargin: "1500px 0px 1500px 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [loop]);

  const items = useMemo(
    () => loop ? Array.from({ length: cycles }, () => images).flat() : [...images],
    [loop, cycles, images],
  );

  const config = useMemo<TileConfig>(
    () => ({ aspectRatio, perspective, maxTilt, maxBlur, rounded }),
    [aspectRatio, perspective, maxTilt, maxBlur, rounded],
  );

  const gridClass = [
    "mx-auto mt-0 mb-0 grid w-full grid-cols-2 px-6 pt-8 pb-[10vh]",
    MAX_WIDTH_CLASS[maxWidth],
    GAP_CLASS[gap],
  ].filter(Boolean).join(" ");

  return (
    <section className={["relative w-full", className].filter(Boolean).join(" ")}>
      <div className={gridClass}>
        {items.map((src, i) => (
          <Tile key={`${i}-${src}`} src={src} side={i % 2 === 0 ? "L" : "R"} config={config} />
        ))}
      </div>
      {loop ? <div ref={sentinelRef} aria-hidden className="h-px w-full" /> : null}
    </section>
  );
}

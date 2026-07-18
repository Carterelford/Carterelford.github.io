"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import React, { useRef } from "react";
import { cn } from "@/lib/utils";

type CharacterProps = {
  char: string;
  index: number;
  centerIndex: number;
  scrollYProgress: any;
};

const CharacterV1 = ({ char, index, centerIndex, scrollYProgress }: CharacterProps) => {
  const isSpace = char === " ";
  const distanceFromCenter = index - centerIndex;
  const x = useTransform(scrollYProgress, [0, 0.5], [distanceFromCenter * 50, 0]);
  const rotateX = useTransform(scrollYProgress, [0, 0.5], [distanceFromCenter * 50, 0]);
  return (
    <motion.span
      className={cn("inline-block text-white", isSpace && "w-4")}
      style={{ x, rotateX }}
    >
      {char}
    </motion.span>
  );
};

const CharacterV2 = ({ char, index, centerIndex, scrollYProgress }: CharacterProps) => {
  const distanceFromCenter = index - centerIndex;
  const x = useTransform(scrollYProgress, [0, 0.5], [distanceFromCenter * 50, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.75, 1]);
  const y = useTransform(scrollYProgress, [0, 0.5], [Math.abs(distanceFromCenter) * 50, 0]);
  return (
    <motion.img
      src={char}
      alt=""
      className="h-16 w-16 shrink-0 object-contain will-change-transform"
      style={{ x, scale, y, transformOrigin: "center", filter: "invert(1)" }}
    />
  );
};

const CharacterV3 = ({ char, index, centerIndex, scrollYProgress }: CharacterProps) => {
  const distanceFromCenter = index - centerIndex;
  const x = useTransform(scrollYProgress, [0, 0.5], [distanceFromCenter * 90, 0]);
  const rotate = useTransform(scrollYProgress, [0, 0.5], [distanceFromCenter * 50, 0]);
  const y = useTransform(scrollYProgress, [0, 0.5], [-Math.abs(distanceFromCenter) * 20, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.75, 1]);
  return (
    <motion.img
      src={char}
      alt=""
      className="h-16 w-16 shrink-0 object-contain will-change-transform"
      style={{ x, rotate, y, scale, transformOrigin: "center", filter: "invert(1) opacity(0.6)" }}
    />
  );
};

const Bracket = ({ className }: { className: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 27 78" className={className}>
    <path fill="currentColor" d="M26.52 77.21h-5.75c-6.83 0-12.38-5.56-12.38-12.38V48.38C8.39 43.76 4.63 40 .01 40v-4c4.62 0 8.38-3.76 8.38-8.38V12.4C8.38 5.56 13.94 0 20.77 0h5.75v4h-5.75c-4.62 0-8.38 3.76-8.38 8.38V27.6c0 4.34-2.25 8.17-5.64 10.38 3.39 2.21 5.64 6.04 5.64 10.38v16.45c0 4.62 3.76 8.38 8.38 8.38h5.75v4.02Z" />
  </svg>
);

export const TextScrollAnimation = () => {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const targetRef2 = useRef<HTMLDivElement | null>(null);
  const targetRef3 = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress } = useScroll({ target: targetRef });
  const { scrollYProgress: scrollYProgress2 } = useScroll({ target: targetRef2 });
  const { scrollYProgress: scrollYProgress3 } = useScroll({ target: targetRef3 });

  const text = "the golden club";
  const characters = text.split("");
  const centerIndex = Math.floor(characters.length / 2);

  const icons = [
    "https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/instagram.svg",
    "https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/youtube.svg",
    "https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/tiktok.svg",
    "https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/x.svg",
    "https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/linkedin.svg",
    "https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/telegram.svg",
  ];
  const iconCenterIndex = Math.floor(icons.length / 2);

  return (
    <main className="w-full bg-black">
        {/* Block 1 — text */}
        <div
          ref={targetRef}
          className="relative box-border flex h-[210vh] items-center justify-center overflow-hidden bg-black p-[2vw]"
        >
          <div
            className="w-full max-w-4xl text-center text-6xl font-bold uppercase tracking-tighter text-white"
            style={{ perspective: "500px" }}
          >
            {characters.map((char, index) => (
              <CharacterV1
                key={index}
                char={char}
                index={index}
                centerIndex={centerIndex}
                scrollYProgress={scrollYProgress}
              />
            ))}
          </div>
        </div>

        {/* Block 2 — icons V2 */}
        <div
          ref={targetRef2}
          className="relative -mt-[100vh] box-border flex h-[210vh] flex-col items-center justify-center gap-[2vw] overflow-hidden bg-black p-[2vw]"
        >
          <p className="flex items-center justify-center gap-3 text-xl font-light tracking-widest text-white uppercase">
            <Bracket className="h-10 text-white" />
            <span>one room. every platform.</span>
            <Bracket className="h-10 scale-x-[-1] text-white" />
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {icons.map((char, index) => (
              <CharacterV2
                key={index}
                char={char}
                index={index}
                centerIndex={iconCenterIndex}
                scrollYProgress={scrollYProgress2}
              />
            ))}
          </div>
        </div>

        {/* Block 3 — icons V3 */}
        <div
          ref={targetRef3}
          className="relative -mt-[95vh] box-border flex h-[210vh] flex-col items-center justify-center gap-[2vw] overflow-hidden bg-black p-[2vw]"
        >
          <p className="flex items-center justify-center gap-3 text-xl font-light tracking-widest text-white uppercase">
            <Bracket className="h-10 text-white" />
            <span>find your people.</span>
            <Bracket className="h-10 scale-x-[-1] text-white" />
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8" style={{ perspective: "500px" }}>
            {icons.map((char, index) => (
              <CharacterV3
                key={index}
                char={char}
                index={index}
                centerIndex={iconCenterIndex}
                scrollYProgress={scrollYProgress3}
              />
            ))}
          </div>
        </div>
      </main>
  );
};

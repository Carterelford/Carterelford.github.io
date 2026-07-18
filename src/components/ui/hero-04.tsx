import React from "react";
import { ArrowDownRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection04() {
  return (
    <section
      className="min-h-screen overflow-hidden relative py-20"
      style={{ background: "#0a0a0a", color: "#fff" }}
    >
      {/* Dashed grid background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.07) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.07) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, #000 60%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, #000 60%, transparent 100%)",
        }}
      />

      <div className="relative z-10">
        {/* Est label */}
        <div className="px-8 mb-2">
          <p className="text-xs tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>
            Est. 1997
          </p>
        </div>

        {/* MASSIVE full-bleed headline */}
        <div className="overflow-hidden">
          <h1
            className="font-black uppercase leading-none whitespace-nowrap"
            style={{
              fontSize: "clamp(72px, 13vw, 180px)",
              letterSpacing: "-0.04em",
              color: "#fff",
              paddingLeft: "8px",
            }}
          >
            TROPICAL LUXURIES
          </h1>
        </div>

        {/* Main content grid */}
        <div
          className="px-6 mt-2"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.6fr",
            gap: "12px",
            maxWidth: "100%",
          }}
        >
          {/* Left card — name + services */}
          <div
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px dashed rgba(255,255,255,0.12)",
              padding: "32px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              minHeight: "320px",
            }}
          >
            <div>
              <p
                className="font-light tracking-widest text-2xl"
                style={{ color: "rgba(255,255,255,0.9)", letterSpacing: "6px" }}
              >
                THE GOLDEN CLUB
              </p>
            </div>
            <div className="mt-8">
              <div
                className="font-semibold text-xl"
                style={{ color: "rgba(255,255,255,0.75)", lineHeight: 1.8 }}
              >
                <div>/ PRIVATE COMMUNITY</div>
                <div>/ LUXURY RETREATS</div>
                <div>/ ENTREPRENEUR NETWORK</div>
              </div>
            </div>
          </div>

          {/* Right — image card with vertical text */}
          <div
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px dashed rgba(255,255,255,0.12)",
              display: "flex",
              overflow: "hidden",
              minHeight: "320px",
              position: "relative",
            }}
          >
            <img
              src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=900&q=80"
              alt="Retreat"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                position: "absolute",
                inset: 0,
                filter: "grayscale(60%) brightness(0.7)",
              }}
            />
            {/* Vertical text right edge */}
            <div
              style={{
                position: "absolute",
                right: 0,
                top: 0,
                bottom: 0,
                width: "40px",
                background: "rgba(0,0,0,0.6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 2,
              }}
            >
              <span
                style={{
                  writingMode: "vertical-rl",
                  transform: "rotate(180deg)",
                  fontSize: "10px",
                  letterSpacing: "4px",
                  color: "rgba(255,255,255,0.4)",
                  fontWeight: 500,
                  textTransform: "uppercase",
                }}
              >
                BY INVITATION ONLY
              </span>
            </div>
          </div>
        </div>

        {/* Description text */}
        <div className="mt-16 px-6 text-center">
          <p
            className="mx-auto font-mono tracking-widest text-sm"
            style={{
              color: "rgba(255,255,255,0.4)",
              maxWidth: "640px",
              lineHeight: 2,
            }}
          >
            A PRIVATE WORLD FOR ENTREPRENEURS WHO REFUSE TO DRIFT.
            <br />
            DRIVEN PEOPLE. ONE VILLA.
            <br />
            BUILT FOR THE ONES WHO KNOW THEY'RE MEANT FOR MORE.
          </p>
        </div>

        {/* CTA Button */}
        <div className="flex justify-center mt-8">
          <Button
            size="lg"
            style={{
              background: "#fff",
              color: "#000",
              fontWeight: 700,
              letterSpacing: "0.15em",
              fontSize: "11px",
              borderRadius: "2px",
              padding: "0 48px",
              height: "48px",
            }}
          >
            APPLY FOR ACCESS
          </Button>
        </div>

        {/* Bottom row — stacked images left, label right */}
        <div
          className="px-6 mt-16"
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
          }}
        >
          {/* Stacked portrait images */}
          <div style={{ position: "relative", width: "200px", height: "160px" }}>
            {[
              "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=400&q=80",
              "https://images.unsplash.com/photo-1506765515384-028b60a970df?w=400&q=80",
              "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&q=80",
            ].map((src, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: `${i * 20}px`,
                  top: `${i * -16}px`,
                  width: "140px",
                  height: "100px",
                  border: "1px solid rgba(255,255,255,0.12)",
                  overflow: "hidden",
                }}
              >
                <img
                  src={src}
                  alt="Retreat"
                  style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(80%)" }}
                />
              </div>
            ))}
          </div>

          {/* Recent Retreats label */}
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: "8px",
                color: "rgba(255,255,255,0.4)",
                fontSize: "12px",
                letterSpacing: "3px",
                marginBottom: "8px",
              }}
            >
              <span>RECENT RETREATS</span>
              <ArrowDownRight size={16} />
            </div>
            <h2
              className="font-black uppercase"
              style={{
                fontSize: "clamp(32px, 5vw, 64px)",
                letterSpacing: "-0.04em",
                lineHeight: 1,
                color: "#fff",
              }}
            >
              Life Without Limits
            </h2>
          </div>
        </div>
      </div>
    </section>
  );
}

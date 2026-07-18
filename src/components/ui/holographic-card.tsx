import React, { useRef } from 'react';

const HolographicCard = () => {
  const cardRef = useRef<HTMLDivElement>(null);
  const borderGlowRef = useRef<HTMLDivElement>(null);
  const glossRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rotateX = ((y - cy) / cy) * 14;
    const rotateY = ((cx - x) / cx) * 14;
    const px = (x / rect.width) * 100;
    const py = (y / rect.height) * 100;

    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;

    // Shine the inner text/accents based on tilt
    const tiltAmount = (Math.abs(rotateX) + Math.abs(rotateY)) / 30;
    const brightness = 1 + tiltAmount;

    const inner = cardRef.current.querySelector('.centurion-inner') as HTMLElement;
    if (inner) inner.style.filter = `brightness(${brightness}) drop-shadow(0 0 ${tiltAmount * 12}px rgba(210,185,100,0.6))`;

    const sunburst = cardRef.current.querySelector('.centurion-sunburst') as HTMLElement;
    if (sunburst) {
      sunburst.style.opacity = String(0.035 + tiltAmount * 0.25);
      sunburst.style.filter = `brightness(${brightness}) drop-shadow(0 0 ${tiltAmount * 6}px rgba(200,170,60,0.8))`;
    }

    // Rotate the trim gradient angle based on mouse position
    const trimAngle = (px / 100) * 360;
    cardRef.current.style.setProperty('--trim-angle', `${trimAngle}deg`);
    const trim = cardRef.current.querySelector('.centurion-trim') as HTMLElement;
    if (trim) trim.style.background = `linear-gradient(${trimAngle}deg, #b8960a 0%, #f5d060 10%, #fff8e0 18%, #ff80c0 30%, #80d0ff 42%, #a0ff80 54%, #f5d060 66%, #fff0a0 78%, #c8a020 88%, #b8960a 100%)`;

    // Holographic shimmer on the border trim
    if (borderGlowRef.current) {
      borderGlowRef.current.style.background = `
        radial-gradient(ellipse at ${px}% ${py}%,
          rgba(255,220,80,0.9) 0%,
          rgba(255,100,200,0.6) 20%,
          rgba(80,200,255,0.5) 40%,
          rgba(120,255,150,0.4) 60%,
          transparent 75%
        )
      `;
      borderGlowRef.current.style.opacity = '1';
    }

    if (glossRef.current) {
      glossRef.current.style.background = `radial-gradient(ellipse at ${px}% ${py}%, rgba(255,255,255,0.08) 0%, transparent 55%)`;
    }
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
    if (borderGlowRef.current) borderGlowRef.current.style.opacity = '0';
    if (glossRef.current) glossRef.current.style.background = 'none';
    const inner = cardRef.current.querySelector('.centurion-inner') as HTMLElement;
    if (inner) inner.style.filter = 'brightness(1)';
    const sunburst = cardRef.current.querySelector('.centurion-sunburst') as HTMLElement;
    if (sunburst) { sunburst.style.opacity = '0.035'; sunburst.style.filter = 'none'; }
  };

  // Sunburst rays
  const rays = Array.from({ length: 36 }, (_, i) => i * 10);

  return (
    <>
      <style>{`
        .centurion-card {
          position: relative;
          width: 480px;
          height: 300px;
          border-radius: 18px;
          background: linear-gradient(145deg, #0a0a0a 0%, #151515 40%, #0d0d0d 70%, #080808 100%);
          overflow: hidden;
          cursor: pointer;
          transition: transform 0.12s ease, box-shadow 0.12s ease;
          box-shadow:
            0 0 0 1px rgba(180,150,60,0.3),
            0 40px 120px rgba(0,0,0,0.95),
            0 16px 40px rgba(0,0,0,0.7),
            0 0 60px rgba(150,120,40,0.08);
          font-family: 'Arial', sans-serif;
        }

        .centurion-card:hover {
          box-shadow:
            0 0 0 1px rgba(220,190,80,0.5),
            0 50px 140px rgba(0,0,0,0.95),
            0 20px 50px rgba(0,0,0,0.7),
            0 0 80px rgba(180,140,40,0.15);
        }

        /* Ornate border that gets the holographic shimmer */
        .centurion-border-mask {
          position: absolute;
          inset: 0;
          border-radius: 18px;
          pointer-events: none;
          z-index: 3;
          /* The border is cut out using box-shadow inset trick */
          box-shadow: inset 0 0 0 12px rgba(0,0,0,0.85);
        }

        /* The holographic shimmer — only shows through the border area */
        .centurion-border-holo {
          position: absolute;
          inset: 0;
          border-radius: 18px;
          opacity: 0;
          transition: opacity 0.1s;
          pointer-events: none;
          z-index: 2;
        }

        /* Shiny holographic trim ring */
        .centurion-trim {
          position: absolute;
          inset: 0;
          border-radius: 18px;
          pointer-events: none;
          z-index: 4;
          padding: 6px;
          background: linear-gradient(
            var(--trim-angle, 135deg),
            #b8960a 0%,
            #f5d060 12%,
            #fff8e0 20%,
            #c8a020 28%,
            #7a5c00 36%,
            #e8c840 44%,
            #ff80c0 52%,
            #80d0ff 60%,
            #a0ff80 68%,
            #f5d060 76%,
            #b8960a 84%,
            #fff0a0 92%,
            #b8960a 100%
          );
          -webkit-mask:
            linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
        }

        .centurion-trim-inner {
          position: absolute;
          inset: 9px;
          border-radius: 12px;
          border: 0.5px solid rgba(200,170,60,0.15);
          pointer-events: none;
          z-index: 4;
        }

        /* Subtle sunburst bg */
        .centurion-sunburst {
          position: absolute;
          inset: 0;
          opacity: 0.035;
          pointer-events: none;
        }

        /* Watermark pattern */
        .centurion-watermark {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.04;
          background-image: repeating-linear-gradient(
            45deg,
            transparent,
            transparent 20px,
            rgba(200,170,80,0.5) 20px,
            rgba(200,170,80,0.5) 21px
          );
        }

        /* Gloss */
        .centurion-gloss {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 5;
          mix-blend-mode: overlay;
        }

        /* Inner layout */
        .centurion-inner {
          position: relative;
          z-index: 6;
          height: 100%;
          padding: 24px 32px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .centurion-top {
          text-align: center;
        }

        .centurion-brand {
          font-size: 15px;
          font-weight: 900;
          letter-spacing: 0.22em;
          color: rgba(210,185,100,0.9);
          text-transform: uppercase;
          font-family: 'Arial Black', sans-serif;
          margin: 0;
          text-shadow: 0 0 20px rgba(210,185,100,0.3);
        }

        .centurion-tier {
          font-size: 8px;
          letter-spacing: 0.4em;
          color: rgba(200,170,80,0.45);
          text-transform: uppercase;
          margin: 4px 0 0 0;
        }

        /* Middle row: number · medallion · number */
        .centurion-mid {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .centurion-number {
          font-size: 20px;
          letter-spacing: 0.12em;
          color: rgba(200,175,90,0.75);
          font-weight: 400;
          font-family: 'Courier New', monospace;
          text-shadow: 0 0 12px rgba(200,175,90,0.2);
        }

        /* Medallion */
        .centurion-medallion {
          width: 110px;
          height: 130px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Bottom row */
        .centurion-bottom {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }

        .centurion-member {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .centurion-member-label {
          font-size: 6.5px;
          letter-spacing: 0.3em;
          color: rgba(200,170,80,0.35);
          text-transform: uppercase;
        }

        .centurion-member-name {
          font-size: 14px;
          letter-spacing: 0.15em;
          color: rgba(210,185,100,0.85);
          font-weight: 700;
          font-family: 'Arial Black', sans-serif;
          text-transform: uppercase;
        }

        .centurion-since {
          text-align: right;
          display: flex;
          flex-direction: column;
          gap: 2px;
          align-items: flex-end;
        }

        .centurion-since-banner {
          font-size: 6px;
          letter-spacing: 0.25em;
          color: rgba(200,170,80,0.35);
          border: 0.5px solid rgba(200,170,80,0.2);
          padding: 1px 5px;
          border-radius: 2px;
          text-transform: uppercase;
        }

        .centurion-since-year {
          font-size: 13px;
          color: rgba(200,170,80,0.55);
          letter-spacing: 0.1em;
          font-family: 'Courier New', monospace;
        }
      `}</style>

      <div
        className="centurion-card"
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Holographic shimmer */}
        <div className="centurion-border-holo" ref={borderGlowRef} style={{ maskImage: 'radial-gradient(ellipse, transparent 70%, black 100%)' }} />
        <div className="centurion-border-mask" />
        <div className="centurion-trim" />
        <div className="centurion-trim-inner" />
        <div className="centurion-watermark" />
        <div className="centurion-gloss" ref={glossRef} />

        {/* Sunburst SVG */}
        <svg className="centurion-sunburst" viewBox="0 0 480 300" preserveAspectRatio="xMidYMid slice">
          {rays.map((angle, i) => (
            <line
              key={i}
              x1="240" y1="150"
              x2={240 + 300 * Math.cos((angle - 90) * Math.PI / 180)}
              y2={150 + 300 * Math.sin((angle - 90) * Math.PI / 180)}
              stroke="rgba(200,170,60,1)"
              strokeWidth="1"
            />
          ))}
        </svg>

        {/* Corner ornaments */}
        {[
          { cls: 'tl', x: 14, y: 14, sx: 1, sy: 1 },
          { cls: 'tr', x: 466, y: 14, sx: -1, sy: 1 },
          { cls: 'bl', x: 14, y: 286, sx: 1, sy: -1 },
          { cls: 'br', x: 466, y: 286, sx: -1, sy: -1 },
        ].map(({ cls, x, y, sx, sy }) => (
          <svg key={cls} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 4 }} viewBox="0 0 480 300">
            <g transform={`translate(${x},${y}) scale(${sx},${sy})`}>
              <path d="M0 30 Q0 0 30 0" stroke="rgba(200,170,60,0.6)" strokeWidth="1" fill="none"/>
              <path d="M0 20 Q0 0 20 0" stroke="rgba(200,170,60,0.3)" strokeWidth="0.5" fill="none"/>
              <circle cx="0" cy="0" r="3" fill="none" stroke="rgba(200,170,60,0.5)" strokeWidth="0.8"/>
              <line x1="-6" y1="0" x2="6" y2="0" stroke="rgba(200,170,60,0.4)" strokeWidth="0.5"/>
              <line x1="0" y1="-6" x2="0" y2="6" stroke="rgba(200,170,60,0.4)" strokeWidth="0.5"/>
            </g>
          </svg>
        ))}

        <div className="centurion-inner">
          {/* Top */}
          <div className="centurion-top">
            <p className="centurion-brand">The Golden Club</p>
            <p className="centurion-tier">Tropical Luxuries · Private Collection</p>
          </div>

          {/* Middle */}
          <div className="centurion-mid">
            <span className="centurion-number">4444</span>

            {/* Medallion */}
            <div className="centurion-medallion">
              <svg viewBox="0 0 110 130" width="110" height="130" fill="none">
                {/* Oval frame */}
                <ellipse cx="55" cy="65" rx="44" ry="54" stroke="rgba(200,170,60,0.5)" strokeWidth="1"/>
                <ellipse cx="55" cy="65" rx="40" ry="50" stroke="rgba(200,170,60,0.2)" strokeWidth="0.5"/>
                {/* Decorative lines inside oval */}
                {[...Array(8)].map((_, i) => (
                  <line key={i}
                    x1={55 + 38 * Math.cos((i * 45) * Math.PI / 180)}
                    y1={65 + 48 * Math.sin((i * 45) * Math.PI / 180)}
                    x2={55 + 28 * Math.cos((i * 45) * Math.PI / 180)}
                    y2={65 + 36 * Math.sin((i * 45) * Math.PI / 180)}
                    stroke="rgba(200,170,60,0.15)" strokeWidth="0.5"
                  />
                ))}
                {/* Inner symbol */}
                <text x="55" y="58" textAnchor="middle" fontSize="8" fontWeight="bold" fill="rgba(200,170,60,0.6)" letterSpacing="1.5" fontFamily="Arial">TL</text>
                <text x="55" y="72" textAnchor="middle" fontSize="5.5" fill="rgba(200,170,60,0.35)" letterSpacing="1" fontFamily="Arial">GOLDEN</text>
                <text x="55" y="82" textAnchor="middle" fontSize="5.5" fill="rgba(200,170,60,0.35)" letterSpacing="1" fontFamily="Arial">CLUB</text>
                {/* Member since banner */}
                <rect x="22" y="105" width="66" height="12" rx="2" fill="none" stroke="rgba(200,170,60,0.3)" strokeWidth="0.5"/>
                <text x="55" y="114" textAnchor="middle" fontSize="5" fill="rgba(200,170,60,0.4)" letterSpacing="1.5" fontFamily="Arial">MEMBER SINCE</text>
              </svg>
            </div>

            <span className="centurion-number">4444</span>
          </div>

          {/* Bottom */}
          <div className="centurion-bottom">
            <div className="centurion-member">
              <span className="centurion-member-label">Member</span>
              <span className="centurion-member-name">Founder</span>
            </div>
            <div className="centurion-since">
              <span className="centurion-since-year">1997</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HolographicCard;

import { useEffect, useRef } from 'react';
import { Component } from "@/components/ui/horizon-hero-section";
import { DottedSurface } from "@/components/ui/dotted-surface";

const DemoOne = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const wh = window.innerHeight;
      const fadeStart = wh * 2.3;
      const fadeEnd = wh * 2.6;
      const progress = Math.max(0, Math.min(1, (scrollY - fadeStart) / (fadeEnd - fadeStart)));
      if (sectionRef.current) sectionRef.current.style.opacity = String(progress);

      const overlayFadeOutStart = wh * 3.2;
      const overlayFadeOutEnd = wh * 3.6;
      const overlayOut = Math.max(0, Math.min(1, (scrollY - overlayFadeOutStart) / (overlayFadeOutEnd - overlayFadeOutStart)));
      if (overlayRef.current) overlayRef.current.style.opacity = String(progress * (1 - overlayOut));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <Component />
      <div
        ref={overlayRef}
        style={{
          position: 'fixed',
          inset: 0,
          background: '#000',
          opacity: 0,
          zIndex: 4,
          pointerEvents: 'none',
        }}
      />
      <section
        ref={sectionRef}
        style={{ position: 'relative', height: '82vh', overflow: 'hidden', opacity: 0, zIndex: 5 }}
      >
        <div style={{ position: 'absolute', inset: 0, top: '-10vh' }}>
          <DottedSurface className="absolute inset-0 size-full" />
        </div>

        <div style={{
          position: 'absolute', top: '33%', left: 0, right: 0,
          zIndex: 3, pointerEvents: 'none',
          display: 'flex', justifyContent: 'center',
        }}>
          <a
            href="/apply/?fadein=1"
            onClick={e => {
              e.preventDefault();
              const overlay = document.createElement('div');
              overlay.style.cssText = 'position:fixed;inset:0;background:#000;opacity:0;z-index:9999;pointer-events:none;transition:opacity 0.7s ease';
              document.body.appendChild(overlay);
              requestAnimationFrame(() => {
                overlay.style.opacity = '1';
                setTimeout(() => { window.location.href = '/apply/?fadein=1'; }, 750);
              });
            }}
            style={{
              pointerEvents: 'auto',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 300,
              fontSize: 'clamp(11px, 1vw, 14px)',
              letterSpacing: '0.35em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.9)',
              textDecoration: 'none',
              border: '1px solid rgba(255,255,255,0.25)',
              padding: '18px 48px',
              backdropFilter: 'blur(8px)',
              background: 'rgba(255,255,255,0.04)',
              transition: 'border-color 0.3s, background 0.3s, color 0.3s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.7)';
              (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.09)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.25)';
              (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.04)';
            }}
          >
            Apply to Join
          </a>
        </div>
      </section>
    </>
  );
};

export default DemoOne;

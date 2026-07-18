// Work-in-progress sections — not currently rendered in the main site.
// Re-import and drop <WipSections /> into App.tsx whenever you're ready to continue.

import HolographicCard from "@/components/ui/holographic-card";
import InkReveal from "@/components/ui/ink-reveal";
import NewSection from "@/components/ui/new-section";
import { ParallaxComponent } from "@/components/ui/parallax-scrolling";
import { ShapeMorph } from "@/components/ui/shape-morph";

const WipSections = () => (
  <>
    <section style={{
      position: 'relative', width: '100%', height: '100vh', background: '#000',
      display: 'flex', alignItems: 'center', justifyContent: 'center', paddingBottom: '12vh', zIndex: 6,
    }}>
      <HolographicCard />
    </section>

    <section style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden', zIndex: 6 }}>
      <img
        src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1600&q=80"
        alt="Landscape"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
      />
      <InkReveal
        maskColor={[0, 0, 0]}
        brushSize={160}
        lifetime={800}
        overlayText="Create your reality"
        overlayTextStyle={{ fontSize: '13px', fontWeight: '300', fontFamily: 'Inter, -apple-system, sans-serif', color: 'rgba(255,255,255,0.5)' }}
      />
    </section>

    <NewSection />

    <ParallaxComponent />

    <div style={{ position: 'relative', zIndex: 10, isolation: 'isolate' }}>
      <ShapeMorph />
    </div>
  </>
);

export default WipSections;

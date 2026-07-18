import { TextScrollAnimation } from "@/components/ui/text-scroll-animation";

export default function NewSection() {
  return (
    <div style={{
      position: 'relative',
      zIndex: 10,
      isolation: 'isolate',
    }}>
      <TextScrollAnimation />
    </div>
  );
}

import { ArrowRight, AudioWaveform, Download, Languages, Play, UploadCloud } from "lucide-react";
import { Link } from "react-router-dom";

const stages = [
  { label: "Upload", icon: UploadCloud },
  { label: "Translate", icon: Languages },
  { label: "Voice", icon: AudioWaveform },
  { label: "Download", icon: Download },
] as const;

// Add a file at frontend/public/demo-video.mp4, then set this to "/demo-video.mp4".
const DEMO_VIDEO_SRC: string | null = null;

export function LandingPage() {
  return (
    <main className="min-h-screen bg-(--color-bg) text-(--color-text)">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-6 md:px-8 lg:px-10">
        <Brand />
        <Link className="text-sm font-medium transition hover:text-(--color-text-dim)" to="/auth">Sign in</Link>
      </nav>

      <section className="mx-auto max-w-7xl px-5 pb-16 pt-16 text-center md:px-8 md:pt-24 lg:px-10">
        <p className="reveal-up ui-eyebrow">Video localization studio</p>
        <h1 className="reveal-up mx-auto mt-5 max-w-4xl font-serif text-5xl leading-[0.94] tracking-[-0.04em] sm:text-7xl lg:text-[5.8rem]" style={{ animationDelay: "70ms" }}>
          Let your work travel further.
        </h1>
        <p className="reveal-up mx-auto mt-6 max-w-xl text-base leading-7 text-(--color-text-dim) sm:text-lg" style={{ animationDelay: "140ms" }}>
          DubStudio turns one finished video into a version your next audience can understand.
        </p>
        <Link className="reveal-up ui-button ui-button-primary mt-8" style={{ animationDelay: "210ms" }} to="/auth">Start a project <ArrowRight className="size-4" /></Link>
      </section>

      <section className="mx-auto max-w-7xl px-5 md:px-8 lg:px-10">
        <DemoVideo />
        <div className="grid grid-cols-2 border-x border-b border-(--color-border) md:grid-cols-[1.1fr_1fr_1fr_1fr_1fr]">
          <p className="col-span-2 border-b border-(--color-border) px-5 py-4 text-sm text-(--color-text-dim) md:col-span-1 md:border-b-0">From source cut to a new voice.</p>
          {stages.map((stage, index) => {
            const Icon = stage.icon;
            return <div className="flex items-center gap-2 border-l border-(--color-border) px-4 py-4 text-sm first:border-l-0 md:first:border-l" key={stage.label}><Icon className="size-3.5 text-(--color-text-dim)" /><span>{stage.label}</span><span className="ml-auto text-xs text-(--color-muted)">0{index + 1}</span></div>;
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 md:px-8 lg:px-10">
        <p className="max-w-xl font-serif text-3xl leading-tight tracking-[-0.025em] sm:text-4xl">A private, deliberate place to prepare each version of your video.</p>
      </section>
    </main>
  );
}

function DemoVideo() {
  return <div className="reveal-up overflow-hidden bg-[#171715]" style={{ animationDelay: "280ms" }}>
    <div className="relative aspect-video">
      {DEMO_VIDEO_SRC ? <video className="size-full object-cover" controls playsInline preload="metadata" src={DEMO_VIDEO_SRC}>Your browser does not support video playback.</video> : <div className="absolute inset-0 flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_center,#30302d_0%,#171715_70%)] text-white"><span className="flex size-12 items-center justify-center rounded-full border border-white/25"><Play className="ml-0.5 size-4 fill-current" /></span><p className="mt-5 text-sm">Place your film here</p><p className="mt-1 text-xs text-white/45">/public/demo-video.mp4</p></div>}
    </div>
    <div className="flex items-center justify-between border-t border-white/15 px-5 py-3 text-xs text-white/65"><span>DubStudio — product film</span><span>01:24</span></div>
  </div>;
}

export function Brand() {
  return <Link className="flex items-center gap-2" to="/"><span className="brand-mark"><AudioWaveform /></span><span className="text-sm font-semibold tracking-[-0.02em]">DubStudio</span></Link>;
}

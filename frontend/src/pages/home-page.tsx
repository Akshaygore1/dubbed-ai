import { Film, Globe2, Zap } from "lucide-react";
import { DubbingForm } from "../features/dubbing/dubbing-form";

const features = [
  {
    title: "AI Translation",
    description: "Automatically translate and lip-sync videos to any language.",
    icon: Film,
  },
  {
    title: "12+ Languages",
    description: "English, Spanish, French, German, Japanese, and more.",
    icon: Globe2,
  },
  {
    title: "Fast Delivery",
    description: "Get your dubbed video in minutes, not hours.",
    icon: Zap,
  },
];

export function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-20 lg:px-12">
      <section className="grid gap-16 lg:grid-cols-2 lg:items-center">
        <div className="space-y-8">
          <div className="space-y-6">
            <p className="text-xs uppercase tracking-[0.4em] text-[var(--color-accent)]">
              Auto Dubbing AI
            </p>
            <h1 className="font-serif text-6xl font-normal leading-[1.1] tracking-tight text-[var(--color-text)]">
              Translate your videos into any language.
            </h1>
            <p className="max-w-md text-sm leading-relaxed text-[var(--color-text-dim)]">
              Upload a video or paste a URL, select source and target languages, 
              and let AI automatically dub your content with natural voiceovers.
            </p>
          </div>

          <div className="flex gap-8">
            {features.map(({ title, description, icon: Icon }) => (
              <div key={title} className="space-y-2">
                <Icon className="size-4 text-[var(--color-accent)]" />
                <p className="text-xs uppercase tracking-wider text-[var(--color-text)]">
                  {title}
                </p>
                <p className="text-xs text-[var(--color-text-dim)]">{description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center lg:justify-end">
          <DubbingForm />
        </div>
      </section>
    </main>
  );
}
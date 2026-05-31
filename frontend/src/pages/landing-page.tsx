import {
  ArrowRight,
  AudioWaveform,
  Building2,
  Captions,
  CheckCircle2,
  Cpu,
  Download,
  GraduationCap,
  Languages,
  Mic2,
  Play,
  UploadCloud,
  UserRound,
} from "lucide-react";
import { Link } from "react-router-dom";

const workflowSteps = [
  {
    title: "Upload video",
    copy: "Drop the source file and keep the original cut intact.",
    icon: UploadCloud,
  },
  {
    title: "Choose language",
    copy: "Pick the target voice market and keep the source auto-detected.",
    icon: Languages,
  },
  {
    title: "Process",
    copy: "Transcription, translation, voice rendering, and sync run as one job.",
    icon: Cpu,
  },
  {
    title: "Download",
    copy: "Pull the finished dubbed video from your private workspace.",
    icon: Download,
  },
] as const;

const useCases = [
  {
    title: "Creators",
    copy: "Republish tutorials, explainers, and short-form edits for regional audiences.",
    icon: UserRound,
  },
  {
    title: "Educators",
    copy: "Localize lessons and training videos without rebuilding the course library.",
    icon: GraduationCap,
  },
  {
    title: "Agencies",
    copy: "Run small client batches with clear job status and authenticated downloads.",
    icon: Building2,
  },
] as const;

// const pricingPlans = [
//   {
//     name: "Free",
//     price: "$0",
//     detail: "For first uploads and workflow trials.",
//     features: [
//       "Limited monthly minutes",
//       "Standard processing queue",
//       "Private job history",
//     ],
//   },
//   {
//     name: "Creator",
//     price: "$19",
//     detail: "For regular channels and course builders.",
//     features: [
//       "Higher dubbing minutes",
//       "Priority queue",
//       "Download-ready workspace",
//     ],
//   },
//   {
//     name: "Agency",
//     price: "$79",
//     detail: "For teams managing recurring localization work.",
//     features: [
//       "Shared production view",
//       "Batch-ready capacity",
//       "Client delivery records",
//     ],
//   },
// ] as const;

export function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-(--color-bg) text-(--color-text)">
      <section className="relative border-b border-(--color-border) bg-[linear-gradient(135deg,#ffffff_0%,#f7f9f3_52%,#e9f2e4_100%)]">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(21,23,19,0.07)_1px,transparent_1px),linear-gradient(rgba(21,23,19,0.05)_1px,transparent_1px)] bg-[length:96px_96px] opacity-55" />

        <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 md:px-8 lg:px-10">
          <Link className="flex items-center gap-3" to="/">
            <span className="flex size-9 items-center justify-center rounded-md border border-(--color-text) bg-(--color-accent) text-(--color-accent-text)">
              <AudioWaveform className="size-5" />
            </span>
            <span className="font-serif text-2xl leading-none">
              DubStudio AI
            </span>
          </Link>
          <div className="hidden items-center gap-7 text-sm text-(--color-text-dim) md:flex">
            <a
              className="transition hover:text-(--color-text)"
              href="#workflow"
            >
              Workflow
            </a>
            <a
              className="transition hover:text-(--color-text)"
              href="#use-cases"
            >
              Use cases
            </a>
            <a className="transition hover:text-(--color-text)" href="#pricing">
              Pricing
            </a>
          </div>
          <Link
            className="inline-flex items-center gap-2 rounded-md border border-(--color-text) bg-(--color-text) px-4 py-2 text-sm font-semibold text-(--color-bg) transition hover:-translate-y-0.5 hover:bg-(--color-text)"
            to="/auth"
          >
            Sign in
            <ArrowRight className="size-4" />
          </Link>
        </nav>

        <div className="relative z-10 mx-auto grid max-w-7xl gap-6 px-5 pb-8 pt-3 md:px-8 lg:grid-cols-[0.74fr_1.26fr] lg:gap-10 lg:px-10 lg:pb-16 lg:pt-10">
          <div className="flex flex-col justify-center">
            <p className="reveal-up font-mono text-xs font-semibold text-(--color-blue)">
              Self-serve AI dubbing for growing video libraries
            </p>
            <h1
              className="reveal-up mt-5 font-serif text-5xl leading-none text-(--color-text) sm:text-7xl lg:text-8xl"
              style={{ animationDelay: "70ms" }}
            >
              DubStudio AI
            </h1>
            <p
              className="reveal-up mt-5 max-w-xl text-base leading-7 text-(--color-text-dim) sm:text-lg sm:leading-8"
              style={{ animationDelay: "140ms" }}
            >
              Upload a video, choose a target language, and get a dubbed file
              back from a clean private workspace.
            </p>
            <div
              className="reveal-up mt-8 flex flex-col gap-3 sm:flex-row"
              style={{ animationDelay: "210ms" }}
            >
              <Link
                className="inline-flex items-center justify-center gap-2 rounded-md border border-(--color-text) bg-(--color-accent) px-5 py-3 text-sm font-semibold text-(--color-accent-text) shadow-[5px_5px_0_var(--color-text)] transition hover:-translate-y-0.5 hover:shadow-[7px_7px_0_var(--color-text)]"
                to="/auth"
              >
                Start dubbing
                <ArrowRight className="size-4" />
              </Link>
              <a
                className="inline-flex items-center justify-center gap-2 rounded-md border border-(--color-border) bg-white/75 px-5 py-3 text-sm font-semibold text-(--color-text) transition hover:border-(--color-text) hover:bg-white"
                href="#workflow"
              >
                See workflow
              </a>
            </div>
          </div>

          <StudioWorkflowVisual />
        </div>
      </section>

      <section
        id="workflow"
        className="mx-auto max-w-7xl px-5 py-20 md:px-8 lg:px-10"
      >
        <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:items-start">
          <div>
            <p className="font-mono text-xs font-semibold text-(--color-blue)">
              Workflow
            </p>
            <h2 className="mt-3 max-w-md font-serif text-5xl leading-tight">
              Four steps from raw video to dubbed delivery.
            </h2>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {workflowSteps.map((step, index) => {
              const Icon = step.icon;

              return (
                <article
                  className="rounded-lg border border-(--color-border) bg-(--color-surface) p-5 shadow-[6px_6px_0_rgba(21,23,19,0.1)]"
                  key={step.title}
                >
                  <div className="flex items-start justify-between gap-4">
                    <Icon className="size-6 text-(--color-blue)" />
                    <span className="font-mono text-xs text-(--color-muted)">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="mt-8 text-xl font-semibold">{step.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-(--color-text-dim)">
                    {step.copy}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section
        id="use-cases"
        className="border-y border-(--color-border) bg-white/72"
      >
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-20 md:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:px-10">
          <div>
            <p className="font-mono text-xs font-semibold text-(--color-blue)">
              Use cases
            </p>
            <h2 className="mt-3 font-serif text-5xl leading-tight">
              Built for small teams publishing across languages.
            </h2>
          </div>
          <div className="grid gap-3">
            {useCases.map((useCase) => {
              const Icon = useCase.icon;

              return (
                <article
                  className="grid gap-4 rounded-lg border border-(--color-border) bg-(--color-bg) p-5 sm:grid-cols-[auto_1fr]"
                  key={useCase.title}
                >
                  <span className="flex size-11 items-center justify-center rounded-md bg-(--color-accent) text-(--color-accent-text)">
                    <Icon className="size-5" />
                  </span>
                  <div>
                    <h3 className="text-xl font-semibold">{useCase.title}</h3>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-(--color-text-dim)">
                      {useCase.copy}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
      {/*
      <section
        id="pricing"
        className="mx-auto max-w-7xl px-5 py-20 md:px-8 lg:px-10"
      >
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-mono text-xs font-semibold text-(--color-blue)">
              Pricing preview
            </p>
            <h2 className="mt-3 font-serif text-5xl leading-tight">
              Start small, scale minutes later.
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-6 text-(--color-text-dim)">
            Plan cards are presentation-only in this version. New accounts
            require admin approval before the workspace unlocks.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {pricingPlans.map((plan, index) => (
            <article
              className="flex h-full flex-col rounded-lg border border-(--color-border) bg-(--color-surface) p-6 transition"
              key={plan.name}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold">{plan.name}</h3>
                  <p className="mt-2 min-h-16 text-sm leading-6 text-(--color-text-dim)">
                    {plan.detail}
                  </p>
                </div>
                {index === 1 && (
                  <span className="rounded-md bg-(--color-accent) px-2 py-1 font-mono text-xs font-semibold text-(--color-accent-text)">
                    Popular
                  </span>
                )}
              </div>
              <p className="mt-8 font-serif text-5xl">
                {plan.price}
                <span className="font-sans text-sm text-(--color-text-dim)">
                  /mo
                </span>
              </p>
              <ul className="mt-7 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li
                    className="flex items-start gap-3 text-sm text-(--color-text-dim)"
                    key={feature}
                  >
                    <Check className="mt-0.5 size-4 shrink-0 text-(--color-blue)" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-md border border-(--color-text) bg-white px-4 py-3 text-sm font-semibold text-(--color-text) transition hover:bg-(--color-text) hover:text-(--color-bg)"
                to="/auth"
              >
                Choose {plan.name}
                <ArrowRight className="size-4" />
              </Link>
            </article>
          ))}
        </div>
      </section>*/}

      <section className="px-5 pb-20 md:px-8 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-6 rounded-lg border border-(--color-text) bg-(--color-accent) p-6 text-(--color-accent-text) md:grid-cols-[1fr_auto] md:items-center md:p-8">
          <div>
            <p className="font-mono text-xs font-semibold">Ready workspace</p>
            <h2 className="mt-3 font-serif text-5xl leading-tight">
              Start your next dubbed video.
            </h2>
          </div>
          <Link
            className="inline-flex items-center justify-center gap-2 rounded-md border border-(--color-accent-text) bg-(--color-accent-text) px-5 py-3 text-sm font-semibold text-(--color-bg) transition hover:-translate-y-0.5 hover:bg-(--color-text)"
            to="/auth"
          >
            Open DubStudio
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}

function StudioWorkflowVisual() {
  const meterHeights = ["38%", "64%", "46%", "86%", "55%", "72%", "42%", "68%"];

  return (
    <div
      className="reveal-up relative h-56 overflow-hidden rounded-lg border border-(--color-text) bg-(--color-surface) p-4 shadow-[10px_10px_0_rgba(21,23,19,0.12)] sm:h-72 lg:h-auto lg:min-h-[520px]"
      style={{ animationDelay: "180ms" }}
    >
      <div className="mb-4 flex items-center justify-between border-b border-(--color-border) pb-4">
        <div className="flex items-center gap-2">
          <span className="size-3 rounded-sm bg-(--color-coral)" />
          <span className="size-3 rounded-sm bg-(--color-accent)" />
          <span className="size-3 rounded-sm bg-(--color-blue)" />
        </div>
        <span className="font-mono text-xs text-(--color-muted)">
          render queue 72%
        </span>
      </div>

      <div className="grid gap-4 lg:h-[430px] lg:grid-cols-[1.08fr_0.92fr]">
        <div className="flex min-h-0 flex-col gap-4">
          <div className="relative min-h-64 flex-1 overflow-hidden rounded-md border border-(--color-border) bg-[linear-gradient(145deg,#172033,#34445f)]">
            <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(45deg,rgba(255,255,255,0.08)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.08)_50%,rgba(255,255,255,0.08)_75%,transparent_75%,transparent)] [background-size:28px_28px]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="flex size-16 items-center justify-center rounded-md bg-white/92 text-(--color-text) shadow-xl">
                <Play className="ml-1 size-7 fill-current" />
              </span>
            </div>
            <div className="absolute bottom-4 left-4 right-4 rounded-md border border-white/20 bg-white/90 p-3 text-(--color-text) shadow-lg">
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-xs text-(--color-blue)">
                  Hindi dub
                </span>
                <span className="font-mono text-xs text-(--color-muted)">
                  03:18
                </span>
              </div>
              <div className="mt-3 h-2 rounded-sm bg-(--color-panel)">
                <div className="h-2 w-[72%] rounded-sm bg-(--color-accent)" />
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-md border border-(--color-border) bg-(--color-bg) p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-mono text-xs font-semibold text-(--color-text)">
                timeline
              </span>
              <span className="font-mono text-xs text-(--color-muted)">
                voice sync
              </span>
            </div>
            <div className="relative flex w-[200%] gap-2 timeline-drift">
              {Array.from({ length: 16 }).map((_, index) => (
                <span
                  className="h-12 w-28 shrink-0 rounded-sm border border-(--color-border) bg-white"
                  key={index}
                >
                  <span
                    className="mt-3 block h-2 rounded-sm bg-(--color-accent)"
                    style={{ width: `${44 + (index % 5) * 10}%` }}
                  />
                  <span
                    className="mt-2 block h-1.5 rounded-sm bg-(--color-blue)/25"
                    style={{ width: `${32 + (index % 4) * 13}%` }}
                  />
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="grid min-h-0 gap-4">
          <div className="rounded-md border border-(--color-border) bg-(--color-bg) p-4">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mic2 className="size-4 text-(--color-blue)" />
                <span className="font-mono text-xs font-semibold">
                  voice render
                </span>
              </div>
              <CheckCircle2 className="size-4 text-emerald-600" />
            </div>
            <div className="flex h-24 items-end gap-2">
              {meterHeights.map((height, index) => (
                <span
                  className="meter-pulse w-full rounded-sm bg-(--color-blue)"
                  key={`${height}-${index}`}
                  style={{
                    height,
                    animationDelay: `${index * 120}ms`,
                  }}
                />
              ))}
            </div>
          </div>

          <div className="rounded-md border border-(--color-border) bg-(--color-bg) p-4">
            <div className="mb-4 flex items-center gap-2">
              <Captions className="size-4 text-(--color-blue)" />
              <span className="font-mono text-xs font-semibold">
                transcript
              </span>
            </div>
            <div className="space-y-3">
              <p className="rounded-md bg-white p-3 text-sm leading-6 text-(--color-text-dim)">
                Source detected: English
              </p>
              <p className="rounded-md bg-white p-3 text-sm leading-6 text-(--color-text)">
                Target output: Hindi voiceover with synced captions
              </p>
              <p className="rounded-md bg-white p-3 text-sm leading-6 text-(--color-text-dim)">
                Delivery: authenticated download
              </p>
            </div>
          </div>

          <div className="rounded-md border border-(--color-text) bg-(--color-accent) p-4 text-(--color-accent-text)">
            <div className="flex items-center justify-between gap-4">
              <span className="font-mono text-xs font-semibold">
                current job
              </span>
              <span className="font-mono text-xs">processing</span>
            </div>
            <p className="mt-3 text-2xl font-semibold">
              creator-launch-video.mp4
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

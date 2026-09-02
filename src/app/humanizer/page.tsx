import type { Metadata } from "next";
import { Lock, Ruler, Sparkles } from "lucide-react";
import { CtaBand } from "@/components/marketing/CtaBand";
import { SectionHeading } from "@/components/marketing/SectionHeading";
import { Workspace } from "@/components/workspace/Workspace";

export const metadata: Metadata = {
  title: "AI Humanizer",
  description:
    "Rewrite AI-assisted drafts so they read like a person wrote them. Pick a readability level, purpose and strength, keep your keywords, and see how 12 detectors would score the result.",
};

const TIPS = [
  {
    icon: Ruler,
    title: "Match the reader",
    body: "Set readability to the audience, not the writer. University for essays, Journalist for blogs, Marketing for landing pages.",
  },
  {
    icon: Sparkles,
    title: "Start with Balanced",
    body: "Balanced keeps your structure and facts while fixing rhythm and phrasing. Reach for Aggressive only when a detector still flags the result.",
  },
  {
    icon: Lock,
    title: "Lock what must not change",
    body: "Add product names, people, citations and numbers to the keep-keywords list. They come back exactly as you typed them.",
  },
];

export default function HumanizerPage() {
  return (
    <>
      <section className="relative overflow-hidden pb-14 pt-10 sm:pt-14">
        <div className="dot-grid pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
        <div className="wrap">
          <SectionHeading
            as="h1"
            size="section"
            eyebrow="AI humanizer"
            title="Make AI-assisted writing sound like you"
            lede="Paste a draft, choose how it should read, and get a rewrite that keeps your meaning. Every result is scored before you copy it."
          />
          <div className="mt-8">
            <Workspace mode="humanize" />
          </div>
        </div>
      </section>

      <section className="border-t border-line py-16 sm:py-20" aria-labelledby="tips-heading">
        <div className="wrap">
          <h2 id="tips-heading" className="text-xs font-medium uppercase tracking-[0.14em] text-faint">
            Tips for better rewrites
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {TIPS.map((t) => (
              <div key={t.title} className="card p-5">
                <span className="flex size-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
                  <t.icon className="size-5" aria-hidden />
                </span>
                <h3 className="mt-4 text-[15px] font-medium text-ink">{t.title}</h3>
                <p className="mt-1.5 text-sm leading-6 text-muted">{t.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}

import type { ReactNode } from "react";
import { ClipboardPaste, ScanSearch, WandSparkles } from "lucide-react";
import { SectionHeading } from "@/components/marketing/SectionHeading";

interface Step {
  n: string;
  icon: ReactNode;
  title: string;
  body: string;
  detail: string;
}

const STEPS: Step[] = [
  {
    n: "01",
    icon: <ClipboardPaste className="size-5" aria-hidden />,
    title: "Paste",
    body: "Drop in an essay, a blog post or an email. File upload is on the way.",
    detail: "Up to 500 words free · 10,000 on paid plans",
  },
  {
    n: "02",
    icon: <ScanSearch className="size-5" aria-hidden />,
    title: "Check",
    body: "Every sentence is scored and highlighted, and the panel estimates how 12 detectors would read the whole piece.",
    detail: "Sentence highlights + detector estimates, in about a second",
  },
  {
    n: "03",
    icon: <WandSparkles className="size-5" aria-hidden />,
    title: "Humanize",
    body: "Pick a readability level, a purpose and a strength. Add words to keep. Get a rewrite that keeps your meaning.",
    detail: "Readability · Purpose · Strength · Keep keywords",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 sm:py-28">
      <div className="wrap">
        <SectionHeading
          eyebrow="How it works"
          title="Three steps, one page"
          lede="No setup and nothing to learn. Paste, read the report, and rewrite only what needs it."
        />
        <ol className="mt-12 grid gap-5 md:grid-cols-3">
          {STEPS.map((step) => (
            <li key={step.n} className="card flex flex-col p-6">
              <div className="flex items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
                  {step.icon}
                </span>
                <span className="font-mono text-xs text-faint">{step.n}</span>
              </div>
              <h3 className="mt-5 text-lg font-medium text-ink">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{step.body}</p>
              <p className="mt-4 border-t border-line pt-3 text-xs text-faint">{step.detail}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

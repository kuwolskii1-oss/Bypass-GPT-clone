import type { ReactNode } from "react";
import { FileDown, Gauge, Highlighter, ShieldCheck, SlidersHorizontal, Tags } from "lucide-react";
import { SectionHeading } from "@/components/marketing/SectionHeading";
import { PURPOSE_LABELS, READABILITY_LABELS, STRENGTH_LABELS, STRENGTHS } from "@/lib/engine/types";

const READABILITY = Object.values(READABILITY_LABELS);
const PURPOSES = Object.values(PURPOSE_LABELS);

function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-md border border-line bg-surface px-1.5 py-0.5 text-[11px] leading-4 text-ink-2">
      {children}
    </span>
  );
}

interface Feature {
  icon: ReactNode;
  title: string;
  body: string;
  extra?: ReactNode;
}

const FEATURES: Feature[] = [
  {
    icon: <Highlighter className="size-5" aria-hidden />,
    title: "Sentence-level highlights",
    body: "See exactly which sentences read as machine-written and the signals behind each one, so you fix the cause instead of guessing.",
  },
  {
    icon: <SlidersHorizontal className="size-5" aria-hidden />,
    title: "Readability and purpose controls",
    body: "Match the register your reader expects. The rewrite adapts vocabulary, sentence length and tone to the setting.",
    extra: (
      <div className="mt-4 space-y-2">
        <div className="flex flex-wrap gap-1">
          {READABILITY.map((l) => (
            <Chip key={l}>{l}</Chip>
          ))}
        </div>
        <div className="flex flex-wrap gap-1">
          {PURPOSES.map((l) => (
            <Chip key={l}>{l}</Chip>
          ))}
        </div>
      </div>
    ),
  },
  {
    icon: <Tags className="size-5" aria-hidden />,
    title: "Keep-keywords list",
    body: "Names, product terms, citations and quotes you add are preserved exactly, however deep the rewrite goes.",
  },
  {
    icon: <FileDown className="size-5" aria-hidden />,
    title: "Writing report you can download",
    body: "Export a clean report with the score, the breakdown and the highlighted text for your editor, your client or your records.",
  },
  {
    icon: <Gauge className="size-5" aria-hidden />,
    title: "Three strengths",
    body: "Choose how far the rewrite goes. Start light and step up only if the estimates ask for it.",
    extra: (
      <ul className="mt-4 space-y-1.5 text-xs">
        {STRENGTHS.map((s) => (
          <li key={s} className="flex gap-2">
            <span className="w-[4.5rem] shrink-0 font-medium text-ink-2">{STRENGTH_LABELS[s].label}</span>
            <span className="text-muted">{STRENGTH_LABELS[s].hint}</span>
          </li>
        ))}
      </ul>
    ),
  },
  {
    icon: <ShieldCheck className="size-5" aria-hidden />,
    title: "Private by default",
    body: "Text is processed in memory and returned to you. Nothing is kept on our servers and nothing is used for training.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 sm:py-28">
      <div className="wrap">
        <SectionHeading
          eyebrow="Features"
          title="Everything you need to check and fix a draft"
          lede="The detector tells you where the problem is. The humanizer fixes it without flattening your voice."
        />
        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <li key={f.title} className="card flex flex-col p-6">
              <span className="flex size-10 items-center justify-center rounded-xl bg-accent-soft text-accent">{f.icon}</span>
              <h3 className="mt-5 text-base font-medium text-ink">{f.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{f.body}</p>
              {f.extra}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

import type { ReactNode } from "react";
import { Building2, GraduationCap, Megaphone, PenLine } from "lucide-react";
import { SectionHeading } from "@/components/marketing/SectionHeading";

interface UseCase {
  icon: ReactNode;
  title: string;
  body: string;
}

const CASES: UseCase[] = [
  {
    icon: <GraduationCap className="size-5" aria-hidden />,
    title: "Students",
    body: "Check your own draft before you submit and see the kind of report your department uses, then fix what reads as machine-written.",
  },
  {
    icon: <Megaphone className="size-5" aria-hidden />,
    title: "Marketers",
    body: "Ship blog posts and landing pages that pass editorial review and sound like your brand rather than a template.",
  },
  {
    icon: <PenLine className="size-5" aria-hidden />,
    title: "Editors and publishers",
    body: "Screen submissions sentence by sentence and send writers precise notes instead of a bare percentage.",
  },
  {
    icon: <Building2 className="size-5" aria-hidden />,
    title: "Agencies",
    body: "Run client copy through one consistent check, keep brand terms intact, and attach a report to every deliverable.",
  },
];

export function UseCases() {
  return (
    <section id="use-cases" className="py-20 sm:py-28">
      <div className="wrap">
        <SectionHeading
          eyebrow="Use cases"
          title="Built for people who publish"
          lede="Whoever your reader is, the goal is the same: writing that is clearly yours."
        />
        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {CASES.map((c) => (
            <li key={c.title} className="card p-6">
              <span className="flex size-10 items-center justify-center rounded-xl bg-accent-soft text-accent">{c.icon}</span>
              <h3 className="mt-5 text-base font-medium text-ink">{c.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{c.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

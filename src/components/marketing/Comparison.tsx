import { Check, Minus } from "lucide-react";
import { SectionHeading } from "@/components/marketing/SectionHeading";
import { SITE } from "@/lib/site";

const ROWS = [
  "Sentence-level report",
  "Detector estimates in one view",
  "Keep-keywords list",
  "Meaning-preserving Balanced mode",
  "Free detection with no account",
  "Downloadable report",
];

export function Comparison() {
  return (
    <section id="comparison" className="py-20 sm:py-28">
      <div className="wrap">
        <SectionHeading
          eyebrow="Comparison"
          title={`${SITE.name} vs typical humanizers`}
          lede="Most tools give you a rewrite and a number. We show the work, so you can decide what to change."
        />
        <div className="card mx-auto mt-12 max-w-3xl overflow-x-auto">
          <table className="w-full min-w-[32rem] text-sm">
            <caption className="sr-only">Feature comparison between {SITE.name} and typical humanizers</caption>
            <thead>
              <tr className="border-b border-line text-left">
                <th scope="col" className="px-5 py-4 text-xs font-medium uppercase tracking-[0.12em] text-faint">
                  Feature
                </th>
                <th scope="col" className="px-5 py-4 text-center text-sm font-medium text-ink">
                  {SITE.name}
                </th>
                <th scope="col" className="px-5 py-4 text-center text-sm font-medium text-muted">
                  Typical humanizers
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {ROWS.map((row) => (
                <tr key={row}>
                  <th scope="row" className="px-5 py-3.5 text-left font-normal text-ink-2">
                    {row}
                  </th>
                  <td className="px-5 py-3.5 text-center">
                    <span className="inline-flex size-6 items-center justify-center rounded-full bg-accent-soft text-accent">
                      <Check className="size-3.5" aria-hidden />
                      <span className="sr-only">Included</span>
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <Minus className="inline size-4 text-faint" aria-hidden />
                    <span className="sr-only">Not included</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

import type { Metadata } from "next";
import { CtaBand } from "@/components/marketing/CtaBand";
import { FAQ } from "@/components/marketing/FAQ";
import { Pricing } from "@/components/marketing/Pricing";
import { SectionHeading } from "@/components/marketing/SectionHeading";
import { PLANS, type PlanId } from "@/lib/site";
import { formatNumber } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Free AI detection for everyone. Paid plans raise the humanizer word limits, add downloadable reports, history, API access and team seats.",
};

/** Plan details that are not part of the shared PLANS record. */
const DETAILS: Record<PlanId, { history: string; api: string; seats: string }> = {
  free: { history: "In your browser", api: "—", seats: "1" },
  starter: { history: "30 days", api: "—", seats: "1" },
  pro: { history: "Unlimited", api: "—", seats: "1" },
  business: { history: "Unlimited", api: "Included", seats: "5" },
};

const COLUMNS = ["Plan", "Words / month", "Words / request", "History", "API", "Seats"];

export default function PricingPage() {
  return (
    <>
      <div className="wrap pt-16 sm:pt-24">
        <SectionHeading
          as="h1"
          eyebrow="Pricing"
          title="Simple plans, honest limits"
          lede="Detection is free for everyone, with no account. Paid plans raise how many words the humanizer will rewrite each month and per request."
        />
      </div>

      <Pricing heading={false} />

      <section aria-labelledby="compare-heading" className="pb-20 sm:pb-28">
        <div className="wrap">
          <h2 id="compare-heading" className="text-center text-xl font-medium tracking-[-0.01em] text-ink">
            Compare plans
          </h2>
          <div className="card mx-auto mt-8 max-w-4xl overflow-x-auto">
            <table className="w-full min-w-[40rem] text-sm">
              <caption className="sr-only">Limits and inclusions by plan</caption>
              <thead>
                <tr className="border-b border-line">
                  {COLUMNS.map((c, i) => (
                    <th
                      key={c}
                      scope="col"
                      className={`px-5 py-4 text-xs font-medium uppercase tracking-[0.12em] text-faint ${i === 0 ? "text-left" : "text-right"}`}
                    >
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {PLANS.map((plan) => {
                  const d = DETAILS[plan.id];
                  return (
                    <tr key={plan.id} className={plan.highlighted ? "bg-accent-soft/40" : undefined}>
                      <th scope="row" className="px-5 py-3.5 text-left font-medium text-ink">
                        {plan.name}
                      </th>
                      <td className="px-5 py-3.5 text-right font-mono text-ink-2">{formatNumber(plan.wordsPerMonth)}</td>
                      <td className="px-5 py-3.5 text-right font-mono text-ink-2">{formatNumber(plan.wordsPerRequest)}</td>
                      <td className="px-5 py-3.5 text-right text-ink-2">{d.history}</td>
                      <td className="px-5 py-3.5 text-right text-ink-2">{d.api}</td>
                      <td className="px-5 py-3.5 text-right font-mono text-ink-2">{d.seats}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <FAQ />
      <CtaBand />
    </>
  );
}

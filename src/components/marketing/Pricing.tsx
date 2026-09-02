"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { SectionHeading } from "@/components/marketing/SectionHeading";
import { PLANS, SITE, type Plan } from "@/lib/site";
import { cn, formatNumber } from "@/lib/utils";

function ctaHref(plan: Plan): string {
  if (plan.id === "free") return "/humanizer";
  if (plan.id === "business") return `mailto:${SITE.supportEmail}`;
  return "/dashboard";
}

function money(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
}

function billingNote(plan: Plan, yearly: boolean): string {
  if (plan.monthly === 0) return "Free forever, no card needed";
  if (yearly) return `Billed yearly · $${money(plan.yearlyMonthly * 12)}/yr`;
  return "Billed monthly, cancel any time";
}

export function Pricing({ heading = true }: { heading?: boolean }) {
  const [yearly, setYearly] = useState(true);

  return (
    <section id="pricing" className={cn(heading ? "py-20 sm:py-28" : "pb-20 pt-10 sm:pb-28 sm:pt-12")}>
      <div className="wrap">
        {heading && (
          <SectionHeading
            eyebrow="Pricing"
            title="Start free. Upgrade when you write more."
            lede="Every plan includes unlimited detection. Paid plans raise how many words the humanizer will rewrite."
          />
        )}

        <div className={cn("flex flex-wrap items-center justify-center gap-3", heading && "mt-10")}>
          <button
            type="button"
            onClick={() => setYearly(false)}
            className={cn("text-sm transition-colors", yearly ? "text-muted hover:text-ink" : "text-ink")}
          >
            Monthly
          </button>
          <Switch checked={yearly} onChange={setYearly} label="Bill yearly" />
          <button
            type="button"
            onClick={() => setYearly(true)}
            className={cn("text-sm transition-colors", yearly ? "text-ink" : "text-muted hover:text-ink")}
          >
            Yearly
          </button>
          <Badge tone="accent">Save up to 40%</Badge>
        </div>

        <ul className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((plan) => {
            const price = plan.monthly === 0 ? 0 : yearly ? plan.yearlyMonthly : plan.monthly;
            return (
              <li
                key={plan.id}
                className={cn(
                  "card relative flex flex-col p-6",
                  plan.highlighted && "border-accent ring-4 ring-accent-soft",
                )}
              >
                {plan.highlighted && (
                  <Badge tone="accent" className="absolute -top-3 left-1/2 -translate-x-1/2 shadow-card">
                    Most popular
                  </Badge>
                )}
                <h3 className="text-base font-medium text-ink">{plan.name}</h3>
                <p className="mt-1 text-sm leading-6 text-muted">{plan.blurb}</p>

                <div className="mt-5 flex items-baseline gap-1">
                  <span className="text-4xl font-medium tracking-[-0.03em] text-ink">${money(price)}</span>
                  {price > 0 && <span className="text-sm text-muted">/mo</span>}
                </div>
                <p className="mt-1 text-xs text-faint">{billingNote(plan, yearly)}</p>

                <dl className="mt-5 grid grid-cols-2 gap-3 rounded-xl bg-surface p-3">
                  <div>
                    <dt className="text-[11px] text-faint">Words / month</dt>
                    <dd className="mt-0.5 text-sm font-medium text-ink">{formatNumber(plan.wordsPerMonth)}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] text-faint">Per request</dt>
                    <dd className="mt-0.5 text-sm font-medium text-ink">{formatNumber(plan.wordsPerRequest)}</dd>
                  </div>
                </dl>

                <ul className="mt-5 space-y-2.5 text-sm text-ink-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-2.5">
                      <Check className="mt-1 size-3.5 shrink-0 text-accent" aria-hidden />
                      <span className="leading-5">{f}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-6">
                  <Button href={ctaHref(plan)} variant={plan.highlighted ? "accent" : "secondary"} className="w-full">
                    {plan.cta}
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>

        <p className="mt-6 text-center text-sm text-faint">
          Words are counted on the humanizer only. Detection is always free.
        </p>
      </div>
    </section>
  );
}

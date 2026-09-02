"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Segmented } from "@/components/ui/Segmented";
import { SectionHeading } from "@/components/marketing/SectionHeading";
import {
  BILLING_PERIODS,
  DEFAULT_PERIOD,
  FREE_ALLOWANCE,
  PLANS,
  SITE,
  maxSaving,
  weeklyPrice,
  type PeriodId,
  type Plan,
} from "@/lib/site";
import { cn, formatNumber, money } from "@/lib/utils";

function ctaHref(plan: Plan): string {
  if (plan.id === "free") return "/humanizer";
  if (plan.id === "business") return `mailto:${SITE.supportEmail}`;
  return "/dashboard";
}

const PERIOD_OPTIONS = BILLING_PERIODS.map((b) => ({ value: b.id, label: b.label }));

export function Pricing({ heading = true }: { heading?: boolean }) {
  const [period, setPeriod] = useState<PeriodId>(DEFAULT_PERIOD);
  const term = BILLING_PERIODS.find((b) => b.id === period) ?? BILLING_PERIODS[1];
  const saving = Math.round(maxSaving(period) * 100);

  return (
    <section id="pricing" className={cn(heading ? "py-20 sm:py-28" : "pb-20 pt-10 sm:pb-28 sm:pt-12")}>
      <div className="wrap">
        {heading && (
          <SectionHeading
            eyebrow="Pricing"
            title="Start free. Upgrade when you write more."
            lede="Every plan includes unlimited detection. Pick a 1, 4 or 12 week term; longer terms cost less per week and include more words."
          />
        )}

        <div className={cn("flex flex-wrap items-center justify-center gap-3", heading && "mt-10")}>
          <Segmented value={period} options={PERIOD_OPTIONS} onChange={setPeriod} size="md" label="Billing term" className="[&>span]:sr-only" />
          {saving > 0 ? (
            <Badge tone="accent">Save up to {saving}% vs weekly</Badge>
          ) : (
            <Badge tone="neutral">Pay week by week</Badge>
          )}
        </div>

        <ul className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((plan) => {
            const tier = plan.prices[period];
            const free = plan.id === "free";
            const perWeek = weeklyPrice(plan, period);
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

                <div className="mt-5 flex items-baseline gap-1.5">
                  <span className="text-4xl font-medium tracking-[-0.03em] text-ink">${money(tier.price)}</span>
                  {!free && <span className="text-sm text-muted">/ {term.label}</span>}
                </div>
                <p className="mt-1 text-xs text-faint">
                  {free
                    ? "Free forever, no card needed"
                    : term.weeks === 1
                      ? term.billed
                      : `$${perWeek.toFixed(2)} per week · ${term.billed}`}
                </p>

                <dl className="mt-5 grid grid-cols-2 gap-3 rounded-xl bg-surface p-3">
                  <div>
                    <dt className="text-[11px] text-faint">
                      Words / {free ? `${FREE_ALLOWANCE.weeks} weeks` : term.label}
                    </dt>
                    <dd className="mt-0.5 text-sm font-medium text-ink">{formatNumber(tier.words)}</dd>
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
          Words are counted on the humanizer only and reset at the start of each term. Detection is always free.
        </p>
      </div>
    </section>
  );
}

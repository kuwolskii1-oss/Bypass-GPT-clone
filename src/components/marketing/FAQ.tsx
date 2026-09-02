import { ChevronDown } from "lucide-react";
import { SectionHeading } from "@/components/marketing/SectionHeading";
import { FAQS } from "@/lib/site";

export function FAQ() {
  return (
    <section id="faq" className="py-20 sm:py-28">
      <div className="wrap">
        <SectionHeading
          eyebrow="FAQ"
          title="Questions, answered"
          lede="Short answers about how the detector, the humanizer and the plans actually work."
        />
        <div className="mx-auto mt-12 max-w-3xl border-y border-line">
          {FAQS.map((item) => (
            <details key={item.q} className="group border-b border-line py-5 last:border-b-0">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-medium text-ink [&::-webkit-details-marker]:hidden">
                <span>{item.q}</span>
                <ChevronDown
                  className="size-4 shrink-0 text-faint transition-transform duration-200 group-open:rotate-180"
                  aria-hidden
                />
              </summary>
              <p className="mt-3 pr-8 text-sm leading-6 text-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

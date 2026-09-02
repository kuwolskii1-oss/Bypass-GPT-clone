import { Quote } from "lucide-react";
import { SectionHeading } from "@/components/marketing/SectionHeading";
import { TESTIMONIALS } from "@/lib/site";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((part) => part.replace(/[^A-Za-z]/g, "").charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function Testimonials() {
  return (
    <section id="testimonials" className="py-20 sm:py-28">
      <div className="wrap">
        <SectionHeading
          eyebrow="What people say"
          title="Quiet, useful, and out of the way"
          lede="From students to agency teams, the same note keeps coming back: it shows you what to fix."
        />
        <ul className="mt-12 grid gap-5 sm:grid-cols-2">
          {TESTIMONIALS.map((t) => (
            <li key={t.name}>
              <figure className="card flex h-full flex-col p-6">
                <Quote className="size-5 text-accent-ring" aria-hidden />
                <blockquote className="mt-4 flex-1 text-[15px] leading-7 text-ink-2">
                  <p>{t.quote}</p>
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <span
                    className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-medium text-accent-strong"
                    aria-hidden
                  >
                    {initials(t.name)}
                  </span>
                  <span className="flex flex-col">
                    <span className="text-sm font-medium text-ink">{t.name}</span>
                    <span className="text-xs text-muted">{t.role}</span>
                  </span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

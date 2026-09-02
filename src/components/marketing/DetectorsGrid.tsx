import { SectionHeading } from "@/components/marketing/SectionHeading";
import { DETECTORS } from "@/lib/engine/types";

/** Illustrative dot colours only — live estimates are rendered by the workspace after a check. */
const DOTS = ["bg-human", "bg-mixed", "bg-ai"] as const;

export function DetectorsGrid() {
  return (
    <section id="detectors" className="py-20 sm:py-28">
      <div className="wrap">
        <SectionHeading
          eyebrow="Detector estimates"
          title="See how 12 detectors would likely score it"
          lede="One paste, twelve estimates. Instead of checking each service by hand, the panel shows a likely score for every detector your reader might use."
        />
        <ul className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {DETECTORS.map((d, i) => (
            <li key={d.id} className="card flex flex-col gap-1.5 p-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="truncate text-sm font-medium text-ink">{d.name}</h3>
                <span className={`size-2 shrink-0 rounded-full ${DOTS[i % DOTS.length]}`} aria-hidden />
              </div>
              <p className="text-xs leading-5 text-muted">{d.blurb}</p>
              {d.longFormOnly && <p className="mt-auto pt-1 text-[11px] text-faint">Needs 300+ words</p>}
            </li>
          ))}
        </ul>
        <p className="mx-auto mt-8 max-w-2xl text-center text-xs leading-5 text-faint">
          Estimates come from our own model, tuned to how each detector is known to behave. They are not live results
          from those services, and the dots above are illustrative. Always confirm with the detector your reader uses.
        </p>
      </div>
    </section>
  );
}

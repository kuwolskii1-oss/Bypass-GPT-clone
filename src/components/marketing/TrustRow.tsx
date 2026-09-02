import { DETECTORS } from "@/lib/engine/types";
import { STATS } from "@/lib/site";

export function TrustRow() {
  return (
    <section aria-label="Detectors and usage" className="border-y border-line bg-surface/50">
      <div className="wrap py-10 sm:py-12">
        <p className="text-center text-xs font-medium uppercase tracking-[0.14em] text-faint">
          Estimates calibrated against
        </p>
        <ul className="mt-5 flex flex-wrap justify-center gap-2">
          {DETECTORS.map((d) => (
            <li
              key={d.id}
              className="rounded-full border border-line bg-canvas px-3 py-1.5 text-[13px] leading-none text-muted"
            >
              {d.name}
            </li>
          ))}
        </ul>

        <dl className="mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-y-8 sm:grid-cols-4 sm:divide-x sm:divide-line">
          {STATS.map((s) => (
            <div key={s.label} className="flex flex-col-reverse items-center px-4 text-center">
              <dt className="mt-1 max-w-[11rem] text-xs leading-5 text-muted">{s.label}</dt>
              <dd className="text-2xl font-medium tracking-[-0.02em] text-ink sm:text-3xl">{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

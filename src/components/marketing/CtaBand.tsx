import { Button } from "@/components/ui/Button";

export function CtaBand() {
  return (
    <section aria-labelledby="cta-heading" className="wrap pb-20 sm:pb-28">
      <div className="relative isolate overflow-hidden rounded-3xl bg-ink px-6 py-16 text-center sm:px-12 sm:py-20">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-full bg-[radial-gradient(60%_50%_at_50%_0%,rgb(91_91_214/0.35),transparent_70%)]"
        />
        <h2 id="cta-heading" className="text-3xl font-medium tracking-[-0.02em] text-white sm:text-4xl">
          Make your next draft read like you.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-white/60">
          Free detection, 1,500 humanizer words a month, and no account needed to start.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button href="/humanizer" variant="accent" size="lg">
            Humanize my text
          </Button>
          <Button href="/ai-detector" variant="secondary" size="lg">
            Check for AI
          </Button>
        </div>
      </div>
    </section>
  );
}

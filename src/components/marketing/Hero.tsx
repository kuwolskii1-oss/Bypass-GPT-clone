import { ScanSearch, WandSparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Workspace } from "@/components/workspace/Workspace";

export function Hero() {
  return (
    <section id="top" className="relative">
      <div className="wrap pb-20 pt-14 sm:pb-28 sm:pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow animate-fade-up">AI detector + humanizer</p>
          <h1 className="h-display mt-4 animate-fade-up [animation-delay:80ms]">
            Write like a person.
            <br className="hidden sm:block" /> Even when AI helped.
          </h1>
          <p className="lede mx-auto mt-5 max-w-2xl animate-fade-up [animation-delay:160ms]">
            Paste any text. Prosely shows which sentences read as machine-written, estimates how 12 detectors would
            score it, and rewrites it so it sounds like you — meaning intact.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 animate-fade-up [animation-delay:240ms] sm:flex-row">
            <Button href="/humanizer" variant="accent" size="lg" icon={<WandSparkles className="size-4" aria-hidden />}>
              Humanize my text
            </Button>
            <Button href="/ai-detector" variant="secondary" size="lg" icon={<ScanSearch className="size-4" aria-hidden />}>
              Check for AI
            </Button>
          </div>
          <p className="mt-4 text-sm text-faint animate-fade-up [animation-delay:320ms]">
            Free to try · No account needed · 500 words per check
          </p>
        </div>

        <div className="relative isolate mt-14 animate-fade-up [animation-delay:420ms] sm:mt-16">
          <div aria-hidden className="pointer-events-none absolute -inset-x-6 -bottom-10 -top-16 -z-10 sm:-inset-x-12">
            <div className="dot-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_35%,transparent_75%)]" />
            <div className="absolute inset-x-0 top-0 h-2/3 bg-[radial-gradient(60%_60%_at_50%_0%,var(--color-accent-soft),transparent_70%)] opacity-80" />
          </div>
          <Workspace mode="humanize" embedded />
        </div>
      </div>
    </section>
  );
}

import type { Metadata } from "next";
import { House } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <div className="wrap flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="eyebrow">404</p>
      <h1 className="h-section mt-3">That page wandered off.</h1>
      <p className="lede mt-4 max-w-md">
        The link may be old or the address mistyped. Everything you need is one step from the home page.
      </p>
      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
        <Button href="/" icon={<House className="size-4" aria-hidden />}>
          Back to home
        </Button>
        <Button href="/ai-detector" variant="secondary">
          Check for AI
        </Button>
      </div>
    </div>
  );
}

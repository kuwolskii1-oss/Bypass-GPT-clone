import Link from "next/link";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-7", className)} aria-hidden fill="none">
      <rect width="32" height="32" rx="9" className="fill-accent" />
      <path
        d="M7.5 19.5c3-7 5.5-7 8.5 0s5.5 7 8.5 0"
        stroke="white"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.5 13.5c3-4 5.5-4 8.5 0s5.5 4 8.5 0"
        stroke="white"
        strokeOpacity="0.55"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({ className, withText = true }: { className?: string; withText?: boolean }) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-2.5", className)} aria-label={`${SITE.name} home`}>
      <LogoMark />
      {withText && <span className="text-[17px] font-semibold tracking-[-0.02em] text-ink">{SITE.name}</span>}
    </Link>
  );
}

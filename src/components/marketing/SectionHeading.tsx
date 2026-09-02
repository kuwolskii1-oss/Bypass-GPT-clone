import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow: string;
  title: ReactNode;
  lede?: ReactNode;
  align?: "center" | "left";
  /** Heading level. Pages should have exactly one h1. */
  as?: "h1" | "h2";
  /** "section" keeps an h1 at section size, for tool pages where the editor is the hero. */
  size?: "display" | "section";
  className?: string;
}

/** Shared eyebrow + title + lede stack used at the top of every marketing section. */
export function SectionHeading({
  eyebrow,
  title,
  lede,
  align = "center",
  as: Tag = "h2",
  size = "display",
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn("max-w-2xl", align === "center" ? "mx-auto text-center" : "text-left", className)}>
      <p className="eyebrow">{eyebrow}</p>
      <Tag className={cn("mt-3", Tag === "h1" && size === "display" ? "h-display" : "h-section")}>{title}</Tag>
      {lede && <p className="lede mt-4">{lede}</p>}
    </div>
  );
}

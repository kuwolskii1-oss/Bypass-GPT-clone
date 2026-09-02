import Link from "next/link";
import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "accent" | "secondary" | "ghost" | "soft" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-all duration-200 select-none disabled:pointer-events-none disabled:opacity-50 active:scale-[0.985]";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-ink text-white hover:bg-ink-2",
  accent: "bg-accent text-white hover:bg-accent-strong shadow-[0_1px_0_0_rgb(255_255_255/0.12)_inset]",
  secondary: "border border-line bg-canvas text-ink hover:border-line-strong hover:bg-surface",
  ghost: "text-ink-2 hover:bg-surface hover:text-ink",
  soft: "bg-accent-soft text-accent-strong hover:bg-[#e4e3fc]",
  danger: "bg-ai text-white hover:bg-[#c94040]",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-[13px]",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-[15px]",
};

interface BaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
  className?: string;
  children?: ReactNode;
}

type ButtonProps = BaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & {
    href?: string;
  };

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  iconRight,
  className,
  children,
  href,
  ...rest
}: ButtonProps) {
  const classes = cn(base, variants[variant], sizes[size], className);
  const content = (
    <>
      {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : icon}
      {children}
      {!loading && iconRight}
    </>
  );
  if (href) {
    return (
      <Link href={href} className={classes} aria-disabled={rest.disabled || undefined}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" className={classes} disabled={loading || rest.disabled} {...rest}>
      {content}
    </button>
  );
}

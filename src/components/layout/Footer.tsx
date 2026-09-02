import Link from "next/link";
import { Logo } from "@/components/layout/Logo";
import { FOOTER_LINKS, SITE } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-line bg-surface/60">
      <div className="wrap py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-4 text-sm leading-6 text-muted">
              Check any text for AI writing and rewrite it so it reads like a person wrote it.
            </p>
          </div>
          {FOOTER_LINKS.map((group) => (
            <div key={group.title}>
              <h3 className="text-xs font-medium uppercase tracking-[0.12em] text-faint">{group.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-ink-2 transition-colors hover:text-ink">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-line pt-6 text-xs text-faint sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</p>
          <p className="max-w-xl leading-5">
            Detector scores shown are estimates from our own model. {SITE.name} is not affiliated with GPTZero, Turnitin,
            Originality.ai, Copyleaks or any other detector named.
          </p>
        </div>
      </div>
    </footer>
  );
}

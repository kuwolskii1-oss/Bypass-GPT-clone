# Handoff notes for the next session

Read this first. It records what is built, the decisions behind it, and what to do next.

## State

- Product: **Prosely**, an AI detector + humanizer SaaS clone in the spirit of Undetectable.ai, BypassGPT, Walter Writes AI, with a Turnitin-style writing report. See `README.md` for the full feature list and architecture.
- Branch: `claude/ai-detection-tool-clone-25ym3f`. Everything is committed and pushed. `npm test`, `npm run lint`, `npm run typecheck` and `npm run build` all pass.
- Stack: Next.js 16 (App Router, Turbopack), React 19, TypeScript strict, Tailwind v4, Geist font (npm `geist`), Lucide icons, vitest. No database, no auth, no payments yet.
- Engine: `src/lib/engine/` is pure TypeScript. Detection is deterministic and local. The humanizer is rule-based, with an optional Claude engine in `src/lib/ai/` enabled by `ANTHROPIC_API_KEY` (see `.env.example`).
- Pricing: 1 / 4 / 12 week terms defined in `src/lib/site.ts` (`PLANS`, `BILLING_PERIODS`). Free tier is 1,500 words per rolling 4 weeks (`FREE_ALLOWANCE`), tracked in the browser in `src/lib/history.ts`.

## Design rules

- Light-first, white canvas, one violet accent (`accent`), status colours only for human / mixed / AI. Hairline borders, `rounded-2xl` cards, `shadow-card`. Headings `font-medium` with tight tracking.
- Copy is honest: the detector panel shows **estimates from our own model**, never claims to be live GPTZero / Turnitin results, and never promises guaranteed bypass. Keep it that way.
- Design tokens live in `src/app/globals.css` (`@theme`). UI primitives in `src/components/ui/`.

## What was blocked last time

The previous session ran with **Trusted** network access, so walterwrites.ai, bypassgpt.ai, undetectable.ai, turnitin.com and flaticon.com were unreachable. The UI was built from third-party research (reviews, help-centre excerpts, one BypassGPT screenshot). With **Full** or **Custom** network access these can now be browsed directly.

## Suggested next steps

1. **Compare against the real sites.** Use Playwright (Chromium is at `/opt/pw-browsers/chromium`; a scratch install of the `playwright` npm package works with `executablePath`) to screenshot each reference tool's main humanizer / detector page and pricing page at 1440 px. Compare with ours and refine spacing, control placement, empty states and copy where theirs is clearer. Keep our palette and honesty rules.
2. **Icons.** If Flaticon "symbol" icons are wanted, download the specific SVGs, put them in `public/icons/`, and add the attribution line Flaticon requires to the footer. Otherwise keep Lucide.
3. **Verify the humanizer on real samples.** Paste a few ChatGPT outputs, check `after.aiProbability`, and tune `src/lib/engine/lexicon.ts` replacements that read awkwardly. Tests in `src/lib/engine/__tests__/` guard calibration; keep them green.
4. **Product depth** (in order): accounts (NextAuth or Clerk), Stripe checkout for the 1 / 4 / 12 week terms, server-side history and usage, DOCX/PDF upload, public API keys.
5. **Always** run `npm test && npm run lint && npm run typecheck && npm run build` before pushing, commit small, and push after every completed step.

## Handy commands

```bash
npm run dev                      # http://localhost:3000
npm run build && npm start       # production
npm test                         # engine tests
```

Screenshot flow used previously lives only in the scratchpad; recreate it with Playwright: load `/humanizer`, click "Try a sample" → "ChatGPT-style essay", then "Check for AI", "Full report", "Humanize", and the Compare tab.

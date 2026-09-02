# Prosely — AI detector and humanizer

A clean, production-shaped clone of the AI-detection and humanizer category (Undetectable.ai, BypassGPT, Walter Writes AI) with a Turnitin-style writing report. Built with Next.js 16, React 19, TypeScript and Tailwind v4.

## What it does

- **AI Detector** — paste text, get a document score, a verdict, and every sentence highlighted (AI / mixed / human). Click a sentence to see the tells behind its score. Flags hidden characters, look-alike letters and irregular spacing.
- **Detector estimates** — one panel estimates how 12 public detectors (GPTZero, Turnitin, Originality.ai, Copyleaks, ZeroGPT, Winston, Sapling, Writer, QuillBot, Grammarly, Crossplag, Content at Scale) would likely score the text. These are estimates from our own model, labelled as such everywhere; they are not live third-party results.
- **Writing report** — a Turnitin-like layout: document on the left, "Submission breakdown" on the right with the percentage of qualifying text, a segmented bar, legend, flags and disclaimers. Below 20% the score shows as `*` and highlights are off by default. Downloadable as a standalone HTML file.
- **Humanizer** — rewrites text with controls for readability (High school → Marketing), purpose (Essay, Article, Cover letter, Legal…), strength (Light / Balanced / Aggressive) and a keep-keywords list that is preserved verbatim. Output shows before/after scores, an edit count, a Highlights tab and a word-level Compare diff. Re-humanize produces a new variant.
- **Dashboard** — usage ring against the free allowance (1,500 words per rolling 4 weeks), history of checks and rewrites (kept in the browser), reopen any entry.
- **Marketing site** — landing page with the tool embedded in the hero, how it works, features, report preview, detector grid, use cases, comparison, testimonials, pricing with a 1 / 4 / 12 week term switch, FAQ, and a pricing page with a compare table.

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
```

Other scripts:

```bash
npm run build && npm start   # production
npm test                     # engine unit tests (vitest)
npm run lint                 # eslint
npm run typecheck            # tsc --noEmit
```

## Optional: rewrite with Claude

The humanizer works offline with a deterministic rule engine. Set `ANTHROPIC_API_KEY` (see `.env.example`) and the `/api/humanize` route rewrites with Claude instead, falling back to the local engine on any error or refusal. Detection is always local so results are deterministic and free.

| Variable | Purpose |
| --- | --- |
| `ANTHROPIC_API_KEY` | Enables the Claude engine. |
| `PROSELY_ENGINE` | `claude` or `local` to force an engine. |
| `PROSELY_CLAUDE_MODEL` | Defaults to `claude-opus-5`. |
| `PROSELY_CLAUDE_EFFORT` | `low` … `max`, defaults to `medium`. |
| `PROSELY_MAX_WORDS` | Per-request cap enforced by the API (default 500, hard max 10,000). |

## How the engine works

`src/lib/engine/` is pure TypeScript with no runtime dependencies; it runs in route handlers and in the browser.

- `text.ts` — sentence splitter with character offsets, tokenizer, syllables and Flesch-Kincaid grade, hidden-character scan, seeded PRNG.
- `lexicon.ts` — 300+ LLM tell-phrases with plainer replacements, transitional openers, contraction rules, intensifiers, formal→plain simplifications, casual markers.
- `detect.ts` — combines burstiness (sentence-length variation), transition rate, phrase density, contractions, first person, casual markers, questions and asides, word length, list patterns and paragraph uniformity into a document logit, then blends it with per-sentence evidence for highlights.
- `detectors.ts` — re-weights the same evidence per detector profile with a small deterministic jitter.
- `humanize.ts` — protects keywords/URLs/code, replaces phrases and openers, applies contractions at a register-dependent rate, drops intensifiers, simplifies vocabulary, splits long sentences and merges neighbours (folding "So," / "Still," into clauses) so rhythm varies, fixes articles and capitalisation, and re-scores.
- `samples.ts` — the three "Try a sample" texts used for calibration tests.

Calibration on the bundled samples: the AI-style essay scores 100, the human blog post 0, the mixed draft 54. Aggressive humanizing takes the essay from 100 to the low 40s (mixed) with the local engine; the Claude engine rewrites more deeply.

## Project layout

```
src/app/            pages (/, /humanizer, /ai-detector, /pricing, /dashboard) and /api routes
src/components/ui   Button, Badge, Select, Segmented, Switch, Card, Hint
src/components/layout, marketing, workspace, dashboard
src/lib/engine      detection + humanizer (tested)
src/lib/ai          Claude provider
src/lib/server      validation and in-memory rate limiting
src/lib/{api,history,diff,report,site,use-storage,utils}.ts
```

## Design notes

Light-first, one calm violet accent, status colours reserved for human / mixed / AI, Geist type, hairline borders and soft shadows. Icons are [Lucide](https://lucide.dev) line icons (ISC licence), which match the clean "symbol" style; if you swap in Flaticon icons, follow Flaticon's attribution terms.

## What is intentionally not here yet

Accounts and billing (Stripe), server-side history, DOCX/PDF upload, a Chrome extension and public API keys. The plan limits, usage counter and rate limiter are wired so those can be added without changing the UI.

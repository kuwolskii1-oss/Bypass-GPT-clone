# Prosely — AI detector and humanizer

A clean, production-shaped clone of the AI-detection and humanizer category (Undetectable.ai, BypassGPT, Walter Writes AI) with a Turnitin-style writing report. Built with Next.js 16, React 19, TypeScript and Tailwind v4.

## What it does

- **AI Detector** — paste text, get a document score, a verdict, and every sentence highlighted (AI / mixed / human). Click a sentence to see the tells behind its score. Flags hidden characters, look-alike letters and irregular spacing.
- **Detector estimates** — one panel estimates how 12 public detectors (GPTZero, Turnitin, Originality.ai, Copyleaks, ZeroGPT, Winston, Sapling, Writer, QuillBot, Grammarly, Crossplag, Content at Scale) would likely score the text. These are estimates from our own model, labelled as such everywhere; they are not live third-party results.
- **Writing report** — a Turnitin-like layout: document on the left, "Submission breakdown" on the right with the percentage of qualifying text, a segmented bar, legend, flags and disclaimers. Below 20% the score shows as `*` and highlights are off by default. Downloadable as a standalone HTML file.
- **Document upload** — drop a .docx, .pdf, .txt or .md file onto the editor or use Upload file (10 MB max). Text is extracted in the browser: DOCX with the built-in `DecompressionStream`, PDF with pdf.js loaded on demand (`src/lib/documents.ts`). Scanned PDFs without a text layer, password-protected PDFs and legacy .doc files get a clear message instead.
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

The humanizer works offline with a deterministic rule engine. Set `ANTHROPIC_API_KEY` (see `.env.example`) and the `/api/humanize` route rewrites with Claude instead, falling back to the local engine on any error or refusal. The Claude rewrite is detector-guided: the first pass is scored locally, and sentences that still read as machine-written are sent back once with the reasons ("Contrast framing", "Trailing -ing clause"); the revision is kept only if it scores better. Detection is always local so results are deterministic and free.

| Variable | Purpose |
| --- | --- |
| `ANTHROPIC_API_KEY` | Enables the Claude engine. |
| `PROSELY_ENGINE` | `claude` or `local` to force an engine. |
| `PROSELY_CLAUDE_MODEL` | Defaults to `claude-opus-5-5`. |
| `PROSELY_CLAUDE_EFFORT` | `low` … `max`, defaults to `medium`. |
| `PROSELY_MAX_WORDS` | Per-request cap enforced by the API (default 500, hard max 10,000). |

## Standalone page

`npm run build:artifact` bundles the engine into `artifact/prosely.html`, a single self-contained page with the humanizer, detector, breakdown, detector estimates and document upload (drag-and-drop or Upload file; PDF text comes from pdf.js 5.4.296 on cdnjs) that runs entirely in the browser (no server, no key). `artifact/prosely.template.html` is the page; the script inlines the engine where the `/*__ENGINE__*/` placeholder sits. The built page is committed so it can be published as-is.

## How the engine works

`src/lib/engine/` is pure TypeScript with no runtime dependencies; it runs in route handlers and in the browser.

- `text.ts` — sentence splitter with character offsets, tokenizer, syllables and Flesch-Kincaid grade, hidden-character scan, seeded PRNG.
- `lexicon.ts` — 380+ tell-phrases with plainer replacements, transitional openers graded by how formulaic they are, contraction rules, intensifiers, formal→plain simplifications, casual markers.
- `style.ts` — the structural signals of current model prose: contrast framing ("not X but Y", "It isn't X. It's Y."), participial tails (", highlighting…"), signpost sentences, em-dash asides, paired abstractions, markdown scaffolding with bold-label bullets. Also masks citations, quotations and markdown markers so they are not counted as the author's voice.
- `detect.ts` — combines rhythm, graded transitions, phrase density and the structural signals with human signals (contractions, first person in a relaxed register, casual markers, asides, numbers) into a document logit, blends it with per-sentence evidence, and pulls short or mostly-quoted texts toward the middle instead of reporting false precision. Each flagged sentence names its signal.
- `detectors.ts` — re-weights the same evidence per detector profile with a small deterministic jitter.
- `humanize.ts` — a three-step ladder. **Light** swaps tells and formulaic openers. **Balanced** adds structural rewrites (contrast framing → "Y rather than X", em-dash asides, participial tails → their own sentence, concessive openers), contractions, sentence splitting and joining. **Aggressive** applies every rewrite, simplifies vocabulary, regroups lists of three, drops rhetorical lead-ins and bold list labels, and tries more candidates. The lowest-scoring of 3 / 5 / 8 candidates is returned.
- `samples.ts` — the three "Try a sample" texts.

### How good is it?

`src/lib/engine/__tests__/corpus.ts` is a labelled benchmark: 14 AI texts in the styles current assistants produce, and 19 human texts (public-domain prose by Darwin, Thoreau, Twain, Hamilton, Austen, Lincoln and Melville, plus informal modern writing drafted as style controls). Eight of them are a held-out set written after the weights were frozen.

| | Before this rewrite | Now |
| --- | --- | --- |
| AI texts scored "human" (tuning set + fixtures, 21) | 8 | 0 |
| Human texts scored "AI" (15) | 1 | 0 |
| AUROC, tuning set | 0.86 | 0.99 |
| Held-out set (4 AI, 4 human) | not measured | no AI called human, no human called AI; AUROC 0.94 |

Mean score after humanizing the 25 AI texts: Light 55, Balanced 39, Aggressive 34 (from a mean of 80). Promotional copy and cliche-dense essays stay "mixed" with the rule engine; the Claude engine rewrites more deeply.

Limits worth knowing: this is a stylometric detector, not a language-model one. It has no perplexity signal, so carefully edited model text and unusual human prose both land in the middle band, and the benchmark is small. The numbers above describe this corpus, not accuracy in the wild.

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

Accounts and billing (Stripe), server-side history, OCR for scanned PDFs, a Chrome extension and public API keys. The plan limits, usage counter and rate limiter are wired so those can be added without changing the UI.

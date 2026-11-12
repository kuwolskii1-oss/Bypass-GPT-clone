# Handoff notes for the next session

Read this first. It records what is built, the decisions behind it, and what to do next.

## State

- Product: **Prosely**, an AI detector + humanizer SaaS clone in the spirit of Undetectable.ai, BypassGPT, Walter Writes AI, with a Turnitin-style writing report. See `README.md` for the full feature list and architecture.
- Branch: `claude/prosely-ui-humanizer-tuning-2jh671` (continues `claude/ai-detection-tool-clone-25ym3f`). Everything is committed and pushed. `npm test` (48 tests), `npm run lint`, `npm run typecheck` and `npm run build` all pass.
- Stack: Next.js 16 (App Router, Turbopack), React 19, TypeScript strict, Tailwind v4, Geist font (npm `geist`), Lucide icons, vitest. No database, no auth, no payments yet.
- Engine: `src/lib/engine/` is pure TypeScript. Detection is deterministic and local. The humanizer is rule-based, with an optional Claude engine in `src/lib/ai/` enabled by `ANTHROPIC_API_KEY` (see `.env.example`).
- Pricing: 1 / 4 / 12 week terms defined in `src/lib/site.ts` (`PLANS`, `BILLING_PERIODS`). Free tier is 1,500 words per rolling 4 weeks (`FREE_ALLOWANCE`), tracked in the browser in `src/lib/history.ts`.

## What this session did

1. **Competitor research with a real browser.** Screenshotted undetectable.ai, bypassgpt.ai, walterwrites.ai and Turnitin's AI-report guides at 1440 px, plus our own pages and states. The written findings are committed in `docs/research/` (one file per site, plus `prosely.md`, the baseline audit of our UI with its "Top 10 UX issues"). Screenshots were not committed.
2. **UI pass driven by that comparison** (commit "Refine workspace, report, pricing and dashboard"): editor-as-hero tool pages with the Humanize button above the fold at 1440×900, empty output pane hidden on phones, results scroll into view, a status label in the tool header (Ready → Rewriting… → Done), staged progress messages, an actionable rewrite footer ("48% AI · down from 100% · 64 words changed" + what to do next), legends on the Highlights and Compare tabs, a verdict sentence and "Humanize this text" step under detector results, one verdict vocabulary everywhere, plain-language metric labels with tooltips, report header with date and counts, pricing label fixes and a "per request" FAQ.
3. **Humanizer tuning on real ChatGPT-style outputs** (commit "Tune humanizer on ChatGPT-style outputs"): ten fixtures across genres (essay, blog with headers, cover letter, product copy, technical explainer, LinkedIn post, support email, school essay, how-to, narrative) live in `src/lib/engine/__tests__/fixtures.ts` with regression tests in `rewrites.test.ts`. Fixed rules: sentence-initial transitions now go through the opener rules (no "And, X"), embedded `which` clauses are left alone and split-off ones keep verb agreement ("coal and iron. They were…"), inverted "Not only does it…" is not flattened, statements are never joined onto instructions, split sentences are not re-joined, keyword placeholders survive joins, and formal registers skip chatty alternatives. Retired misleading replacements and added tells common in cover letters, LinkedIn posts and support emails. `humanizeText` now generates five candidates for texts up to 3,000 words and returns the lowest-scoring one (still deterministic per seed; "Re-humanize" changes the seed).

## Design rules

- Light-first, white canvas, one violet accent (`accent`), status colours only for human / mixed / AI. Hairline borders, `rounded-2xl` cards, `shadow-card`. Headings `font-medium` with tight tracking.
- Copy is honest: the detector panel shows **estimates from our own model**, never claims to be live GPTZero / Turnitin results, and never promises guaranteed bypass. Keep it that way. Turnitin's own phrasing worth keeping in mind is in `docs/research/turnitin.md` ("likely", "qualifying text", the `*` rule under 20%, "data to support human judgement").
- Design tokens live in `src/app/globals.css` (`@theme`). UI primitives in `src/components/ui/`.

## Browsing from this sandbox (Playwright)

External HTTPS must go through the agent proxy, and the egress rejects Chromium's TLS 1.3 post-quantum ClientHello, so launch Chromium like this (localhost needs none of it):

```js
import { chromium } from "playwright"; // npm i playwright@1.56.1 in a scratch dir, PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
  args: ["--no-sandbox", "--disable-features=PostQuantumKyber,UseMLKEM,EncryptedClientHello", "--ssl-version-max=tls1.2"],
  proxy: { server: process.env.HTTPS_PROXY },
});
```

walterwrites.ai returns a Cloudflare 403 to curl but loads fine in the browser. Do not `pkill -f "next start"` from a shell whose command line contains that string; kill by PID (`pgrep -f "next-serve[r]"`).

## Suggested next steps

1. **Icons.** If Flaticon "symbol" icons are wanted, download the specific SVGs, put them in `public/icons/`, and add the attribution line Flaticon requires to the footer. Otherwise keep Lucide.
2. **Remaining items from `docs/research/prosely.md`:** footer links to About / Blog / Terms / Privacy point at anchors that do not exist (add simple pages or drop them); the paid CTAs land on the demo dashboard until billing exists; the report could use next / previous sentence navigation.
3. **Humanizer depth.** The rule engine cannot lower formal, contraction-free prose much below the mid 40s because the detector rewards signals the rewriter deliberately does not fake (first person, casual markers). The next lever is a small paraphrase model or the Claude engine. Keep `npm test` green: `rewrites.test.ts` encodes the misfires that were fixed.
4. **Product depth** (in order): accounts (NextAuth or Clerk), Stripe checkout for the 1 / 4 / 12 week terms, server-side history and usage, public API keys. (DOCX/PDF/TXT upload and drag-and-drop shipped in `src/lib/documents.ts`; OCR for scanned PDFs is not done.)
5. **Always** run `npm test && npm run lint && npm run typecheck && npm run build` before pushing, commit small, and push after every completed step.

## Handy commands

```bash
npm run dev                      # http://localhost:3000
npm run build && npm start       # production
npm test                         # engine tests
```

Screenshot flow: build, `PORT=3100 npm start`, then a Playwright script that loads `/humanizer`, clicks "Try a sample" → "ChatGPT-style essay", then "Humanize", the Highlights / Compare tabs, "Full report", and `/ai-detector` → "Check for AI". The one used this session captured desktop (1440×900) and mobile (390×844) states.

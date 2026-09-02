# Walter Writes AI (walterwrites.ai) — competitive UI notes

Captured 2026-09-02 at 1440x900 with headless Chromium through the sandbox proxy.
Screenshots + visible-text dumps: `scratchpad/shots/walterwrites/` (`<name>.png` = viewport,
`<name>.full.png` = full page, `<name>.txt` = `document.body.innerText`).

**Reachability:** the LIVE site was reachable in the real browser (HTTP 200 for `/`, `/ai-humanizer/`,
`/ai-detector/`, `/pricing/`; no Cloudflare challenge — only plain `curl` was 403'd). Every observation
below is from the live page unless explicitly tagged **[DOM only]** (read from the page's HTML/JS state
rather than seen rendered). No archive or third-party sources were needed.

Two automation gotchas worth knowing for anyone re-running this:
- The WordPress marketing pages use LiteSpeed "delay JS": click handlers (pricing toggle, home widget)
  only bind after the first real pointer/scroll/key event. First clicks after page load are swallowed.
- The `/ai-humanizer` and `/ai-detector` tools are **iframes** from `embed.aitextdetector.ai`
  (`/humanize-v1?...&brand=walter`, `/detector-demo?...`), i.e. a white-labelled third-party widget;
  the home-page widget is a separate, custom theme component.

Shots index:
- Home: `01-home-empty.png/.full.png`, `01b-home-try-sample.png`, `probe-home.png`
- Humanizer (/ai-humanizer): `02a-humanizer-empty.png/.full.png`, `02b-humanizer-lite-tooltip.png`,
  `02b2-humanizer-lite-tooltip-click.png`, `02c-humanizer-sample-loaded.png`, `02d-humanizer-text-filled.png`,
  `02e-humanizer-loading.png`, `02f-humanizer-result.png/.full.png`, `02g-humanizer-highlight-off.png`,
  `02i-humanizer-copy-hover.png`, `02i2-humanizer-score-hover.png`, `02j-humanizer-standard-locked.png`,
  `02k-humanizer-second-run.png`
- Detector (/ai-detector): `03a-detector-empty.png/.full.png`, `03b-detector-lite-tooltip.png`,
  `03c-detector-sample-loaded.png`, `03d-detector-text-filled.png`, `03e-detector-processing.png`,
  `03f-detector-result.png/.full.png`, `03h-detector-advanced-locked.png`
- Pricing: `04a-pricing-default-yearly.png/.full.png`, `04b-pricing-monthly.png/.full.png`,
  `04c-pricing-yearly.png`, `04d-pricing-faq-default.png`, `04d-pricing-faq-expanded.full.png`,
  `04e-pricing-info-hover.png`

---

## 1. Navigation and page structure

**Global chrome (all pages)**
- Announcement bar (dark navy, 36px, centred): "New: Walter MCP connector for Claude is live." → `/humanize-ai-text-inside-claude/`.
- Header (white, 70px, sticky/translucent — hero text visibly bleeds through it when scrolled):
  logo "walter" (purple cartoon character + wordmark) · **Products ▾** · **Resources ▾** · **Pricing** ·
  **Company ▾** · **Help** · **Sign In** · outline button **"Start Free Trial"** (→ `app.walterwrites.ai/en/register`)
  · globe language dropdown (English ✓, Español, Deutsch, Français, Italiano, Nederlands, Português (pt-pt),
  Português (pt-br), 简体中文).
- Products mega-menu items (label + one-line descriptor): AI Humanizer "Make AI text sound human." ·
  AI Detector "Identify AI-written content with precision." · AI Resume Rewriter · AI Paraphraser ·
  Grammar Checker · Mobile App · API Overview · AI Humanizer API · AI Detector API · AI Image Detector API ·
  Grammar Checker API · Plagiarism Checker API · Get an API Key.
- Resources menu: Walter MCP, Walter Skills (GitHub), Chrome Extension, Zapier, API Documentation,
  Walter Writes Reviews, Blog. Company menu: About, Contact, Status, Affiliate Program, Trust Center.
- Footer: tagline "Walter Writes AI rewrites AI drafts in your real voice, so what you publish reads as
  authentically human." + 3 link columns (PRODUCTS / RESOURCES / COMPANY), "Get Walter everywhere" app
  badges (App Store, Google Play, Chrome Web Store), "Copyright © 2026 Walter Writes AI. All rights reserved",
  language, Privacy Policy, Terms Of Service.

**Home `/` (12,170px tall) — section order**
1. Hero, two columns: left H1 + sub + CTA; **right = the humanizer widget card** (x≈813–1377, ≈440px tall).
2. Logo strip: "Trusted by content teams, marketers, and writers to make AI content sound authentically human."
   (Reuters, Inc., The Guardian, Zapier, Shopify… marquee).
3. "Tools for Authentic AI-Assisted Writing" — 6 persona cards (Writers / SEO Teams / Business & Email /
   Educators & Teachers / Legal Professionals / Academics Writing & Authenticity) + orange CTA
   "Humanize 300 Words For Free".
4. "Turn ChatGPT, Claude, and Gemini Drafts into Writing That Sounds Like You" + "Try The AI Humanizer".
5. "Smarter Than a Paraphraser. Built for the AI Era." — 6 feature cards: Built-In Free AI Detector ·
   Adjustable Rewrite Strength ("Choose between Simple, Standard, or Enhanced rewrites") · Voice & Meaning
   Preservation · Natural Rhythm & Burstiness · Structure-Level Rewriting · 80+ Languages Supported; dark band
   CTA "Try our AI Humanizer tool".
6. "A New Standard for Authentic AI Content" / "Free AI Detector for Essays, Articles, and Professional
   Writing" + "Try our free AI Checker →" + "Try Walter's AI Detector Free".
7. "Original, Human-Like Writing You Can Publish With Confidence" + "Run a Free AI Detection Scan".
8. Testimonials "What writers and teams say about Walter" (4 quotes, roles only, no names/photos).
9. "Simple pricing for everyone" — same toggle + 4 cards as /pricing (feature bullets differ slightly, see §7).
10. FAQ (8 items, two columns).
11. "Latest Research & Insights…" — 3 blog cards (read time, title, excerpt, author "Lisa Braswick, AI Content Specialist").
12. Footer.

**/ai-humanizer (20,950px)**: H1 "Free AI humanizer tool. Humanize AI Text", sub "Humanize AI text from
ChatGPT, Claude & Gemini. Rewrite, detect, and bypass AI checkers like Turnitin & GPTZero — free." →
**tool iframe immediately below (1408×600, y≈327)** → 4 trust chips ("Undetectable AI Rewriter", "Built in AI
Checker and Detector", "Humanize ChatGPT, Claude & Gemini", "80+ Languages") → What Is an AI Humanizer…
(perplexity/burstiness bullets) → How to Use (3 steps: Paste Your Text / Humanize Content / Check AI Score)
→ "Bypass All AI Detectors" (logos Originality, ZeroGPT, Proofademic, Turnitin, GPTzero) → Who It's For
(6 personas) → How It Makes AI Text Human-Like → Advanced Controls for Tone, Flow, and Detection → Built-In
AI Detector → 80+ Languages → "Walter Writes AI vs. Other AI Humanizers" comparison table ("12% Turnitin AI
scores on humanized output (vs ~62% for QuillBot)") → Best AI Humanizer… → API section → FAQ → footer.
Repeated CTAs: "Humanize 300 Words Free", "Test Your Text in the Free AI Detector", "Start Free 300-word Trial".

**/ai-detector (17,800px)**: H1 "Free AI Detector & AI Checker for ChatGPT, Claude & Gemini Text", sub
"Detect AI-generated text from ChatGPT, Claude and Gemini instantly." → **tool iframe (1408×700, y≈303)** →
chips "Free & unlimited checks", "Detects ChatGPT, Claude, and Gemini outputs", "Accurate AI percentage score
for every scan" → "Trusted by Students, Educators, and Professionals…" (6 personas) → What Is an AI Detector
(Perplexity / Burstiness / Semantic Flow) → Detect AI Text from ChatGPT, Claude, and Gemini → Built for
Accuracy, Speed, and Trust → … → API → FAQ → footer. CTAs: "Check Content for AI", "See Your AI Score – Try It
Free Now", "Scan Your Content for AI Now", "Start Free — No Card Required".

**/pricing (3,847px)**: H1 → toggle → 4 cards → FAQ → footer. No comparison table, no enterprise/API row.

---

## 2. Tool layout

### 2a. Home-page widget (custom, light theme)
- **Single pane** card, ~564px wide, white with 1px border and soft shadow, radius ~16px, sitting beside the H1.
- Header row (40px, light grey): green dot + "Ready".
- Body: 320px tall input area. Empty state shows centred grey helper copy
  "Walter rewrites your AI text and instantly scores it with our advanced detector, built for accuracy and trust."
  and a single centred chip **"📋 Try A Sample"** (light lavender pill). No Paste/Upload affordance, no word counter, no settings.
- Footer: one full-width purple-gradient button **"Humanize & Detect AI"** with fingerprint icon and trailing arrow.
- "Try A Sample" loads a 3-sentence Seneca/Stoicism paragraph into the box (`01b-home-try-sample.png`).
- **[DOM only]** three step states exist: step-1 input; step-2 loading (status "Humanizing text & checking AI...",
  animated fingerprint GIF, "Just a moment—seasoning your words with human nuances...", "Rewriting this so well,
  you'll start questioning if it's AI or AI-amazing!", rotating lines "Analyzing your text…" / "Refining language
  patterns…" / "Adding human nuances…" / "Ensuring it's detection-proof…" / "Your humanized text is ready!" /
  "(It will appear in the text editor shortly.)", plus a footer row of 7 detector logos each paired with a spinner);
  step-3 result (status "Human", rewritten text in the same box, orange CTA "⚡ Start Free 300-word Trial",
  green-check line "Your text appears to be written by a human!", and the 7 logos — GPTZero, ZeroGPT, Sapling,
  Copyleaks, Turnitin, Proofademic, Originality — each with a green check). My automated run of this widget
  did not complete (deferred JS + covered click target), so steps 2–3 were not screenshotted.

### 2b. Humanizer tool (`/ai-humanizer`, iframe, dark theme)
- Dark near-black card 1408×600, radius ~24px, dropped straight under the hero H1; strong contrast to the light page.
- **Header (56px)**: left `● Ready` (green dot, bold); segmented mode control **LITE (i) | 🔒 STANDARD**
  (small caps, pill, active = purple fill). After a run the header also holds a green **"AI SCORE 11% · Reads as
  human"** pill next to the status and a **"Highlight changes"** toggle switch (green, on) at the right.
- **Body = two equal panes** split by a 1px divider (each ≈600px wide, 440px tall):
  - Left: textarea, placeholder *"Paste AI-generated text from ChatGPT, Claude, Gemini, or Grok and we'll
    humanize it."* Two chips overlaid in the vertical centre — **"📋 Paste"** and **"📄 Try a sample"** — which
    disappear the moment text exists. A small "×" clear button floats bottom-right of the pane once there's text.
    No upload affordance.
  - Right: output pane. Empty state = document icon + *"Humanized text will appear here"* centred in muted grey.
    A copy icon button floats top-right after output exists.
- **Footer (70px)**: left counters "766 characters   105 words" (hidden until text); right blue pill CTA
  **"⚡ Humanize →"** (becomes "Working…" with spinner while running, then **"Humanize again"**).
- "Try a sample" inserts a 78-word / 532-character sample.

### 2c. Detector tool (`/ai-detector`, iframe, dark theme)
- Dark card 1408×700. **Header**: `● Ready` left; mode control **LITE (i) | 🔒 ADVANCED** centred.
- **Body = wide input pane (≈890px) + right result rail (≈322px, slightly lighter panel)**:
  - Left textarea placeholder *"Paste text here to check if it was written by AI."*; centred chips
    **"📋 Paste"** / **"⧉ Try a sample"**; inline red note *"Please enter at least 30 words for accurate results."*
    under the box when <30 words; counters "0 characters / 0 words" hidden until text.
  - CTA purple pill **"🕒 Check for AI →"** bottom-right of the left pane (not full-width).
  - Right rail empty state: 120px ring (faint purple track) with "—" in the centre, label **"AI SCORE"**
    (purple, letter-spaced caps), hint *"Paste text & click Check for AI to see results"*, and model pills
    **ChatGPT · Claude · Gemini · Grok · Llama**.
- "Try a sample" inserts a 52-word / 410-character sample.

---

## 3. Controls (exact labels and options)

| Where | Control | Options / behaviour |
|---|---|---|
| Home widget | "Try A Sample" chip | loads sample text |
| Home widget | "Humanize & Detect AI" button | runs humanize + detect in one action |
| Humanizer | Mode tablist (aria-label "Mode") | **Lite** (default, has "i" info icon, aria "What is Walter Lite?") · **Standard** (lock icon; opens lock card, not a modal) |
| Humanizer | "Paste" chip | reads clipboard into textarea |
| Humanizer | "Try a sample" chip | inserts sample |
| Humanizer | "×" Clear (aria "Clear") | clears input |
| Humanizer | "Highlight changes" switch (title "Highlight what changed vs your input") | on by default after a run; off = plain output |
| Humanizer | "Copy output" icon button | copies output |
| Humanizer | "Humanize" / "Humanize again" | primary action |
| Humanizer | Version tabs **[DOM only]** | container "Version 1" exists but hidden (single version in Lite) |
| Detector | Mode tablist | **Lite** (default) · **Advanced** (lock; lock card) |
| Detector | "Paste", "Try a sample", Clear "×" | as above |
| Detector | "Check for AI" | primary action |
| Detector (result) | "Copy output", "Try again" icon buttons | top-right of text pane |
| Detector (result) | "Humanize this text →" link, "Check another text" button | cross-sell / reset |
| Pricing | Billing toggle | **Monthly** · **Yearly** (badge "Save up to 43%"); Yearly is default |
| Pricing | "Get Instant Access" | per-card CTA (→ register) |
| Pricing | "i" info icons | next to "words per request" and "MCP Server Access" |

Notable **absences** (vs. the controls the brief asked about): no tone/purpose/readability dropdowns, no
"Enhanced" model toggle, no language selector inside any free tool. The marketing copy promises
"Simple, Standard, or Enhanced rewrites" and tone controls, but those live only in the logged-in app
(the lock card lists them as untranslated keys `feat_enhanced`, `feat_tones`, `feat_models`, `feat_speed`).

---

## 4. Results presentation

### Humanizer (Lite) — `02e`, `02f`, `02g`, `02i2`
- **Processing**: header status turns amber `● Rewriting…`; right pane shows a purple→pink gradient fingerprint
  icon, a gradient-coloured stage message that rotates (**"Analyzing your text…"** → **"Removing AI-typical
  phrasing…"** → **"Trying multiple rewrites…"** → **"Polishing the final result…"**), sub-line *"Rewriting this so
  well, you'll start questioning if it's AI or AI-amazing."*, and a countdown pill **"••• ~22s remaining"**.
  Footer button becomes a disabled **"Working…"** with spinner. Real wall-clock: ~25–30s for 105 words.
- **Result**: status `● Done` (green). Original text stays on the left; rewritten text fills the right pane.
  With "Highlight changes" on, every changed word/phrase is coloured **green** (#4ade80-ish) on the dark
  background — word-level diff colouring, no strike-through of removed text, no sentence-level bands.
  Header pill **"AI SCORE 11% · Reads as human"** (grey label + green value) is the only score; there is no
  before/after pair, no per-detector rows, no bar/ring. Copy icon top-right; CTA reads **"Humanize again"**.
  Hovering the score pill shows nothing extra. No download, no tabs. A second run returned the identical output
  and score (no visible variation and no limit hit).

### Detector (Lite) — `03e`, `03f`
- **Processing**: left pane replaced by centred `● Checking for AI signals...`, animated gradient fingerprint,
  **"Analyzing your text..."**, *"Reading patterns the way a human reviewer would."*; right ring spins with a
  **"10s"** countdown in the centre, label **"ANALYZING"**, hint *"Running detection checks..."*.
- **Result** (our sample scored 67%): status `● Detected`. Left pane shows the *same* submitted text (explicit
  design choice, per code comment: "so they can see what was scored") — **no sentence highlighting**. Copy and
  Try-again icon buttons top-right. Beneath the text a full-width verdict banner tinted by band — amber
  `rgba(251,191,36,.12)` background, amber text, magnifier icon: **"This text shows a mix of AI and human
  signals."** Under it an underlined link **"Humanize this text →"** (→ /ai-humanizer) and centred secondary
  **"Check another text"**. Right rail: ring arc in **amber** filled to 67%, **"67%"** (32px, amber), label
  **"MIXED"** (amber, spaced caps), hint *"Some AI signal in the text"*. Band colours seen: amber for MIXED; green
  track/label used in idle state (human/AI bands not observed but are set per-score by `renderScore()`).
  No per-detector rows, no model attribution, no probability breakdown.

### Home widget **[DOM only]**
- Result = binary status "Human", line "Your text appears to be written by a human!" with green check, and a row
  of 7 detector logos each with a green check (GPTZero, ZeroGPT, Sapling, Copyleaks, Turnitin, Proofademic,
  Originality). This is the only place on the site that shows "per-detector" results, and they are all
  hard-coded green checks in the markup (not individual scores).

---

## 5. Copy (exact strings)

- **Home H1**: "Make AI text sound like **you wrote it.**" (second line purple gradient)
- **Home sub**: "Walter is the AI authenticity platform. Rewrite AI drafts into natural, human writing, and detect
  AI-generated text, images, and deepfakes. So you always know what's authentic, and what you publish is
  unmistakably yours. Built for content teams, marketers, and writers."
- **Home CTA**: "⚡ Start Free Trial" · microcopy "✓ No credit card required." · chips "AI Humanizer",
  "AI Detector & Checker", "Authenticity Score".
- **Home widget**: status "Ready"; helper "Walter rewrites your AI text and instantly scores it with our advanced
  detector, built for accuracy and trust."; "Try A Sample"; "Humanize & Detect AI"; result CTA "Start Free
  300-word Trial"; result line "Your text appears to be written by a human!".
- **Humanizer placeholders/microcopy**: "Paste AI-generated text from ChatGPT, Claude, Gemini, or Grok and we'll
  humanize it." · "Humanized text will appear here" · "Paste" · "Try a sample" · "Humanize" · "Working…" ·
  "Humanize again" · "Highlight changes" · "AI SCORE" · "Reads as human" · "N characters" / "N words" ·
  "~Ns remaining".
- **Humanizer Lite tooltip**: "You're using Walter Lite, a free demo with a lite humanizer and AI checker.
  To access our most powerful humanizer and AI detector, sign up for a free account." button "Sign up free →".
- **Humanizer Standard lock card**: "Walter Standard" — "The full Walter humanizer and AI detector. Undetectable
  to GPTZero, Turnitin, and every major checker. Included with a free account." — bullets render as raw keys
  `feat_enhanced / feat_tones / feat_models / feat_speed`; CTA renders raw key `cta_try_standard_free` (bug).
- **Humanizer daily-limit upsell [DOM only]**: "You've reached today's free demos" — "Sign up free to humanize
  unlimited text and stay invisible to every AI detector." — "Sign up free".
- **Detector placeholders/microcopy**: "Paste text here to check if it was written by AI." · "Please enter at
  least 30 words for accurate results." · "Check for AI" · "AI SCORE" · "Paste text & click Check for AI to see
  results" · "Checking for AI signals..." · "Analyzing your text..." · "Reading patterns the way a human reviewer
  would." · "ANALYZING" · "Running detection checks..." · "Detected" · "MIXED" · "Some AI signal in the text" ·
  "This text shows a mix of AI and human signals." · "Humanize this text →" · "Humanize this text now" (hidden
  variant) · "Check another text".
- **Detector Lite tooltip**: "You're using Walter Lite, a free demo with a lite AI detector. To access our most
  accurate, advanced AI detector, sign up for a free account." CTA renders raw key `cta_try_standard_free` (bug).
- **Detector Advanced lock card**: "Advanced AI Detector" — "Our most accurate AI detector, trained across 90+
  languages and tuned against every major checker. Included with a free account." — "Sign up free →".
- **Detector daily-limit upsell [DOM only]**: "You've reached today's free demos" — "Sign up free to check
  unlimited text with the most accurate AI detector." — "Sign up free".
- **Disclaimers**: none inside the tools (no "results may be inaccurate" line). Home FAQ: "Walter uses its own
  built-in detector to estimate AI likelihood. We are not affiliated with other detection services."
- **Pricing H1/sub**: "Simple pricing for everyone" / "No hidden fees, no surprise charges. Pick the plan that's
  right for you."

---

## 6. Gating (no account)

- Both free tools run **without login**; our 105-word text was humanized and scored in full, output fully
  visible and copyable — no blur, no truncation, no modal, no email capture.
- Gating is by **tier**, not by words: the demos run "Lite" models; **Standard** (humanizer) and **Advanced**
  (detector) tabs swap the whole body for an in-place lock card with a "Sign up free" CTA (free account,
  not paid). Nothing pops over the page.
- A **daily demo cap** exists (HTTP 429 → in-pane upsell "You've reached today's free demos") — not hit in
  three runs.
- Detector minimum: 30 words. No maximum surfaced in the demos; the account trial is **300 words**
  ("Humanize 300 Words For Free", "Start Free 300-word Trial", FAQ "You can start with a free 300-word trial").
- Every gate sends to `app.walterwrites.ai/en/register?utm_source=free-tools&utm_medium=ai-humanizer|ai-detector&utm_campaign=lite-tooltip|standard-gate|advanced-gate` — each gate is tracked separately.

---

## 7. Pricing

- Toggle: pill segmented control **Monthly | Yearly [Save up to 43%]**; **Yearly is the default**; active
  segment = navy fill/white text; badge is a tiny navy pill inside the Yearly segment. Only two states.
- Four cards in one row (no comparison table, no free-plan card, no enterprise/API card). Card = plan name,
  purple "N words/month", big price, CTA, check-list. **Pro** is the visually highlighted card (dark navy/purple
  background, white text, coral **"Get Instant Access"** button) — there is no "Most popular" badge text, the
  colour does all the work. Other CTAs are purple-gradient "Get Instant Access".

| Plan | Words/month | Yearly (default) | Monthly | Words/request | Extras |
|---|---|---|---|---|---|
| Starter | 30,000 | **$8** "Per month, Billed $96 Annually" | **$12** "Per month" | 750 words per request | — |
| Pro | 70,000 | **$13** "Billed $156 Annually" | **$23** | 1,500 words/request | highlighted card |
| Elite | 200,000 | **$26** "Billed $312 Annually" | **$47** | 2,000 words/request | — |
| Teams | 500,000 | **$99** "Billed $1188 Annually" | **$139** | 2,000 words/request | 10 team members · Top-Up Words Anytime |

- Actual annual savings: Starter 33%, Pro 43%, Elite 45%, Teams 29% — "up to 43%" is the Pro figure.
- Feature list, identical on every card (after the words/request line): Advanced Humanization Engine ·
  Generate Human-like Text · 100% Plagiarism-Free Content · Built-in AI Detector · MCP Server Access (i) ·
  Quality and Error-Free · 80+ Languages Supported · ChatGPT Watermark Removal. "i" icons sit after
  "words per request" and "MCP Server Access".
- Home-page copy of the same cards lists "Plagiarism-Free Content" and "Voice Matching" instead of
  "MCP Server Access" / "ChatGPT Watermark Removal" — the two pricing blocks are out of sync.
- No money-back guarantee, no refund line, no "cancel anytime" on /pricing (home FAQ says "You can change or
  cancel anytime"). API pricing only mentioned in the home FAQ: "six published pricing tiers from $49 per month
  (300K words) up to $1,699 per month (25M words)".
- **FAQ** (two columns, all 9 answers **expanded by default**, each with a "−" button): What is Walter? ·
  What does "words/request" mean? · How does Walter pricing work? · How much time is required to process my
  content? ("standard documents take between 10-30 seconds") · Is Walter free to use? · How does the humanizer
  work? · Who can benefit from using Walter? · Can I expect my content to rank favorably on search engines? ·
  Does Walter support multiple languages?

---

## 8. What they do more clearly than a typical clone

1. A persistent status dot + label in the tool header ("Ready" → "Rewriting…" → "Done"; "Ready" → "Checking for AI signals..." → "Detected") gives the user one fixed place to read tool state, coloured green/amber/green.
2. The empty textarea carries its two shortcuts as centred chips ("Paste", "Try a sample") that vanish the instant text exists — no toolbar row is wasted, and the first run is one click away.
3. The humanizer auto-scores its own output and shows it as a compact header pill ("AI SCORE 11% · Reads as human") — no separate "check for AI" step, no second panel; the plain-English qualifier is attached to the number.
4. "Highlight changes" is a single switch that colours changed words green in the output while the original stays on the left — a side-by-side diff without tabs, compare views or strike-throughs.
5. Long waits are framed with a countdown ("~22s remaining", "10s") plus rotating stage messages ("Removing AI-typical phrasing…", "Trying multiple rewrites…", "Polishing the final result…"), so a 25–30s job feels deliberate rather than stuck.
6. Paid tiers are surfaced as a segmented control inside the tool (LITE | 🔒 STANDARD / ADVANCED); clicking the locked tab swaps the tool body for a lock card and never throws a modal over the page — the upgrade path is always visible and never interrupts.
7. The detector verdict is layered three ways in one glance: ring + percentage coloured by band, a one-word label ("MIXED"), and a full-sentence banner ("This text shows a mix of AI and human signals.") with a short hint ("Some AI signal in the text").
8. The detector's result state ends with the next action, not a dead end: "Humanize this text →" cross-sells the other tool and "Check another text" resets — same pattern as the humanizer's "Humanize again".
9. Model coverage is declared up-front as pills in the detector's empty state (ChatGPT · Claude · Gemini · Grok · Llama), and the humanizer placeholder names the same models, so scope is clear before any input.
10. Input constraints are explicit and inline: live "766 characters · 105 words" counters in the footer and a red "Please enter at least 30 words for accurate results." note under the box.
11. Pricing puts the annual maths on the card ("$8 Per month, Billed $96 Annually") with the "Save up to 43%" badge inside the toggle itself; switching to Monthly simply drops the "Billed…" line, so the two states are directly comparable.
12. The pricing FAQ ships fully expanded with "−" controls and answers the one term that confuses buyers ("What does 'words/request' mean?") right next to the cards; the home widget backs its "Human" verdict with a row of seven named detector logos (GPTZero, ZeroGPT, Sapling, Copyleaks, Turnitin, Proofademic, Originality) each carrying a green check.

**Things not to copy**: raw i18n keys leaking into the lock card and tooltips (`feat_enhanced`, `cta_try_standard_free`); the Lite tooltip is clipped by the iframe's left edge; the translucent sticky header lets hero text bleed through; the home and /pricing feature lists disagree; the detector shows no sentence-level highlighting at all in the free tier.

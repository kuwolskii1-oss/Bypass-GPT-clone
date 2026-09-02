# Prosely — current UI state (baseline for competitor comparison)

Captured 2026-09-02 from branch `claude/prosely-ui-humanizer-tuning-2jh671`, production build (`next build` + `next start -p 3100`), Chromium via Playwright.
Desktop viewport 1440x900; mobile viewport 390x844. No `ANTHROPIC_API_KEY` was set, so every humanize result below comes from the **Local engine** (rule-based) and the output footer badge reads "Local engine".

Screenshots live in `shots/prosely/` (`*-viewport.png` = 1440x900 crop, `*-full.png` = full page). Full-page images taller than 1500px are also split into `shots/prosely/slices/*-partN.png` for easier viewing.

Screenshot index:

| State | Files |
|---|---|
| Landing | `01-landing-viewport.png`, `01-landing-full.png` (9979px tall; slices part1–7) |
| Humanizer empty | `02-humanizer-empty-*.png`, `02b-humanizer-sample-menu-open-viewport.png`, `02c-humanizer-sample-loaded-*.png`, `02d-humanizer-keep-keywords-open-viewport.png`, `02e-humanizer-too-short-hint-viewport.png` |
| Humanizer result | `03a-…-humanized-tab-*.png`, `03a-…-humanized-tab-card-viewport.png`, `03b-…-highlights-tab-*.png`, `03c-…-compare-tab-*.png`, `03d-…-breakdown-section-viewport.png`, `03e-humanizer-detector-hint-hover-viewport.png` |
| Humanizer full report | `04a-humanizer-full-report-*.png`, `04b-…-sentence-selected-viewport.png`, `04c-…-aside-scrolled-viewport.png` |
| Detector | `05a-detector-empty-*.png`, `05b-detector-result-highlights-*.png`, `05b-…-card-viewport.png`, `05c-…-breakdown-section-viewport.png`, `05d-detector-full-report-*.png`, `05e-…-aside-scrolled-viewport.png` |
| Pricing | `06a-pricing-default-4-weeks-*.png`, `06b-pricing-1-week-*.png`, `06c-pricing-12-weeks-*.png` |
| Dashboard | `07a-dashboard-empty-*.png`, `07b-dashboard-with-history-*.png` |
| Mobile humanizer | `08a-mobile-humanizer-empty-*.png`, `08b-…-empty-editor-viewport.png`, `08c-…-sample-loaded-viewport.png`, `08d-…-controls-viewport.png`, `08e-…-result-viewport.png` / `-full.png`, `08f-…-breakdown-viewport.png` |

Note on the mobile full-page capture `08e-mobile-humanizer-result-full.png`: the sticky navbar is painted mid-image (at the scroll position of capture). That is a screenshot artefact, not an app bug.

---

## 0. Global chrome (all pages)

**Navbar** (64px, sticky, white with blur, bottom border only once scrolled): logo "Prosely" (purple rounded square with a wave glyph) left; centred links **Humanizer · AI Detector · Pricing · How it works** (active link gets a light-grey pill); right: ghost **Log in** (links to `/dashboard`) and black pill **Get started free** (links to `/humanizer`). On mobile a hamburger opens a stacked menu with **Log in / Get started**.

**Footer** (light grey band): logo + one-line blurb "Check any text for AI writing and rewrite it so it reads like a person wrote it."; four columns PRODUCT (AI Humanizer, AI Detector, Writing report, Pricing, Dashboard), USE CASES (Students, Marketers, Editors and publishers, Agencies), COMPANY (About, Blog, Affiliates, Contact), LEGAL (Terms, Privacy, Acceptable use); bottom row "© 2026 Prosely. All rights reserved." and a disclaimer "Detector scores shown are estimates from our own model. Prosely is not affiliated with GPTZero, Turnitin, Originality.ai, Copyleaks or any other detector named."

**Dark CTA band** appears above the footer on every page: "Make your next draft read like you." / "Free detection, 1,500 humanizer words every 4 weeks, and no account needed to start." / buttons **Humanize my text** (purple) and **Check for AI** (white).

**Visual language**: white canvas, 1px `line` borders, 16px-radius cards, purple accent (#5b5bd6-ish), uppercase 11px tracked labels in `faint` grey (#9aa0ab), Geist-style sans. Verdict colours: red = AI, amber = mixed, green = human.

Global problems:
- Six footer links are dead: About, Blog, Affiliates, Terms, Privacy, Acceptable use all point at `/#about`, `/#blog`, … and no such anchors exist on the home page (only `#how-it-works`, `#use-cases`, `#pricing` exist). Clicking them just scrolls to the top of the landing page.
- "Log in" goes to a demo dashboard with no auth; "Get started free" is shown even on `/humanizer` where you already are.
- `faint` grey (#9aa0ab on white ≈ 2.6:1) is used for every section label (READABILITY, PURPOSE, DETECTOR ESTIMATES, SUBMISSION BREAKDOWN, FLAGS), for price footnotes and for the report disclaimer. That fails WCAG AA for small text and reads as washed-out on the screenshots.
- The dark CTA band is repeated on every page (landing, humanizer, detector, pricing, dashboard); on tool pages it pushes users back to the tool they are already on.
- Lede paragraphs are centred with a max width that produces one-word orphans almost everywhere: "…rewrite only what needs / it.", "…check and fix a / draft", "…would likely score / it", "…per term and per / request.", "…the plans actually / work.", "…it shows you / what to fix."

---

## 1. Landing page `/` (`01-landing-*`)

**Layout, top to bottom** (page is ~10,000px tall):

1. **Hero** (centred, max-width ~768px): eyebrow "AI DETECTOR + HUMANIZER", H1 "Write like a person. / Even when AI helped." (≈56px), lede "Paste any text. Prosely shows which sentences read as machine-written, estimates how 12 detectors would score it, and rewrites it so it sounds like you — meaning intact.", buttons **Humanize my text** (purple pill, wand icon) + **Check for AI** (white pill, scan icon), micro-copy "Free to try · No account needed · 500 words per check".
2. **Embedded workspace card** (full 1088px wrap width, starts at y≈590): identical to the /humanizer tool but with shorter panels (280px). Tool tabs **Humanizer / AI Detector**, split editor (left) + empty output (right), word counter "0 / 500 words", control bar (Settings · READABILITY select "University" · PURPOSE select "General writing" · STRENGTH segmented Light/Balanced/Aggressive · **Keep keywords** button), hint "1,500 free humanizer words left this 4-week period · Detection is always free", buttons **Check for AI** (secondary) and **Humanize** (accent, disabled). A soft purple radial glow + dot grid sits behind the card.
3. **Trust row** (grey band): "ESTIMATES CALIBRATED AGAINST" + 12 outlined chips (GPTZero, Turnitin, Originality.ai, Copyleaks, ZeroGPT, Winston AI, Sapling, Writer.com, QuillBot, Grammarly, Crossplag, Content at Scale); then four stats separated by vertical rules: **12** detectors estimated · **98%** meaning preserved in Balanced mode · **< 2s** average rewrite time · **50k+** documents checked.
4. **How it works**: eyebrow "HOW IT WORKS", H2 "Three steps, one page", lede; three cards numbered 01/02/03 — **Paste** ("Drop in an essay, a blog post or an email. File upload is on the way." footnote "Up to 500 words free · 10,000 on paid plans"), **Check** (footnote "Sentence highlights + detector estimates, in about a second"), **Humanize** (footnote "Readability · Purpose · Strength · Keep keywords").
5. **Features**: H2 "Everything you need to check and fix a draft"; 2x3 cards — Sentence-level highlights; Readability and purpose controls (with two rows of grey chips listing the 5 readability levels and 9 purposes); Keep-keywords list; Writing report you can download; Three strengths (Light / Balanced / Aggressive with one-line hints); Private by default.
6. **Writing report**: left column eyebrow "WRITING REPORT", H2 "A report your reader will recognise", lede, three check bullets, button **Try the detector**; right: a mock browser window "essay-draft.docx · 612 words" with HIGHLIGHTED TEXT (pink/amber highlighted sentences) and SUBMISSION BREAKDOWN "34% AI of qualifying text", stacked bar, legend "Likely AI 22% / Mixed 12% / Likely human 66%", "Flags 0".
7. **Detector estimates**: H2 "See how 12 detectors would likely score it"; 4x3 grid of cards (name, one-line description, coloured dot; Turnitin adds "Needs 300+ words"); footnote "Estimates come from our own model… the dots above are illustrative…".
8. **Use cases**: H2 "Built for people who publish"; four cards Students / Marketers / Editors and publishers / Agencies.
9. **Comparison**: H2 "Prosely vs typical humanizers"; table FEATURE | Prosely | Typical humanizers with six rows, all ✓ for Prosely and "—" for the competitor.
10. **Testimonials**: H2 "Quiet, useful, and out of the way"; 2x2 quote cards with initials avatars (Maya R., Daniel O., Priya S., Tom H.).
11. **Pricing** (same component as /pricing, see §6) with segmented **1 week / 4 weeks / 12 weeks** + badge "Save up to 37% vs weekly", four plan cards, footnote.
12. **FAQ**: H2 "Questions, answered"; seven collapsed accordion rows.
13. Dark CTA band + footer.

**Critique**
- The primary action of the embedded tool (the **Humanize** button) sits at page-y ≈1060, i.e. 160px below the fold on a 900px-high screen; a visitor sees an empty editor and an empty "Your humanized text will appear here" panel with no visible button.
- Two empty states compete inside the editor: a top-left placeholder "Paste or type your text here…" and three floating pill buttons (Paste text / Try a sample / Upload .txt) in the vertical middle. The output side shows a third empty state (icon + "Your humanized text will appear here" + "We keep your meaning and change how it reads. Then we score the result."). Half the hero card is empty-state copy.
- Trust row: 11 chips fit on one line and **Content at Scale** orphans onto a second centred line.
- Stats row: "98% meaning preserved in Balanced mode" wraps to two lines while the other three labels are single-line, so the four stats do not share a baseline.
- How-it-works cards: the footnote rule sits at a different height in card 1 (y≈535) vs cards 2 and 3 (y≈559) because body copy lengths differ; the footnotes are not bottom-aligned.
- Features grid: the middle card is stuffed with 14 chips while its neighbours have ~120px of empty space below two lines of copy.
- The mock report on the landing page uses labels "Likely AI / Mixed / Likely human" with **percentages**; the real report uses "AI-generated / Mixed or AI-paraphrased / Human-like" with **sentence counts**. The mock also shows a "Flags 0" row and a docx filename that the product cannot produce (there is no .docx upload).
- The "Paste" step card says "File upload is on the way" while the editor already has an **Upload .txt** button.
- Comparison table is a strawman (every competitor cell is "—") and is narrower (max-w-3xl) than every other section, so its edges align with nothing.
- Testimonial 4 is one line long so its card is mostly whitespace next to a three-line quote.
- The page is very long (13 sections) for a tool whose pitch is "nothing to learn".

---

## 2. Humanizer — empty state `/humanizer` (`02-*`)

**Layout**: dot-grid header area; eyebrow "AI HUMANIZER"; H1 "Make AI-assisted writing sound like you" (two lines, ~56px); lede "Paste a draft, choose how it should read, and get a rewrite that keeps your meaning. Every result is scored before you copy it."; the **workspace card** starts at y≈412 and spans the 1088px wrap.

**Workspace card anatomy** (top to bottom):
- Header row (px 12, py 8): in-card tabs **✨ Humanizer** (active: light-purple pill, purple text) and **⌕ AI Detector** (grey). Right side is empty until a result exists (then **Full report** appears).
- Two-column body, 50/50 split with a 1px divider:
  - **Left / Editor** (542px wide, min-height 380px): textarea placeholder "Paste or type your text here…" (15px/28px line-height). Centred floating actions **Paste text**, **Try a sample** (opens a 256px menu with three items: "ChatGPT-style essay — A polished, formulaic essay about remote work", "Human blog post — A casual first-person post with uneven rhythm", "Mixed draft — A human intro and outro around an AI-written middle"), **Upload .txt** (accepts .txt/.md). Footer row: an 80px progress bar + "0 / 500 words"; once text exists a **✕ Clear** button appears at right. Under 30 words the counter turns amber and adds "· add N more for a reliable score"; over 500 it turns red with "· over the free limit".
  - **Right / Output** (empty): purple icon tile, "Your humanized text will appear here", "We keep your meaning and change how it reads. Then we score the result."
- **Control bar** (border-top, px 20, py 12): grey "⚙ Settings" label; **READABILITY** native select (High school / University / Doctorate / Journalist / Marketing; default University, 168px wide); **PURPOSE** native select (General writing / Essay / Article / Marketing copy / Story / Cover letter / Report / Business / Legal; default General writing, 168px); **STRENGTH** segmented radio Light / Balanced / Aggressive (hover titles: "Minimal edits, keeps your structure" / "Natural rhythm with meaning intact" / "Deep rewrite for the toughest detectors"); **🔒 Keep keywords** toggle button which reveals a full-width-ish (max 672px) chip input labelled "KEEP THESE WORDS UNCHANGED" with placeholder "Names, brands, citations… press Enter" (Enter or comma commits, max 20).
- **Action row**: left hint (12px muted) "1,500 free humanizer words left this 4-week period · Detection is always free"; right **⌕ Check for AI** (secondary, disabled when empty) and **✨ Humanize** (accent, disabled when empty — rendered as a pale lavender pill).
- When a result or check exists, a grey **Breakdown + Detector estimates** band is appended below (see §3).

Below the card: section "TIPS FOR BETTER REWRITES" with three cards (Match the reader / Start with Balanced / Lock what must not change), then the dark CTA band and footer.

**Critique**
- Primary CTA below the fold: on 1440x900 the **Humanize** button's top edge is at page-y 961; the fold slices through the control-bar labels ("READABILITY / PURPOSE / STRENGTH" are half visible at y≈895). The 410px hero above the card is the cost.
- Duplicate navigation: the in-card tabs Humanizer / AI Detector duplicate the navbar links, but switching the in-card tab does not change the URL, the H1 or the tips section, so `/humanizer` can show detector mode under a humanizer headline.
- Three tab/segment styles in one card: mode tabs (purple-soft pill), output tabs (grey pill), strength (bordered box with white raised segment). The nav links use a fourth grey pill.
- Disabled accent button (pale lavender **Humanize**) is visually identical to the *enabled* "soft" **Upgrade** button on the dashboard, so the same treatment means "disabled" here and "clickable" there.
- Label baseline misalignment: STRENGTH label top is 2px higher than READABILITY/PURPOSE (1096 vs 1098). The "⚙ Settings" prefix is vertically centred on the row rather than aligned with either the labels or the controls, so it floats.
- The **Keep keywords** button has no label above it, so it breaks the labelled-control rhythm; the revealed chip input is 672px wide and stops short of the card edge for no visible reason.
- The "Try a sample" popover overflows the editor and overlaps the word counter and the control bar labels (`02b`), crossing two panel borders.
- **Paste text** depends on `navigator.clipboard.readText`, which most browsers gate behind a permission prompt; the fallback message "Press Ctrl+V / ⌘V to paste" appears for ~2 seconds and vanishes.
- Once a sample is loaded nothing indicates which sample it was, and the only path back to the samples is Clear → Try a sample.
- Hint copy "1,500 free humanizer words left this 4-week period · Detection is always free" is the only place the quota is stated; it is 12px muted text at the bottom-left of the card.
- Quota decrements even when the Local engine is used and is stored in localStorage; nothing explains "4-week period" or when it resets (that only appears on the dashboard).
- The empty output panel wastes ~380px of white space; competitors typically collapse the output until there is one, or show sample output.
- Readability/Purpose are native `<select>`s (fine functionally) but they render at 168px fixed width, which leaves "General writing" tight against the chevron.

---

## 3. Humanizer — result state (`03a`–`03e`)

Sample: "ChatGPT-style essay" (249 words). Result from the Local engine: **44% AI · Mixed signals · confidence high**, badge "was 100% AI", "−56 pts", "62 edits".

**Behaviour on click**: the button shows a spinner ("Rewriting…" skeleton in the output panel), then the page is left scrolled to wherever the click was; the top of the output panel (its tabs) ends up 70px above the viewport (scrollY 539 vs output tabs at page-y 469). There is no scroll-to-result.

**Output panel** (right column, same width as editor, content area max-height 520px with internal scroll):
- Header: tabs **Humanized / Highlights / Compare** (grey pill for active); right: **⧉ Copy** ("Copied" with a green check for 1.6s) and **⤓ Download** (saves `humanized.txt`).
- Body:
  - *Humanized*: plain rewritten text, 15px/28px.
  - *Highlights*: same text with every sentence tinted amber ("mixed") — for this sample all 13 sentences are amber, so the tab is a solid amber wall with no legend.
  - *Compare*: inline word diff — deletions in red strikethrough on pink, insertions in green on light green. Dense; roughly every third word is marked.
- Footer: badges **● 44% AI** (amber), **−56 pts**, **62 edits**, **Local engine** (outline); right: ghost **↻ Re-humanize**.
- The header gains **📄 Full report** (ghost button, top-right of the card).

**Breakdown band** (grey `surface/50`, below the control bar; grid ≈1.15fr / 1fr):
- Left, "Score breakdown": 116px ring gauge "44% / AI" in amber; heading "Mixed signals" (amber) + outline badge "confidence high" + grey badge "was 100% AI"; sentence "44% of qualifying text is likely AI-generated."; stacked bar (all amber); legend rows "● AI-generated — 0 sentences / ● Mixed or AI-paraphrased — 13 sentences / ● Human-like — 0 sentences"; a metrics strip **Words 242 · Avg sentence 19 words · Burstiness 0.28 · Vocabulary 86% · Reading grade 12.8**; "⚑ FLAGS · 0" + "No flags. A flag is not necessarily an indicator of a problem."
- Right, "DETECTOR ESTIMATES ⓘ" (hover tooltip: "Estimates from our own model tuned to how each detector is known to behave. They are not live results from those services. Re-check with the detector your reader uses."): two columns of six rows each — GPTZero 57% AI Unclear · Turnitin "Needs 300+ words" (grey) · Originality.ai 38% · Copyleaks 35% · ZeroGPT 52% · Winston AI 37% · Sapling 47% · Writer.com 33% · QuillBot 47% · Grammarly 37% · Crossplag 48% · Content at Sca… 39% — every verdict reads "Unclear" in amber.

**Critique**
- The headline result after "humanizing" is still **44% AI / Mixed signals** and *every* sentence is still flagged; the Highlights tab is one uniform amber block, which gives the user nothing to act on. A first-time user will read this as "it didn't work".
- No scroll or focus management after Humanize on desktop or mobile: the tabs and the first lines of the result are above the viewport; the user sees the middle of the text and the badge row.
- "Content at Scale" is truncated to "Content at Sca…" in the two-column detector list at a 1440px viewport (confirmed `scrollWidth > clientWidth`).
- Vocabulary mismatch for the same state: badge "44% AI" (amber) → heading "Mixed signals" → legend "Mixed or AI-paraphrased" → detector verdict "Unclear" → Highlights legend "Mixed". Four words for one concept.
- **Local engine** badge is internal jargon shown to end users; "62 edits" and "−56 pts" are unexplained; "was 100% AI" and "−56 pts" say the same thing twice.
- Metrics strip is unexplained: "Burstiness 0.28", "Vocabulary 86%", "Reading grade 12.8" have no tooltips or units.
- "FLAGS · 0 — No flags. A flag is not necessarily an indicator of a problem." is an empty section rendered with a disclaimer; it adds a row of noise to every result.
- Turnitin row shows "Needs 300+ words" in grey with no explanation that the free cap is 500 and the sample is 249.
- The Full report button lives in the card header, ~700px above the breakdown it expands; users reading the breakdown will not see it.
- Highlights tab in the output panel has **no legend** (the detector-mode panel does have "● AI ● Mixed"); the report view has yet another legend style (dots + counts) while the text uses background tints.
- Compare view marks ~1/3 of words; with no summary ("62 edits" is in the footer, not in the tab) it is hard to scan.
- The output panel and editor are each capped at 520px with independent inner scrollbars, so reading the original and the rewrite side by side requires scrolling two panes separately; the 249-word sample already overflows both.
- Re-humanize has no hint that it produces a *different* variant (seeded) rather than re-running the same thing.
- Score gauge ring, stacked bar and legend all encode the same three numbers (0/13/0 sentences) — three visualisations for one fact, and the bar is a solid amber line that carries no information.

---

## 4. Humanizer — Full report (`04a`–`04c`)

Clicking **Full report** swaps the whole workspace card for a report layout (same card position/size; URL unchanged).

**Layout**:
- Toolbar: ghost **← Back to editor**, muted text "Writing report · humanized text", right: secondary **⤓ Download report** (saves `writing-report.html`). For scores under 20% an extra ghost button "Show highlights anyway / Hide low-confidence highlights" appears.
- Two columns ≈1.7fr / 1fr, each capped at 70vh with its own scrollbar:
  - Left (white, p-32): the humanized text, max-width 672px, every sentence tinted (amber here); sentences are clickable (cursor pointer) and the selected one gets a purple ring.
  - Right aside (grey): "SUBMISSION BREAKDOWN"; big **44%** (48px, amber); "of qualifying text is likely AI-generated · Mixed signals"; outline badge "confidence high"; stacked bar; legend with sentence counts; a white card "Click any sentence to see why it scored the way it did." which, after clicking, becomes "Sentence 1 · ● 53% AI" with bullet signals ("No contractions", "Uniform length"); "⚑ FLAGS · 0" + disclaimer; "DETECTOR ESTIMATES ⓘ" single-column list of 12 rows; finally a 11px faint disclaimer paragraph "This score is an estimate. Our model may misidentify human-written and AI-generated text, so it should not be the sole basis for a decision about authorship. It is data to support human judgement, not a determination of misconduct."

**Critique**
- The report has no real title or metadata (no date, word count, settings used, or engine); "Writing report · humanized text" is muted 14px text next to the back button. It does not look like the "report your reader will recognise" promised on the landing page.
- Nested scrolling: the page scrolls, and inside the card two panes scroll independently (both `max-h-70vh`). On 1440x900 the aside is cut off after "Copyleaks" and the user has to discover that the grey column scrolls.
- Signals are terse fragments ("No contractions", "Uniform length") with no explanation or suggestion; there is no way to step to the next flagged sentence.
- The sentence-detail card is the only interactive element and it is identical in colour to the empty prompt card, so nothing invites the click.
- The 70vh cap means the report never shows the whole text without scrolling, yet Download produces a full-length HTML file — the on-screen and downloaded reports differ in shape.
- On the detector-mode report (`05d`) the subtitle wraps to "of qualifying text is likely AI-generated · Likely AI-/generated" — the verdict is redundant with the sentence and breaks mid-word-group.
- Flags · 0 and the long disclaimer appear in the aside regardless of relevance, pushing the detector list below the fold.
- No legend explains the tint colours in the left column; the reader has to infer from the dot legend in the aside.

---

## 5. AI Detector `/ai-detector` (`05a`–`05e`)

**Empty state** (`05a`): eyebrow "AI DETECTOR", H1 "See exactly which sentences give it away", lede "Free and unlimited. Paste at least 30 words for a score, 300 for the long-form estimates, and click any highlighted sentence to see why it was flagged." Same workspace card with the **AI Detector** tab active; the right panel reads "Your highlighted report will appear here — Sentences that read as machine-written are highlighted. Click one to see why." The control bar (readability/purpose/strength/keywords) is hidden in detect mode; the action row hint is "Detection is free and unlimited · Scores are estimates, not a verdict on authorship"; buttons **Check for AI** (accent) and **Humanize** (secondary). Buttons are again cut off by the fold (top edge at y≈895).

**Result** (`05b`, `05c`): the right panel becomes a "Highlights" pane with a header "Highlights" + tiny legend "● AI ● Mixed" (11px); every sentence of the sample is tinted pink. Breakdown band shows **100% / AI** red ring, heading "Likely AI-generated" + "confidence high", "100% of qualifying text is likely AI-generated.", solid red bar, legend 13 / 0 / 0 sentences, metrics "Words 249 · Avg sentence 19 words · Burstiness 0.23 · Vocabulary 87% · Reading grade 16.1", Flags · 0. Detector estimates: GPTZero 98% AI **AI**, Turnitin "Needs 300+ words", Originality.ai 99%, Copyleaks 98%, ZeroGPT 98%, Winston AI 94%, Sapling 98%, Writer.com 100%, QuillBot 96%, Grammarly 95%, Crossplag 94%, Content at Scale 100% — all red "AI".

Below the card is an explanatory section "READING THE REPORT — A score is a signal, not a verdict" with a legend card (AI-generated / Mixed or AI-paraphrased / Human-like / Flags).

**Full report** (`05d`, `05e`): identical layout to §4 with subtitle "Writing report · your text"; big red **100%**; "of qualifying text is likely AI-generated · Likely AI-generated"; all 12 detectors red.

**Critique**
- The lede promises "click any highlighted sentence to see why it was flagged", but in the editor view sentences are **not clickable** (only a native `title` tooltip on hover); clicking only works inside Full report. The empty-state copy repeats the promise ("Click one to see why").
- "Highlights" pane has no score in it; the score is 500px lower in the breakdown band, so the eye lands on a wall of pink with no number.
- The legend "● AI ● Mixed" is 11px faint text in the pane header; the tints in the text are pastel backgrounds, not dots, so the legend does not visually match what it explains.
- The **Humanize** button remains available in detector mode with all its settings hidden, so pressing it applies invisible defaults (University / General writing / Balanced).
- Detector rows repeat "98% AI  AI" — the percentage suffix and the verdict label say the same thing side by side.
- "Needs 300+ words" for Turnitin while the free cap is 500 makes the row unreachable for most free users; nothing says so.
- The page-level section under the tool ("A score is a signal…") duplicates the tooltip and the report disclaimer — three copies of the same caveat on one page.
- Same fold, scroll and truncation issues as the humanizer.

---

## 6. Pricing `/pricing` (`06a`–`06c`)

**Layout**: eyebrow "PRICING", H1 "Simple plans, honest limits", lede "Detection is free for everyone, with no account. Paid plans come in 1, 4 or 12 week terms and raise how many words the humanizer will rewrite per term and per request." Then a centred **segmented control "1 week / 4 weeks / 12 weeks"** (default 4 weeks) with a badge to its right ("Save up to 37% vs weekly" at 4 weeks; "Save up to 48% vs weekly" at 12 weeks; neutral "Pay week by week" at 1 week). Four equal-width plan cards; Pro is outlined in purple with a "Most popular" badge overlapping the top border and a purple **Get Pro** button. Footnote "Words are counted on the humanizer only and reset at the start of each term. Detection is always free." Then H2 "Compare plans" + a table (PLAN | 1 WEEK | 4 WEEKS | 12 WEEKS | PER REQUEST | HISTORY | API | SEATS) with monospace prices and "N words" sub-lines; then the FAQ accordion, dark CTA band, footer.

Card contents (4-week term): Free "$0 — Free forever, no card needed — Words / 4 weeks 1,500 · Per request 500 — Unlimited AI detection, Estimates across 12 detectors, Sentence-level highlights, 500 words per request, History in your browser — **Start for free**"; Starter "$9.99 / 4 weeks — $2.50 per week · Billed every 4 weeks — 20,000 / 2,000 — All readability and purpose modes, Aggressive rewrite strength, Keep-keywords list, History for 30 days, Email support — **Get Starter**"; Pro "$19.99 / 4 weeks — $5.00 per week · Billed every 4 weeks — 60,000 / 5,000 — Everything in Starter, Downloadable writing reports, Batch humanizing, Unlimited history, Priority support — **Get Pro**"; Business "$49 / 4 weeks — $12.25 per week · Billed every 4 weeks — 200,000 / 10,000 — Everything in Pro, API access, 5 team seats, Usage analytics, Dedicated support — **Talk to us**".

1-week term: Starter $3.99, Pro $7.99, Business $19 with "Billed weekly, cancel any time"; 12-week: $24.99 / $49.99 / $129 with "$2.08 per week · Billed every 12 weeks" etc.

**Critique**
- At **12 weeks** the small stat box label "Words / 12 weeks" wraps onto two lines, so the "60,000" value drops 17px lower than the neighbouring "2,000", the stat boxes grow, and the three paid cards become taller than Free, leaving Free's button 17px higher than the others. At 4 weeks the same box in the Free card is a different height because Free has no per-week line.
- The Free card always says "Words / 4 weeks" and "$0" with no term suffix, regardless of the toggle, so under "12 weeks" it reads as a different unit from its neighbours.
- "$2.50 per week · Billed every 4 weeks" wraps with an orphan "weeks" in three of four cards at 1440px.
- The Compare table is `max-w-5xl` (narrower than the card row above), so its left/right edges align with nothing; prices in the table are monospace while the cards use the display face; "Per request" and "Seats" are monospace but "History"/"API" are proportional.
- **Get Starter** and **Get Pro** link to `/dashboard` (a demo page) — there is no checkout, no sign-up, no explanation. **Talk to us** is a mailto.
- Weekly pricing is unusual; the toggle's "Save up to 37%/48% vs weekly" badge compares to a term nobody defaults to.
- The Free card's third feature bullet "Estimates across 12 detectors" wraps to two lines, breaking bullet rhythm; Pro's "Downloadable writing reports" likewise.
- The lede has an orphan ("request."); the FAQ lede too ("work.").
- The FAQ is entirely collapsed with no default-open item; the answers (which contain the key caveat that estimates are not live results) are hidden.

---

## 7. Dashboard `/dashboard` (`07a`, `07b`)

**Layout**: eyebrow "DASHBOARD", H1 "Your workspace", sub-line "Demo account. History and usage stay in this browser until you sign in."; right-aligned buttons **⌕ Check text** (secondary) and **✨ Humanize** (accent). Three stat cards: (1) usage ring (96px) "0%" + "Free plan [Current]" + "0 of 1,500 words used" + "1,500 left in this 4-week period" + soft **Upgrade ↗** button; (2) "DOCUMENTS PROCESSED — 0"; (3) "AVERAGE AI SCORE DROP — — — across humanized documents". Then "HISTORY" label; empty card with icon, "Nothing here yet", "Every check and rewrite you run shows up here so you can reopen it later.", black button **Humanize your first draft**. With history (`07b`): ring "17%", "249 of 1,500 words used", "1,251 left in this 4-week period · resets Sep 30"; "2" documents; "−56 pts"; a **Clear all** text link; two rows each with a kind icon, the excerpt "In today's fast-paced world, remote work has emerged as a transformative force that is reshaping…", meta "Sep 2, 1:39 AM · 249 words" (+ " · university · balanced" on the humanize row), badges "● 100% AI" (and "→ ● 44% AI" for the humanize row), ghost **Open**, trash icon.

**Critique**
- The usage ring shows a small purple dot at 12 o'clock even at **0%** (round line-caps on a zero-length dash) — looks like a rendering glitch.
- "AVERAGE AI SCORE DROP" renders a 30px bold em-dash "—" when empty, which reads as a broken value rather than "n/a".
- Stat cards 2 and 3 are 145px tall with a single number at the top and ~70px of empty space; card 1 is packed. Uneven density.
- History rows do not say what they are: the only difference between "checked" and "humanized" is a tiny icon; option values are raw ids in lowercase ("university · balanced") instead of the labels used in the UI.
- Two entries created seconds apart from the same sample have identical excerpts; there is no title, no verdict word, no settings summary for detections.
- "Log in" in the navbar leads here, yet the page says "until you sign in" and offers no sign-in.
- "Demo account" copy on what is presented as a product page; everything is localStorage.
- The page is short (1100px) but still ends with the full dark CTA band + footer, which are taller than the dashboard content.
- **Open** re-populates the editor but discards the result; the user has to run the check again.

---

## 8. Mobile humanizer (390px) (`08a`–`08f`)

**Empty state**: hamburger nav; H1 wraps to two lines at ~38px; lede three lines; card starts at y≈378. Inside: tool tabs fit on one line; editor 320px tall with the three empty-state buttons wrapping 2+1 ("Paste text / Try a sample" then "Upload .txt" centred); "0 / 500 words"; then the **empty output panel** (another 320px: icon, "Your humanized text will appear here", helper); then the control bar stacked: READABILITY select (168px wide), PURPOSE select (168px), STRENGTH segmented (wider than the selects), **Keep keywords** button alone on a line, hint text wrapping as "1,500 free humanizer words left this 4-week period ·" / "Detection is always free", then **Check for AI** + **Humanize** side by side. The Humanize button top is at page-y **1409** on an 844px screen — almost two screens down, with 320px of empty output panel in between.

**Result**: after tapping Humanize the result panel renders *above* the button (output tabs at page-y 812 vs button at 1769), so the user, who is scrolled to the button, sees the tail end of the rewritten text and the badge row "● 44% AI · −56 pts · 62 edits · Local engine" with **Re-humanize** wrapping onto its own line. The tool-tab row now wraps: "AI Detector" breaks into two lines ("AI / Detector", 51px tall) because **Full report** joined the row.

**Breakdown on mobile** (`08f`): gauge and text sit side by side in a 348px column, so "Mixed signals" + two badges stack vertically; legend rows wrap badly — "AI-" / "generated" on two lines against "0" / "sentences" on two lines (rows are 40px tall instead of 20); metrics strip becomes a 2-column grid with "Reading grade" orphaned in a third row; detector list is single column and fully legible.

**Critique**
- The empty output panel is dead space between input and CTA; on mobile it costs a full screen of scrolling before the user can act.
- No auto-scroll to the result; the result appears off-screen above.
- Tool tabs wrap when "Full report" appears — the header row was not designed for three items at 390px.
- Legend rows and the gauge row wrap into unreadable fragments; the breakdown grid needs a stacked layout under ~480px.
- Selects are fixed at 168px on a 348px column and the segmented control is a different width, so right edges are ragged; the keyword input, by contrast, is full width.
- Hint text orphans the "·" separator at the end of a line.
- Landing-style hero (eyebrow + 2-line H1 + 3-line lede + dot grid) consumes 378px before the tool.

---

## Cross-cutting inconsistencies

- Four different tab/segment visual styles (navbar pill, mode tab pill, output tab pill, strength segmented).
- Same pale-lavender button style means "disabled" (Humanize) in one place and "soft/enabled" (Upgrade) in another.
- Verdict vocabulary: Mixed / Mixed signals / Mixed or AI-paraphrased / Unclear; AI / AI-generated / Likely AI-generated / Likely AI (landing mock); Human / Human-like / Likely human.
- Legends: dots + counts (breakdown), dots + percentages (landing mock), tiny dots in pane header (detector pane), none (humanizer Highlights tab, report text column).
- "Report" means three things: the highlighted pane ("Your highlighted report"), the Full report view, and the downloadable HTML "writing report".
- The disclaimer "estimates, not live results" appears as a tooltip, a landing footnote, a page section, a report paragraph, a FAQ answer and the footer.
- Quota copy: "500 words per check" (landing hero) vs "500 words per request" (pricing) vs "0 / 500 words" (editor) vs "1,500 free humanizer words … 4-week period" (hint).
- Casing of option ids leaks into the dashboard ("university · balanced") while the UI shows "University" / "Balanced".

---

## Top 10 UX issues

1. **Primary action is below the fold everywhere.** On `/humanizer` (1440x900) the Humanize button's top edge is at page-y 961; on the landing page it is at ~1060; on mobile it is at 1409 on an 844px screen. The 380–410px hero plus a 380px-tall empty output panel push the only button the user needs off-screen.
2. **The empty output panel is dead space.** A full-height "Your humanized text will appear here" panel sits between the input and the CTA on desktop and mobile; on mobile it is an entire screen of nothing to scroll past.
3. **No scroll/focus management after Humanize or Check.** The result's tab header ends up 70px above the viewport on desktop and ~950px above the button on mobile, so the user sees the middle of the output rather than its start.
4. **The humanized result is not actionable.** For the built-in ChatGPT sample the rewrite still scores 44% AI / "Mixed signals" with all 13 sentences flagged amber; the Highlights tab is a uniform amber block with no legend, and Compare marks a third of all words. Nothing tells the user what to do next.
5. **Inconsistent verdict vocabulary and legends.** One state is called "44% AI", "Mixed signals", "Mixed or AI-paraphrased", "Mixed" and "Unclear" on the same screen; the landing mock uses "Likely AI / Likely human" with percentages while the product uses "AI-generated / Human-like" with sentence counts; the humanizer Highlights tab and the report text have no legend at all.
6. **Mobile layout breaks at 390px.** The tool-tab row wraps ("AI / Detector") once Full report appears; breakdown legend rows wrap into "AI-/generated" vs "0/sentences" (40px rows); the gauge + heading squeeze into a narrow column; selects are fixed at 168px next to a wider segmented control and a full-width keyword input.
7. **Unexplained jargon and internal labels in the results.** "Local engine", "62 edits", "−56 pts", "Burstiness 0.28", "Vocabulary 86%", "Reading grade 12.8", "confidence high", "Needs 300+ words" and "FLAGS · 0 — No flags…" appear with no tooltips, units or reason to exist when empty.
8. **Detector-list truncation and cramped columns at desktop width.** "Content at Scale" is clipped to "Content at Sca…" in the two-column estimate list at 1440px; every row repeats the verdict twice ("98% AI  AI"); Turnitin is greyed out with no explanation that the free 500-word cap makes it unreachable.
9. **Full report is not a report.** It has no title, date, settings or summary; two nested 70vh scroll panes cut the aside off after four detectors; sentence signals are two-word fragments ("No contractions") with no next/previous navigation; the detector-mode subtitle wraps mid-phrase ("Likely AI-/generated"); the promise "click any highlighted sentence" only works here, not in the editor view where the copy makes it.
10. **Pricing/plan and dashboard states look broken or dead-ended.** At 12 weeks the "Words / 12 weeks" label wraps and misaligns the stat boxes and card heights; the Free card ignores the term toggle; Get Starter/Get Pro lead to a localStorage "Demo account" dashboard with no checkout or sign-in; the dashboard shows a bold "—" for an empty stat and a stray dot on the 0% usage ring; six footer links (About, Blog, Affiliates, Terms, Privacy, Acceptable use) point at anchors that do not exist.

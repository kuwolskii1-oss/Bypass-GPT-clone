# BypassGPT (https://www.bypassgpt.ai) — competitive UI notes

Captured 2026-09-02 at 1440x900 (viewport + full-page PNG + visible-text dump per state) under
`scratchpad/shots/bypassgpt/`. Site is dark-themed (pure black page, near-black cards), body font Inter,
primary blue `#2361F9` (rgb 35,97,249), text `#DEE8F9`, muted text `#94A2AE`, accent peach/orange
(~`#FFAA6D` / `#FFAF4E`), success green `rgba(0,255,0,.85)`, danger red `#FF4D4F`. Component library is an
Ant Design fork (class prefix `coco-`; `rc-virtual-list` dropdowns, `coco-modal`).

Screenshots referenced:
- `01-home-empty.png` / `.full.png`, `01b-home-mode-dropdown-open.png`, `01c-home-tips-for-use.png`,
  `01d-home-sidebar-expanded.png`, `01e-home-sample-loaded.png`, `01f-home-faq.png`, `01g-home-faq-open.png`
- `03a-home-text-entered.png`, `03b-home-check-loading.png`, `03c-home-detector-result.png` / `.full.png`,
  `03d-home-humanize-loading.png`, `03e-home-humanize-result.png` / `.full.png` (= sign-up modal)
- `02-detector-empty.png` / `.full.png`, `02b-detector-text-entered.png`, `02c-detector-loading.png`,
  `02d-detector-result.png` / `.full.png`, `02e-detector-how-it-works.png`
- `04-pricing-default-yearly.png` / `.full.png`, `04b-pricing-monthly.png` / `.full.png`,
  `04c-pricing-currency-dropdown.png`, `04d-pricing-cards-bottom.png`
- `recon-home.*`, `recon-detector.*`, `recon-pricing.*` (first-pass duplicates of the empty states)

Not reachable without an account: the humanized output panel (Humanize opens a sign-up modal immediately —
captured). No accounts were created, nothing purchased.

---

## 1. Navigation and page structure

**Global chrome (home + detector; pricing differs, see below)**
- Top promo banner, full-width, 64px tall, illustrated blue "back to school" artwork: serif text
  "Invest in your GPA this semester. Save up to **64%**!" (64% in orange) + orange pill button "Get Discount"
  + white X at far right. Dismissable.
- **No horizontal top nav.** All navigation lives in a fixed left icon rail, 68px wide. Hamburger at top
  expands it to a 224px labelled sidebar (`01d-home-sidebar-expanded.png`) headed by the serif wordmark
  "BypassGPT". Items, in order, each with a line icon:
  1. Bypass AI (/bypass-ai)  2. AI Humanizer (/ai-humanizer)  3. AI Detector (/ai-detector)
  4. Undetectable AI (/undetectable-ai)  5. AI Detection Remover (/ai-detection-remover)
  6. Plagiarism Remover (/plagiarism-remover)  7. AI Stealth Writer (/ai-stealth-writer)
  8. Paraphrasing Tool (/paraphrasing-tool)  9. Sentence Rewriter (/sentence-rewriter)
  — divider — "Upgrade Now" (orange-gradient button with a wallet icon, → /pricing)
  — bottom of rail — "Login" (solid blue button with a door icon, → /sign-in).
- Active page icon is orange inside a dark rounded square (e.g. AI Detector on /ai-detector). The rail
  stays fixed while scrolling; the "B" logo tile at the top links to `/`.
- reCAPTCHA v3 badge appears bottom-right once you interact with the editor.

**Home (/) — hero + embedded humanizer** (`01-home-empty.png`, page height 8979px)
- Headline (H1-styled, ~48px Inter bold, white, single line, centered):
  "Convert AI Text to **{rotating word}** Content" — the word is peach-gradient text with a blinking caret and
  types out "Human-like", "Plagiarism-free", "Undetectable", "Authentic" in a loop. **No subheadline.**
- Directly under the headline, right-aligned above the tool: pill "🪙 Earn free words worth **$6** →"
  (referral; "$6" orange).
- The tool card starts at y≈206, i.e. the whole editor (486px tall) is inside the first viewport.
- Beneath the tool: a small "Tips for use" tab hanging off the card's bottom-left corner; then three trust pills
  with orange icons: "Trained with 200M+ Data" · "Top Choice for 10M+ Users" · "99%+ Human Score"; then
  "Recognized for Excellence:" (serif) + grey press logos techradar, Business Insider, PCWorld, Tech Times,
  The Economic Times, Pocketlint.
- Section order down the page:
  1. Hero + tool
  2. Trust pills + press logos
  3. H2 "Humanize AI Text and Bypass AI Detector Tools With Undetectable AI Humanizer" — 6 feature cards in a
     3x2 grid (100% Undetectable / Plagiarism-Free Rewrites / Completely Error-Free / High-Ranking Content /
     Authentic and Creative / Bypass Spam Filters), each an orange line icon in a dark rounded square, bold
     title, 2–3 line body. CTA pill "Bypass AI Detection for Free".
  4. H2 "See How Our AI Bypasser Can Help Bypass AI Detection!" — sub-copy, a tab strip of detector logos
     (GPTZero, ZeroGPT, Originality.ai, Turnitin, Winston AI, Copyleaks, Writer, Content at Scale, Sapling)
     over a screenshot carousel with round left/right arrow buttons. CTA "Make AI Text 100% Undetectable".
  5. "Advanced AI Humanization Model" — image left / text right.
  6. H2 "Bypass AI Detectors With 100% Human Score Content" — 3 steps with oversized numerals 1/2/3
     ("Copy your original, AI-generated content into our portal." / "Click the button to start the BypassGPT
     process." / "Moments later, receive your rewritten text and use it however you like!"). CTA
     "Bypass All AI Detectors".
  7. H2 "Powerful AI Humanizer that Assists…" — persona tabs Students / Bloggers / Webmasters / Content
     Marketing Agency; each a card with a headline + 3 check bullets.
  8. Language marquee (flags + names, 30+ languages).
  9. H2 "Trusted AI Humanizer for Effectiveness" — carousel of 4 portrait video testimonials.
  10. H2 "Explore Resources About Bypassing AI Detection" — two tinted link boxes (brown / indigo) of 6 links
      each + orange link "Find More Resources About Bypassing AI Detection".
  11. H2 "FAQs" — 9 accordion rows (see Copy); first item open by default, its question in orange with a "–",
      the rest "+".
  12. Closing CTA band "Bypass AI Detection With BypassGPT Effortlessly" / "Ready to start? Turn AI-generated
      content into human-like text with the click of a button. Try our AI humanizer for free today." /
      "Start for Free".
  13. Footer: "B" logo tile, "© 2026 BypassGPT. All rights reserved.", social icons (Facebook, X, YouTube,
      Instagram, TikTok), "🌐 English ▾" language select; columns **Tools** (AI Detection Remover, Essay
      Generator, Essay Rewriter, Paraphrasing Tool, Article Rewriter, Paragraph Rewriter, Sentence Rewriter,
      AI Stealth Writer), **Company** (About Us, Privacy Policy, Terms of Service, Contact Us, Refund Policy,
      Pricing, Media Kit, Resources), **Partners** (Business Solutions, API).

**AI Detector (/ai-detector)** (`02-detector-empty.png`, page height 9335px)
- H1 "Trusted Free AI Detector & AI Checker by BypassGPT" (peach gradient, ~48px, centered) + subheadline
  "Use BypassGPT's AI checker to check your content against multiple well-known AI detectors. Get instant
  AI check results for your text with high accuracy."
- Then one full-width tool card (starts y≈286, still inside first viewport).
- Sections: "Comprehensive & Reliable AI Detector" (4 alternating image/text feature blocks, each with a
  "Start for Free" pill) → "Top AI Checker for Anyone" (Students / Educators / Editors and Publishers) →
  "How Our AI Content Detector Works" (3 numbered steps + product mock, `02e-detector-how-it-works.png`) →
  "Key Features of Our AI Text Detector" (4-row emoji table) → "Discover BypassGPT's Other Cutting-Edge Tools"
  → "Read More Articles About How to Bypass AI" → "Hear Voices from Our Users" (4 quote cards) → "FAQs"
  (11 items) → closing CTA "Try Our AI Detector With Complete Accuracy!" → footer.

**Pricing (/pricing)** (`04-pricing-default-yearly.png`, page height only 1591px)
- No promo top-banner; the rail is present. H1 "Bypass AI Detection Easily at Affordable Prices" in a serif
  (Suwannaphum, 24px/700), centered.
- In-page sale banner (full card width, illustrated): "Back to School Sale: Up to **64%** OFF!" + live countdown
  in four boxed numerals "06 Days : 05 Hours : 19 Mins : 31 Secs".
- Single centered control row: "USD ▾" currency select + "Monthly | Yearly" segmented pill.
- Four plan cards side by side → "Secure Payment:" logo row (Mastercard, Visa, American Express, Apple Pay,
  UnionPay, one more) → footer. **No FAQ, no comparison table** on this page.

---

## 2. Tool layout

### Humanizer (embedded on home)
- Card: x 84→1424 (**1340px wide**), y 206→692 (**486px tall**), ~12px radius, 1px `#303030` border, bg ≈`#0F0F0F`
  on a black page. Split into two panes by a 1px vertical divider at x≈753:
  - **Left / input pane**: editable `div[contenteditable]` 631×404 at (104,224). 16px / 24px line-height text.
  - **Right / output pane**: ≈670px wide, empty by default apart from a ~60px blue inbox/tray illustration
    centered — no caption, no placeholder copy.
- **Empty state (left pane)**: placeholder "Enter the text you want to humanize here" top-left in muted grey;
  three equal tiles centered vertically (158×82, dark grey `#1c1c1c`, 8px radius, icon above 12px label):
  "Upload File" (upload-arrow icon) · "Try A Sample" (document icon) · "Paste Text" (copy icon).
- **Bottom bar of the input pane (empty)**: left = "Check for AI" (outlined, 114×32, greyed/disabled);
  right = "Humanizer 2.0" label with an orange "NEW" badge above it, then the mode select "Enhanced ▾" (108×32),
  then "Humanize" (108×32, greyed/disabled).
- **With text** (`03a-home-text-entered.png`): tiles + placeholder vanish. Bottom bar becomes:
  "Check for AI" (blue text + blue outline, enabled) · "106 Words" in grey with a trash-can icon to clear ·
  blue toggle (on) with 12px label "Citation Protection" — all on one row; the "Humanizer 2.0 NEW / Enhanced ▾ /
  Humanize" group stays on a second row right-aligned, Humanize now solid blue with white text.
- "Try A Sample" inserts a 110-word education paragraph ("Education is a fundamental pillar in our society…")
  and the counter reads "110 Words".
- No character/word limit is shown in the editor; no remaining-quota indicator; no keyboard hints.
- **"Tips for use"**: small grey tab under the card's bottom-left corner. Opens a dark popover (~605px wide,
  `01c-home-tips-for-use.png`): 💡 "Tips for use" / "BypassGPT can create undetectable content 98% of the time.
  Here are some helpful tips if the output still gets flagged." / three numbered cards
  **01** 'Click on "Retry" to re-bypass the text.' · **02** 'Alternatively, try out our different bypass modes.'
  · **03** 'Or, generate your initial draft using other AI models including GPT-4.' / footer
  'If these steps don't solve your issue, click on "Dislike" to inform us.' In our run this popover opened by
  itself after the Check-for-AI result (`03c-home-detector-result.png`).

### AI Detector page
- One full-width card 1340×486 (x 84→1424, y 286→772); editable area 1298×392 at (104,304).
- Empty: placeholder "Enter the text you want to check here" top-left; the same three tiles centered;
  a single disabled outlined "Check for AI" (114×32) centered at the bottom.
- With text (`02b-detector-text-entered.png`): "106 Words 🗑" bottom-left; "Check for AI" becomes solid blue
  and moves to bottom-right.
- After submit the card grows: a results panel (~200px tall) slides in **under** the editor inside the same
  card, split into a left status column (~640px) and a right "Checking result:" column.

---

## 3. Controls (exact labels and options)

| Control | Where | Label / options | Notes |
|---|---|---|---|
| Mode select | Humanizer bottom bar | **Fast / Creative / Enhanced** — default **Enhanced** | 102px-wide dropdown, 32px rows, selected row bold on lighter bg (`01b-home-mode-dropdown-open.png`). Hidden option values "aggressive"/"latest" exist in the DOM but are not shown. Labelled by "Humanizer 2.0" + orange "NEW" badge to its left. |
| Citation Protection | Humanizer bottom bar, appears only once text exists | toggle, **default ON** (blue) | 28×16 switch, 12px label, no tooltip. |
| Check for AI | Both tools | button | Outlined; disabled grey when empty; blue-outlined on home, solid blue on detector page. Shows a spinner glyph while running ("◌ Check for AI"). |
| Humanize | Home only | button | Solid `#2361F9` when enabled. Opens sign-up modal for anonymous users. |
| Upload File / Try A Sample / Paste Text | Empty-state tiles | tiles | Vanish once text exists. |
| Word counter + clear | Bottom bar | "106 Words" + trash icon | Counter only, no limit. |
| Tips for use | Tab under humanizer | popover | See §2. |
| Earn free words | Above tool, right | "Earn free words worth $6 →" pill | Referral link. |
| Billing toggle | Pricing | **Monthly | Yearly** — default **Yearly** | Two-segment pill; active segment is a filled blue pill. No "save X%" text on the toggle itself. |
| Currency select | Pricing | USD (default), EUR, AUD, BRL, CAD, CHF, CZK, DKK, GBP, HUF, ILS, JPY, MXN, NOK, PHP, PLN, SEK, MYR, INR, CNY, UAH | 8 rows visible, scrolls (`04c-pricing-currency-dropdown.png`). |
| FAQ accordion | Home / detector | + / – | First item open by default, question turns orange when open. |

**Not present anywhere:** language selector for the tool, readability level, purpose/tone, keyword-to-keep
input, strength slider, sentence highlighting, copy/download buttons in the anonymous state.

---

## 4. Results

### Detection (works without login — same widget on home and /ai-detector)
- **Loading** (`02c-detector-loading.png`, `03b-home-check-loading.png`): left column shows a small pink robot
  illustration, the word "Checking." and a blue progress bar (~470px wide, 8px tall) with a numeric label
  ("87.0%"); the "Check for AI" button shows a spinner; each detector row shows a spinning ring instead of
  a verdict icon.
- **Result** (`02d-detector-result.png`, `03c-home-detector-result.png`):
  - Left column: red filled circle (48px) with a white ✕, then bold 20px sentence
    **"The input content seems to be AI-generated."**, then a solid-blue button **"Humanize Your Text Now"**
    (223×32) directly beneath. (On the home page this column sits under the input pane, and "Humanize Your
    Text Now" is absent because the Humanize button is already in the bar.)
  - Right column: label "Checking result:" then a **4 + 3 grid of detector rows**, each = 24px brand icon +
    name + verdict glyph: **GPTzero, Copyleaks, ZeroGPT, Crossplag / Sapling, Writer, BrandWell** — all showed a
    red ✕ for our sample. Column gaps ≈150px.
  - Legend row under a hairline: "✓ Human-written" (green) · "? 50% Human-written" (white, question icon) ·
    "✕ AI-generated" (red).
  - **No numeric overall score, no per-detector percentages, no sentence/paragraph highlighting, no
    copy/share/report.** The verdict is purely ternary per detector.
- The trust pills and "Tips for use" remain visible below.

### Humanizer output
- Not observable anonymously: clicking **Humanize** opened a modal within ~5ms (`03e-home-humanize-result.png`).
  The output pane stayed empty (no blurred preview, no skeleton). From the Tips copy, the logged-in output has
  **"Retry"** (re-run) and **"Dislike"** (feedback) actions; the marketing mock (`02e-detector-how-it-works.png`)
  shows a "Mode: Enhanced ▾ | Humanize" bar — consistent with the live tool.
- There is no before/after score presentation visible in the anonymous flow.

---

## 5. Copy (verbatim)

- Home headline: "Convert AI Text to {Human-like | Plagiarism-free | Undetectable | Authentic} Content". No sub.
- Detector H1: "Trusted Free AI Detector & AI Checker by BypassGPT"; sub: "Use BypassGPT's AI checker to check
  your content against multiple well-known AI detectors. Get instant AI check results for your text with high
  accuracy."
- Pricing H1: "Bypass AI Detection Easily at Affordable Prices". Sale banner: "Back to School Sale: Up to 64%
  OFF!" Top banner: "Invest in your GPA this semester. Save up to 64%!" / "Get Discount".
- Placeholders: "Enter the text you want to humanize here" / "Enter the text you want to check here".
- Tiles: "Upload File", "Try A Sample", "Paste Text".
- Buttons: "Check for AI", "Humanize", "Humanize Your Text Now", "Try Now", "Subscribe", "Pay with PayPal",
  "Upgrade Now", "Login", "Start for Free", "Bypass AI Detection for Free", "Make AI Text 100% Undetectable",
  "Bypass All AI Detectors", "Get Discount", "Continue with Google", "Sign up with Facebook",
  "or continue with email", "Sign in here".
- Micro-copy: "Humanizer 2.0" + "NEW"; "Enhanced"; "Citation Protection"; "106 Words"; "Checking result:";
  "Checking."; "The input content seems to be AI-generated."; legend "Human-written / 50% Human-written /
  AI-generated"; "Earn free words worth $6"; "Tips for use" (full text in §2); "Recognized for Excellence:";
  "Secure Payment:"; "3-day money-back guarantee"; "Already have an account?".
- Trust pills: "Trained with 200M+ Data", "Top Choice for 10M+ Users", "99%+ Human Score".
- Home FAQ questions: What is an AI bypasser? · Why should I bypass AI detectors? · How do I convert AI text
  to human content for free? · What is BypassGPT? · How does BypassGPT help you bypass AI detection? · Why
  should you choose our AI humanizer to bypass AI detectors? · Does this AI to human text converter support
  multilingual paraphrasing? · Is BypassGPT free? · Do you offer API solutions?
- Detector FAQ questions: What is an AI detector? · How does BypassGPT's AI writing detector work? · Can
  BypassGPT detect all types of AI-generated content? · Can I use this AI checker for essays and academic
  papers? · Can the ChatGPT checker detect content from other AI writing tools? · What does it mean if your AI
  detector says my content is AI-generated? · Does the BypassGPT AI detector support multiple languages? · Is
  this AI writing checker completely accurate? · What is the best AI detector? · Is your ChatGPT detector free
  to use? · How fast is the AI detection process?
- Disclaimers: none near the tool (no "results may vary" / accuracy caveat). The only caveat-like text is the
  Tips popover's "98% of the time".

---

## 6. Gating (anonymous user)

- **AI detection runs without an account** (106-word sample accepted; results in ~5–10s). No captcha challenge
  shown (reCAPTCHA v3 badge only).
- **Humanize is gated immediately**: a centered dark modal (558px wide, X top-right, page dimmed) reads
  **"Sign up now to unlock an extra 150 FREE words"** with a solid-blue "G Continue with Google →", an outlined
  "f Sign up with Facebook", a small pill "or continue with email", and footer "Already have an account?
  **Sign in here**". No output is generated or blurred behind it; the editor bar greys out.
- Quotas are only stated on /pricing: Free = **150 Words / month**, **80 words per input**. The editor itself
  shows no remaining-words counter.
- Additional free words are offered via the referral pill "Earn free words worth $6 →" and the "+150 FREE
  words" sign-up framing.
- "Try Now" on the Free plan and every "Start for Free" go to the tool, not a checkout.

---

## 7. Pricing

Layout: 4 equal cards (317px wide, 32px radius, 812px tall) with 24px gaps; the **Unlimited** card is the
highlighted one — translucent blue bg `rgba(35,97,249,.65)`, **yellow** "Subscribe" button, white "Pay with
PayPal" button; other cards are dark grey with orange-outlined "Try Now"/"Subscribe" and dark-grey PayPal
buttons. Price is 48px Inter 500 with "USD /mo" beside it and the struck-through old price stacked above the
unit. A "% OFF" orange pill sits above each paid plan name. Words-per-month is the second-largest line.
Each card ends in a full-width footer strip "3-day money-back guarantee ⓘ" (including Free). **No "Most
popular" badge** — the recommendation is conveyed purely by colour.

**Yearly (default)**
| Plan | Badge | Price | Was | Allowance | CTA |
|---|---|---|---|---|---|
| Free | — | $0.00 USD /mo | — | 150 Words / month | Try Now |
| Basic | 43% OFF | $6.80 USD /mo | $12 | 5,000 Words / month | Subscribe + Pay with PayPal |
| Unlimited (highlighted) | 59% OFF | $16.15 USD /mo | $39 | Unlimited Words / month (words in orange) | Subscribe (yellow) + Pay with PayPal |
| Pro | 64% OFF | $12.75 USD /mo | $35 | 30,000 Words / month | Subscribe + Pay with PayPal |

**Monthly**
| Plan | Badge | Price | Was | Allowance |
|---|---|---|---|---|
| Free | — | $0.00 | — | 150 Words / month |
| Basic | 15% OFF | $10.20 | $12 | 5,000 Words / month |
| Unlimited | 15% OFF | $33.15 | $39 | Unlimited Words / month |
| Pro | 15% OFF | $29.75 | $35 | 30,000 Words / month |

(Note the odd ordering: Pro at $12.75 is cheaper than Unlimited at $16.15 and sits to its right.)

**Feature lists** — two variants were served across page loads (likely an A/B test):
- Variant A (first load, `04-pricing-default-yearly.png`/`recon-pricing.png`): Free — ✓ Humanize 80 words per
  input, ✓ Fast mode, ✓ Creative mode, ✓ Enhanced mode, ✓ Undetectable rewriting, ✓ Error-free, highly readable
  outputs, ✓ No plagiarism issues, ✓ Built-in AI checker, ✗ Bypass all basic AI detectors, ✗ Bypass Turnitin,
  ✗ Bypass Originality.ai Turbo 3.0, ✗ Remove ChatGPT Watermarks. Basic — same but "Humanize 500 words per
  input", ✗ on the last four. Unlimited — "Unlimited words per input", ✓ on everything. Pro — "Humanize 1,000
  words per input", ✓ on everything.
- Variant B (`04b-pricing-monthly.png`, `04d-pricing-cards-bottom.png`): all green checks — "80 / 500 /
  Unlimited / 1,000 words per request", Fast mode, Creative mode, Enhanced mode, "Bypass basic AI detectors
  (GPTZero, ZeroGPT, Copyleaks, Winston AI, etc.)", All-in-one AI checker, Plagiarism-free guaranteed,
  Undetectable, human-like content (Basic: "Undetectable content"), Fast, error-free rewriting (Basic: "Fast
  rewriting"), Multi-layered data encryption (Basic: "Robust data encryption"), Priority customer support
  (Basic: "Standard customer support").
- Toggle labels: "Monthly" / "Yearly". No "save X%" wording on the toggle; savings are expressed as the per-card
  "% OFF" pills and strikethrough prices. Currency select (21 currencies) sits left of the toggle.
- Money-back: "3-day money-back guarantee" with an ⓘ icon on every card.
- FAQ: **none on /pricing** (FAQs live on home and detector pages).
- "Secure Payment:" row with Mastercard, Visa, American Express, Apple Pay, UnionPay + one more mark.
- A hidden off-canvas "Get started with BypassGPT" sign-up panel (Google / Facebook / email) is pre-rendered in
  the DOM; Subscribe presumably slides it in (not clicked).

---

## 8. What they do more clearly than a typical clone

1. **The editor is the hero.** On the home page there is a one-line headline and no subheadline; the 1340×486 tool card starts ~140px below the banner so the entire editor and its action bar are inside the first 900px. Clones usually spend 300–400px on headline + paragraph + badges before the textarea.
2. **Empty-state affordances are three equal tiles, centered in the pane** ("Upload File / Try A Sample / Paste Text", 158×82 each, icon over a 12px label), while the placeholder sentence stays small in the top-left. The tiles disappear the moment text exists, so they never compete with content.
3. **The two verbs are visually ranked.** "Check for AI" is an outlined button at the far left of the bottom bar; "Humanize" is the only solid-blue button at the far right. Both stay greyed until text is present, so the enabled state doubles as a "ready" signal.
4. **Settings are one tiny dropdown, not a panel.** Mode is a 108px "Enhanced ▾" select with exactly three options (Fast / Creative / Enhanced), framed by the version label "Humanizer 2.0" + orange "NEW" badge; the only other option ("Citation Protection") is a labelled toggle that only appears once there is text.
5. **Detection results are a verdict sentence plus a glyph grid, not a gauge.** A 48px red ✕ circle, one bold line ("The input content seems to be AI-generated."), and 7 detector rows (icon + name + ✓/?/✕) in a 4+3 grid with a 3-item legend. No percentages to argue with, and the whole thing fits in ~200px under the editor.
6. **The loading state accounts for the wait.** A blue progress bar with a live percentage ("Checking." 87.0%), a spinner in the button and a spinner ring in every detector row — three synchronized cues instead of a single spinner.
7. **The verdict is paired with the next step.** "Humanize Your Text Now" sits directly under the verdict text on the detector page, so the detector-to-humanizer funnel is one click and one glance.
8. **Word counter lives next to the actions.** "106 Words" + trash icon sit beside "Check for AI" on the same 32px row rather than floating in a corner; clearing the editor is one click.
9. **The paywall is framed as a gift.** The gating modal reads "Sign up now to unlock an extra 150 FREE words"; one solid-blue Google button, Facebook outlined, email demoted to a small pill, sign-in as a footer link. There's no blurred output tease — the ask is clean.
10. **Help is tucked into a tab.** "Tips for use" hangs off the card's bottom-left corner and opens a numbered 01/02/03 popover with concrete recovery steps (Retry → change mode → regenerate draft) and a feedback instruction ("click on 'Dislike'"). It never occupies editor real estate.
11. **Pricing hierarchy is carried by colour alone.** The recommended plan is the only blue card and owns the only yellow button; every card repeats the same vertical rhythm (badge → name → 48px price with struck old price → words/month → primary → PayPal → checklist → "3-day money-back guarantee" footer strip), so the eye compares like with like.
12. **Global pricing switches share one row.** Currency ("USD ▾") and billing ("Monthly | Yearly", active segment a filled blue pill) sit together, centered, directly under the sale banner with its boxed countdown — the two things that change the numbers are adjacent to the numbers.

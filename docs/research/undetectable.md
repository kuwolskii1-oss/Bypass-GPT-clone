# undetectable.ai — competitive UI notes (captured 2026-09-02, 1440x900 viewport, logged out, headless Chromium)

Screenshots + text dumps: `scratchpad/shots/undetectable/` (`<name>.png` = viewport, `<name>.full.png` = full page, `<name>.txt` = visible text).
Failures logged in `_tools-notes.json` / `_pricing-notes.json`: (1) hovering a highlighted sentence in the detector result timed out (no hover tooltip found); (2) the pricing page has **no feature-comparison table and no FAQ section** — those captures failed because the elements do not exist, not because the page broke.

Not done on purpose: no account created, no purchases, nothing entered other than the supplied sample paragraph. All site text below is quoted as data.

---

## 1. Navigation and page structure

**Global chrome (all pages)**
- Top promo banner (solid blue, full-width, ~52px): "🖼️ Find out in seconds if an image is real or AI generated with our AI Image Detector." + white "Check Now" button + "×". Absent on /pricing.
- Header (white, ~78px): wordmark `undetectable™AI` left; centre-right links **Products ⌄ · AI Detector · AI Humanizer · Pricing (red superscript "SALE") · Business Solutions · API · Earn**; then 🇺🇸 "EN ⌄" language button, a circular avatar button (aria "Sign in"), and a green pill **"Start FREE Trial"** (183x40). On /pricing the green CTA is dropped from the header (only the avatar remains).
- Press strip directly under the header (light grey, ~40px): Forbes logo "Rated #1 Best AI Detector by Forbes!" · BuzzFeed "\"Making AI-generated content more human-like\"" · Business Insider "\"Unrivaled accuracy and writing styles!\"".
- Left vertical icon rail on tool pages (home: 5 icons = AI Detector, AI Humanizer, AI Image Detector, Business Solutions, Chrome Extension; /ai-humanizer: 7 icons = Extension, AI Detector, AI Humanizer, AI Image Detector, AI Job Applier, AI SEO Writer, More). Icon-only, labels appear as text in the DOM.
- Footer columns: Media (About Us, Articles, Blog, Media Kit) · Quick Links (Pricing, API, Products, Business Solutions, Earn) · Safety (Help, Ethics, Terms, Privacy) · Creation (AI Humanizer, Paraphrasing Tool, AI Essay Writer, AI Stealth Writer, AI Plagiarism Checker, AI Text Watermark Remover, AI SEO Content Writer, Human Typer, AI Job Applier, Chrome Extension) · Detection (AI Detector, AI Image Detector, AI Voice Detector, AI Video Detector, Deepfake Detection, Fake PDF Detector, Fake Receipt Detector, Fake ID Detector). Address line "1309 Coffeen Avenue, Sheridan, WY, US, 82801", "©2026 Undetectable Inc.™ All Rights Reserved", "Privacy Settings", "Notice at collection".
- The "Products" hover menu did not render a distinct mega-menu in the headless capture (01b) — treat the footer Creation/Detection lists as the product taxonomy.

**Home `/` (01-home)** — H1 "Improve Your Content With Undetectable AI"; sub "Detect AI, humanize your writing, and enhance your creative work." Tool sits directly under the H1 (top of card at y≈365). Section order down the page: press strip → hero + tool → social-proof pill → "TRUSTED BY LEADING ORGANIZATIONS. UNDETECTABLE AI HAS BEEN FEATURED ON…" logo wall with stats ("TRUSTED BY 24,198,641 USERS", "40,495 NEW USERS THIS WEEK", "PRESS MENTIONS →") → "The AI Tools you need to submit with confidence" (3 feature blocks: "See your text the way a detector would" / "Give your writing a human voice" / "Know if an image can be trusted", CTAs "Detect AI Text", "Humanize AI Text", "Detect AI Image") → "Be More Productive with the Undetectable AI Chrome Extension" ("TRY FOR FREE") → "Undetectable AI is Trusted by Industry Leaders" (6 press quotes, each with ⭐⭐⭐⭐⭐) → "Discover Undetectable AI's Suite of Tools" (6 cards + "View more tools") → "Join millions of users / Transform your writing with AI-powered tools" ("SUBSCRIBE NOW") → "Built for every kind of creator" (Students and Educators / Professionals / Content Writers / Business Owners) → "Frequently Asked Questions" (7 accordions) → "Enhance Your Creative Work and Submit With Confidence" → footer.

**AI Detector `/ai-detector` (02-detector-empty)** — pull-quote above H1: "\"One of the best ways to check if AI wrote something is to use Undetectable.ai\""; H1 "AI Detector: Trusted AI Checker for ChatGPT & More"; sub "Paste your text into our AI Detector to check if it will be flagged as AI-generated content. Our tool detects AI content from ChatGPT, Gemini, Claude, and other models." Tool immediately below. Sections after: featured-on → "The Most Accurate AI Checker: 99%+ Accuracy Proven By Independent Tests" (a comparison grid: rows Undetectable AI / Originality.ai / GPTZero / Writer.com / Copyleaks × 5 publication columns, with "Grade A+ … Grade D" cells) → "Honorable Mention" (peer-reviewed study call-out) → "Why Our AI Checker Outperforms the Rest" → "The AI Detector Trusted by Industry Leaders" (8 quotes) → "See Why Users Love Undetectable AI's Detector Tool" → "Our AI Content Detector is Perfect for:" → "Detect AI Text from ChatGPT and Every Other AI Model" → FAQ (9) → "Detect AI Content with Confidence" → footer.

**AI Humanizer `/ai-humanizer` (03-humanizer-empty)** — H1 in two lines "Advanced AI Humanizer:" / "Humanize AI Text Instantly and Score as Human in Detectors" (no subheadline). Tool immediately below, full content width. Sections after: "How UD AI Turns AI-Generated Content into Humanized Content" (static before/after demo, see §4) → featured-on → "Stop Getting Flagged by AI Detectors. Our AI Humanizer Lets You:" → "How to Use Our Free AI Humanizer to Humanize AI Texts and Score as Human on Detectors" (2-minute video, "TRY FOR FREE →") → "The best AI humanizer" → "Why Choose Undetectable's Humanize AI Tool" → "An Advanced AI Humanizer for Professionals, Students, and Content Creators" (3 steps: "Input Your AI-Generated Content" / "Let Our AI Humanizer Do The Work" / "Receive Your Humanized Text in Seconds") → "Our AI Humanizer is Perfect for:" (6 personas) → "Humanize AI Text Free, with Confidence" → "Undetectable's AI Checker and AI Humanizer Supports Multiple Languages" → FAQ (8) → "Score as Human in AI Detectors and Use AI Confidently" → footer.

**Pricing `/pricing` (04-*)** — H1 "Try our AI Humanizer and Detector rated #1 on Forbes!" → guarantee line → billing toggle → 4 plan cards → "6 Months Free • Cancel Anytime" → "For Business" card → free-trial footnote → featured-on strip → footer. No comparison table, no FAQ.

---

## 2. Tool layout

### Detector-style tool (home and /ai-detector) — single textarea
- One white card, 995px wide (x 263→1256 at 1440), ~325px tall, 1px grey border, 12px radius, subtle shadow. Content is vertically centred.
- **Empty state** (exact copy, centred): `[📋 Paste your text]` **or** `[📎 Upload file]` — both are light-blue-tinted pills with blue text (165x40 / 136x40); below, grey text "or try sample text from"; below that four grey chips **ChatGPT · Claude · DeepSeek · Human** (40px tall). There is no placeholder text and no textarea in the DOM until content arrives: the `<textarea aria-label="input-detector-textarea">` is mounted only after "Paste your text" (reads the clipboard) or a sample chip is used. Typing into the empty card does nothing.
- **Action bar** is a separate white strip under the card (same width, 68px tall): left "0/5000 Words" (home) / "0/10000 Words" (/ai-detector); right: outlined **"Check for AI"** (190x40, blue text) and, on home only, filled blue **"Humanize"** (172x36). On /ai-detector only "Check for AI" shows in the empty state; "Humanize" and a "Clear" control appear after a result.
- Under the bar: social-proof pill with 3 avatars — "Trusted by 24M+ users • 40,495 new users this week!" (blue text, light-blue outline).
- With text loaded (02b/02d) the card becomes a plain textarea (953x281, no visible label) and the counter updates ("105/5000 Words", "230/10000 Words" for the ChatGPT sample).

### Humanizer tool (/ai-humanizer) — two panes
- Outer light-grey card 1244px wide (x 128→1372), inner white **settings toolbar** (1210x64) on top, then two equal white panes each ~600px wide × ~535px tall with a 12px gutter.
- Toolbar left→right: `Basic | Stealth` (a thin vertical divider) `General Writing · Essay · Article · Marketing Material · Story · More ⌄` … far right `⚡ Undetectable` + toggle switch (off). Active item = blue text + 2px blue underline; inactive = black. Defaults: **Basic** + **General Writing**.
- **Input pane empty state**: top-left small grey text "Insert or [📋 Paste] text here" (Paste is an inline blue text button). Lower-centre: "Try sample text from" + chips ChatGPT / Claude / DeepSeek / Human. Textarea `aria-label="Input text"`, placeholder empty.
- Input pane footer: "0 Words" left, **"Humanize AI"** button right (160x40; disabled/pale blue when empty, solid blue when text present). After running, an "×" clear control appears at the top-right of the input pane.
- **Output pane empty state**: top-left blue-grey text "Humanized text will appear here"; footer "0 Words".
- No file upload, no readability/purpose dropdowns on this page — purpose is the tab row; "readability"/"human level" only surface in the home modal (see §4).

---

## 3. Controls (exact labels and options)

| Control | Where | Options / behaviour |
|---|---|---|
| Model tabs | humanizer toolbar | **Basic** (tooltip "Bypass basic detectors"), **Stealth** (tooltip "Bypass most detectors") |
| Purpose tabs | humanizer toolbar | General Writing · Essay · Article · Marketing Material · Story · **More ⌄** → popover (right-aligned under "More", ~375px wide, 4 rows): Cover Letter · Report · Business Material · Legal Material |
| "⚡ Undetectable" switch | toolbar far right | `role=switch`, default off. Tooltip (bottom-end): "Bypasses 99+% of detectors." + link "Sign up for free to become undetectable by all AI detectors and get access to all features." (→ /pricing). Clicking it in our logged-out session left it unchecked and opened no modal. |
| Paste | detector card / humanizer input | "Paste your text" pill (detector) / inline "Paste" text button (humanizer); reads clipboard |
| Upload file | detector card only | "Upload file" pill (hidden `<input type=file>`) |
| Sample chips | both tools | ChatGPT · Claude · DeepSeek · Human (loads a ~230-word sample) |
| Primary actions | detector bar / humanizer input footer | "Check for AI" (outlined), "Humanize" (filled, home) / "Humanize AI" (filled) |
| Post-result actions | detector result | "Export PDF" (outlined, doc icon), "Humanize Text" (filled), "Clear" |
| Home humanize modal header | modal | read-only stats READABILITY **University** · PURPOSE **General Writing** · HUMAN LEVEL **Balanced** · WORD COST **105**; segmented control **Basic | Stealth**; "⚡ Undetectable" toggle; "×" close |
| Pricing toggle | /pricing | segmented pill **Monthly** | **Yearly** with inner chip "50% off" (default Yearly) |
| Word slider | 4th plan card | range 50,000→380,000 (yearly) / 80,000→Unlimited (monthly), "−" (pink) and "+" (green) 32px buttons, keyboard-accessible slider |

Word limits shown: home 5,000 words, /ai-detector 10,000 words, humanizer shows only a running "N Words" (marketing copy claims "up to 10,000 characters in one go").

---

## 4. Results presentation

### Detector result (02f-detector-result, 01e-home-check-result)
- The result renders as a **new card appended below the tool + social-proof pill** (input card stays above; page auto-scrolls to it). Card ~700px wide (x 410→1108), centred, white, rounded.
- Hierarchy top→bottom, all centred: headline "Your text is **AI generated**" (only the verdict phrase in red, plus a small ⓘ icon) → red **semicircular gauge** (≈200px wide, thick stroke) with "99%" (bold, ~30px) and the class label "AI / GPT" (bold, ~26px) inside the arc → scrollable text block (max ~190px tall) where every sentence is wrapped in a **pink/rose highlight span** (visible gaps between sentence spans) → left: bold "Highlighted text is AI" with legend swatches ■ green "Human" ■ pink "AI"; right: outlined **"Export PDF"** → attached light-blue footer band: two bold lines "Don't Risk Submitting AI Detected Text" / "Click to Score as Human on Detectors", blue button **"Humanize Text"**, and a handwritten-style annotation "Humanize!" with a curved arrow pointing at the button.
- There are **no per-detector rows** in the live free result (no GPTZero/Turnitin list) — only a single score. The per-detector breakdown exists only as a static illustration on the humanizer page ("AI DETECTION LIKELIHOOD", KEY: Human · Likely AI · AI; "OUR DETECTOR 1% Human" vs "OTHER DETECTORS 99% AI" with rows Free Detectors / Standard Detectors / Advanced Detectors; after humanizing "OUR DETECTOR 99% Human", with "Copy Output" / "Humanize Again" buttons and a "Free" tag).
- Hovering a highlighted sentence produced no tooltip we could detect.
- The action bar under the input now reads "105/10000 Words" and gains **"Humanize"** next to "Check for AI".

### Humanizer result (03h/03i on /ai-humanizer; 01g/01h home modal)
- **/ai-humanizer, logged out**: clicking "Humanize AI" does not produce text. The output pane shows a large thin ring spinner, "Your document is queued." (two lines, large), grey "Get faster processing with a paid plan", and a blue **"Skip the queue"** button. The input footer's "Humanize AI" turns pale (disabled) while queued. After ~10s it was still queued.
- **Home tool**: "Humanize" opens a **modal** (1150px wide, white, 20px radius, dark scrim, "×" floating top-right outside the card) titled in the DOM "Humanized text result". Header row = label/value stats in small-caps grey labels (READABILITY University · PURPOSE General Writing · HUMAN LEVEL Balanced · WORD COST 105), a pill segmented control Basic | Stealth, and "⚡ Undetectable" + toggle right. Body = two grey panes: left original text (with "105 words" under it), right a **green progress ring** with a percentage ("77%" → "99%") and "Your text is being humanized...". Final state (text dump): right pane shows the output + "105 words", a **"Switch to Undetectable"** button, and a warning block: "WARNING:" / "AI detectors might still flag your text with the Basic Public Model" / "Sign up free to unlock our Undetectable Model and achieve a 99% human on AI detectors". In our run the Basic output text was identical to the input paragraph.
- No tabs (Humanized/Compare), no copy/download button, and no before/after detector score were visible in the logged-out flow; "Copy Output" / "Humanize Again" appear only in the marketing demo.

---

## 5. Copy (verbatim)

- Home H1 "Improve Your Content With Undetectable AI" / sub "Detect AI, humanize your writing, and enhance your creative work."
- Detector H1 "AI Detector: Trusted AI Checker for ChatGPT & More" / sub as in §1.
- Humanizer H1 "Advanced AI Humanizer: Humanize AI Text Instantly and Score as Human in Detectors".
- Pricing H1 "Try our AI Humanizer and Detector rated #1 on Forbes!"
- CTAs: "Start FREE Trial", "Check for AI", "Humanize", "Humanize AI", "Humanize Text", "Export PDF", "Skip the queue", "Switch to Undetectable", "Get Started", "Contact Us", "SUBSCRIBE NOW", "TRY FOR FREE", "DETECT AI CONTENT NOW".
- Empty-state microcopy: "Paste your text", "or", "Upload file", "or try sample text from", "Insert or Paste text here", "Try sample text from", "Humanized text will appear here", "0/5000 Words", "0 Words".
- Result microcopy: "Your text is AI generated", "99%", "AI / GPT", "Highlighted text is AI", "Human", "AI", "Don't Risk Submitting AI Detected Text", "Click to Score as Human on Detectors", "Humanize!", "Your document is queued.", "Get faster processing with a paid plan", "Your text is being humanized...".
- Tooltips: "Bypass basic detectors", "Bypass most detectors", "Bypasses 99+% of detectors. Sign up for free to become undetectable by all AI detectors and get access to all features."
- Trust/social proof: "Trusted by 24M+ users • 40,495 new users this week!", "Rated #1 Best AI Detector by Forbes!", "TRUSTED BY 24,198,641 USERS", "Join 24M+ people using Undetectable".
- Disclaimers: "WARNING: AI detectors might still flag your text with the Basic Public Model"; "Free Trial is limited to 250 words. Additional usage requires paid plan activation."; "Money back guarantee. If anything we produce is flagged as not human, we will refund the cost of humanization. Check Help for more info."; FAQ "Does the AI Checker store or train on my content? No. Your text is never stored or used to train models."
- FAQ items — home: What is Undetectable AI? · How does Undetectable AI work? · Is Undetectable AI free to use? · Is Undetectable AI safe and private? · Who uses Undetectable AI? · Does Undetectable AI support multiple languages? · Can I use Undetectable AI in my browser?  Detector: How accurate is Undetectable AI's Free AI Detector? · Who should use Undetectable AI's AI checker? · Can this AI Detector identify text written by ChatGPT or GPT-5? · Is the AI Detector free to use? · Does the AI Checker work on paraphrased or rewritten AI content? · What types of text can the AI Detector analyze? · Can the AI Content Detector help avoid AI flags in schools or workplaces? · Does the AI Checker store or train on my content? · Does the Undetectable AI Detector support multiple languages? (+ "Still have questions?").  Humanizer: What is an AI Humanizer? · Can Undetectable AI's Humanizer Help You Score as Human in AI Detectors? · Is the AI Humanizer Free? · How does AI to Human technology help humanize AI text? · Can I use a ChatGPT Humanizer to avoid AI detection? · What is a ChatGPT Humanizer? · Can I use the AI Humanizer for academic purposes? · How can students use an AI Essay Humanizer?

---

## 6. Gating (logged out)

- **Detector is fully free**: no signup, no modal; full score, highlights and Export PDF button available. Limits 5,000 words (home) / 10,000 words (/ai-detector).
- **Humanizer "Basic" model is free but throttled**: on /ai-humanizer the job sits in a queue with a "Skip the queue" upsell (never completed in ~10s); on the home tool it ran inside a modal and finished, then showed the "WARNING … Basic Public Model" block + "Switch to Undetectable" / "Sign up free to unlock our Undetectable Model…".
- **"Undetectable" model** = signup/paid (switch tooltip links to /pricing; toggle did not engage). "Stealth" tab could be selected without a modal.
- No blurred output, no hard modal wall; the gating is a soft nudge inside the output area plus queueing. Free trial cap stated on pricing: 250 words.

---

## 7. Pricing

- Toggle: **Monthly | Yearly "50% off"** — default **Yearly**; selected segment is a solid blue pill, the "50% off" chip sits inside it (white on blue when selected, blue tint when not).
- Guarantee line directly under H1 (green, tag icon): "Money back guarantee. If anything we produce is flagged as not human, we will refund the cost of humanization. Check Help for more info."
- **Yearly** (04-pricing-default / 04c): cards are named by allowance, not tier names —
  - 10K words/month: ~~$9.99~~ **$5.00/mo**, "Charged annually $60.00"
  - 20K words/month: ~~$19.00~~ **$9.50/mo**, "Charged annually $114.00"
  - 35K words/month: ~~$31.00~~ **$15.75/mo**, "Charged annually $189.00"
  - 50K words/month (slider card, blue border + blue header tint): ~~$42.50~~ **$21.25/mo**; slider 50,000→380,000 with −/+; "Includes all features from other plans". 3 clicks of "+" → 170K ~~$118.83~~ $59.42/mo; max → 380K ~~$208.83~~ $104.42/mo.
  - CTA on every card: green **"Start FREE Trial"**. Below the row: "6 Months Free • Cancel Anytime".
- **Monthly** (04b): a green callout appears between toggle and cards — gift icon, "Try any yearly plan free for 3 days" / "No charge today. Cancel anytime before the trial ends." Cards shift up a tier: 20K **$19.00/mo** "0% Discount" · 35K **$31.00/mo** "7% Discount" · 50K **$42.00/mo** "12% Discount" · 80K **$64.00/mo** slider 80,000→"Unlimited". CTA changes to **"Get Started"**; footer line becomes just "Cancel Anytime".
- Feature list, identical on all three fixed cards, under a "Quick look at features:" label with green check squares: Passes AI detectors · High quality, legible content · Watermark and future proof · Writing level matching · API compatible · Unlimited Human Auto Typer · Unlimited AI Detecting.
- No "Most popular" badge; emphasis is the blue-bordered slider card. Badge "Custom Discount" only on the **For Business** card ("Need bulk credits? Looking for permanent words with no monthly expiration?", "Contact Us", features: Custom Pricing & Plans · Non-expiring credits · Redistribution & white labeling · Built to fit your needs · Priority support · Unlimited Human Auto Typer · Unlimited AI Detecting · Access to Smart Job Applier · API compatible).
- Footnote under the cards: "Free Trial is limited to 250 words. Additional usage requires paid plan activation."
- **No comparison table and no FAQ on the pricing page.**

---

## 8. What they do more clearly than a typical clone

1. The empty state is an action menu, not a blank box: two tinted pills "Paste your text" / "Upload file" joined by "or", then "or try sample text from" with chips named after models (ChatGPT · Claude · DeepSeek · Human). The textarea is not even mounted until text arrives, so there is no placeholder to write.
2. Word counter and primary actions live in their own slim bar under the input card ("0/5000 Words" left; outlined secondary "Check for AI" + filled primary "Humanize" right), keeping the input surface clean and the limit permanently visible.
3. Verdict-first result hierarchy: "Your text is AI generated" with only the verdict phrase in red, then a half-gauge with "99%" and a class label "AI / GPT" inside the arc — headline, number, label stacked and centred, nothing else competing.
4. The highlight legend sits directly under the highlighted text as a bold sentence ("Highlighted text is AI") plus two colour swatches ("Human" green, "AI" pink), with the export action ("Export PDF") on the same row, right-aligned.
5. The cross-sell is welded to the result card as a tinted footer band: two short bold lines ("Don't Risk Submitting AI Detected Text" / "Click to Score as Human on Detectors"), one button ("Humanize Text"), and a hand-drawn "Humanize!" arrow — one obvious next step.
6. Humanizer settings are a single toolbar row above the panes: model tabs (Basic | Stealth) separated by a divider from purpose tabs, with the paid "⚡ Undetectable" toggle pushed to the far right; active state is blue text + 2px underline. Only the overflow (4 extra purposes) hides behind "More ⌄".
7. Every mode has a one-line outcome tooltip on hover ("Bypass basic detectors", "Bypass most detectors", "Bypasses 99+% of detectors." + a sign-up link), so the difference between tiers is explained in place rather than on the pricing page.
8. The two panes are true mirrors with matching footers ("105 Words | Humanize AI" vs "0 Words"), and both placeholders are full sentences: input "Insert or [Paste] text here" with the verb as an inline button, output "Humanized text will appear here".
9. Waiting states are used as sales moments inside the output pane itself: "Your document is queued." with a ring, "Get faster processing with a paid plan", and a "Skip the queue" button — no separate modal, no blank pane.
10. The home humanize modal opens with a read-only settings summary as its header (READABILITY University · PURPOSE General Writing · HUMAN LEVEL Balanced · WORD COST 105 in small-caps label/value pairs), so the user sees what was applied and what it cost before the output appears; the progress ring shows a live percentage.
11. Pricing puts the incentive inside the control: the selected "Yearly" segment carries a "50% off" chip, each card shows the struck-through monthly price beside the discounted one plus "Charged annually $60.00", and switching to Monthly triggers a green "Try any yearly plan free for 3 days" callout while the CTA changes from "Start FREE Trial" to "Get Started".
12. Instead of a vague "Enterprise" card, the fourth card is a live slider (50,000→380,000 words with −/+ buttons and an updating price) with a blue border as the emphasis, the money-back guarantee sits directly under the H1 before any price, and the free-trial cap ("Free Trial is limited to 250 words…") is a footnote under the cards rather than hidden in a FAQ.

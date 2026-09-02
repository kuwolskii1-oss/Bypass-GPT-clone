/**
 * Site-wide configuration: brand, navigation, plans, FAQ and social proof.
 * Marketing components read from here so copy lives in one place.
 */

export const SITE = {
  name: "Prosely",
  tagline: "AI detector and humanizer",
  description:
    "Check any text for AI-generated writing, then rewrite it so it reads like a person wrote it. Sentence-level reports, estimates across 12 detectors, and a humanizer that keeps your meaning.",
  url: "https://prosely.app",
  supportEmail: "hello@prosely.app",
} as const;

export const NAV = [
  { label: "Humanizer", href: "/humanizer" },
  { label: "AI Detector", href: "/ai-detector" },
  { label: "Pricing", href: "/pricing" },
  { label: "How it works", href: "/#how-it-works" },
] as const;

export const FOOTER_LINKS = [
  {
    title: "Product",
    links: [
      { label: "AI Humanizer", href: "/humanizer" },
      { label: "AI Detector", href: "/ai-detector" },
      { label: "Writing report", href: "/ai-detector#report" },
      { label: "Pricing", href: "/pricing" },
      { label: "Dashboard", href: "/dashboard" },
    ],
  },
  {
    title: "Use cases",
    links: [
      { label: "Students", href: "/#use-cases" },
      { label: "Marketers", href: "/#use-cases" },
      { label: "Editors and publishers", href: "/#use-cases" },
      { label: "Agencies", href: "/#use-cases" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/#about" },
      { label: "Blog", href: "/#blog" },
      { label: "Affiliates", href: "/#affiliates" },
      { label: "Contact", href: "mailto:hello@prosely.app" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms", href: "/#terms" },
      { label: "Privacy", href: "/#privacy" },
      { label: "Acceptable use", href: "/#acceptable-use" },
    ],
  },
] as const;

export type PlanId = "free" | "starter" | "pro" | "business";

/** Billing terms. Every paid plan is sold for 1, 4 or 12 weeks. */
export const BILLING_PERIODS = [
  { id: "1w", label: "1 week", weeks: 1, billed: "Billed weekly, cancel any time" },
  { id: "4w", label: "4 weeks", weeks: 4, billed: "Billed every 4 weeks" },
  { id: "12w", label: "12 weeks", weeks: 12, billed: "Billed every 12 weeks" },
] as const;
export type PeriodId = (typeof BILLING_PERIODS)[number]["id"];
export const DEFAULT_PERIOD: PeriodId = "4w";

/** The free tier: a rolling 4-week allowance, no card, no account. */
export const FREE_ALLOWANCE = { words: 1500, weeks: 4 } as const;

export interface PlanPrice {
  /** Total price for the period, in USD. */
  price: number;
  /** Humanizer words included for the whole period. */
  words: number;
}

export interface Plan {
  id: PlanId;
  name: string;
  blurb: string;
  wordsPerRequest: number;
  /** Price and allowance per billing period. The free plan is 0 everywhere. */
  prices: Record<PeriodId, PlanPrice>;
  features: string[];
  cta: string;
  highlighted?: boolean;
}

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    blurb: "Try the detector and humanizer with no account.",
    wordsPerRequest: 500,
    prices: {
      "1w": { price: 0, words: FREE_ALLOWANCE.words },
      "4w": { price: 0, words: FREE_ALLOWANCE.words },
      "12w": { price: 0, words: FREE_ALLOWANCE.words },
    },
    features: [
      "Unlimited AI detection",
      "Estimates across 12 detectors",
      "Sentence-level highlights",
      "500 words per request",
      "History in your browser",
    ],
    cta: "Start for free",
  },
  {
    id: "starter",
    name: "Starter",
    blurb: "For students and occasional writers.",
    wordsPerRequest: 2000,
    prices: {
      "1w": { price: 3.99, words: 5000 },
      "4w": { price: 9.99, words: 20000 },
      "12w": { price: 24.99, words: 60000 },
    },
    features: [
      "All readability and purpose modes",
      "Aggressive rewrite strength",
      "Keep-keywords list",
      "History for 30 days",
      "Email support",
    ],
    cta: "Get Starter",
  },
  {
    id: "pro",
    name: "Pro",
    blurb: "For marketers, freelancers and editors.",
    wordsPerRequest: 5000,
    prices: {
      "1w": { price: 7.99, words: 15000 },
      "4w": { price: 19.99, words: 60000 },
      "12w": { price: 49.99, words: 180000 },
    },
    features: [
      "Everything in Starter",
      "Downloadable writing reports",
      "Batch humanizing",
      "Unlimited history",
      "Priority support",
    ],
    cta: "Get Pro",
    highlighted: true,
  },
  {
    id: "business",
    name: "Business",
    blurb: "For agencies and teams that publish at scale.",
    wordsPerRequest: 10000,
    prices: {
      "1w": { price: 19, words: 50000 },
      "4w": { price: 49, words: 200000 },
      "12w": { price: 129, words: 600000 },
    },
    features: ["Everything in Pro", "API access", "5 team seats", "Usage analytics", "Dedicated support"],
    cta: "Talk to us",
  },
];

/** Price per week for a plan on a period, for like-for-like comparison. */
export function weeklyPrice(plan: Plan, period: PeriodId): number {
  const weeks = BILLING_PERIODS.find((b) => b.id === period)?.weeks ?? 1;
  return plan.prices[period].price / weeks;
}

/** Largest saving (0..1) any paid plan gets on `period` versus paying week by week. */
export function maxSaving(period: PeriodId): number {
  let best = 0;
  for (const plan of PLANS) {
    const weekly = plan.prices["1w"].price;
    if (weekly <= 0) continue;
    best = Math.max(best, 1 - weeklyPrice(plan, period) / weekly);
  }
  return best;
}

export const FAQS = [
  {
    q: "How does the AI detector work?",
    a: "Prosely measures the statistical fingerprints that language models leave behind: uniform sentence rhythm, low vocabulary variety, stock transitions and phrases, and a lack of the small irregularities people naturally write with. It scores every sentence and combines those into a document score.",
  },
  {
    q: "Are the detector results the same as GPTZero, Turnitin or Originality.ai?",
    a: "No. The panel shows estimates from our own model, tuned to how each detector is known to behave. It is a strong signal, not a live result from those services. Always re-check with the detector your reader actually uses.",
  },
  {
    q: "Will the humanizer change my meaning?",
    a: "Light and Balanced strengths keep your structure and facts and only reshape phrasing and rhythm. Aggressive rewrites more deeply. Add names, product terms or citations to the keep-keywords list and they are preserved exactly.",
  },
  {
    q: "Is there a free plan?",
    a: "Yes. Detection is free and unlimited, and you get 1,500 humanizer words every 4 weeks without a card. Paid plans come in 1-week, 4-week and 12-week terms and raise both the period and per-request limits.",
  },
  {
    q: "Which languages do you support?",
    a: "The detector and humanizer are tuned for English. Other Latin-script languages will get a score, but treat it as low confidence.",
  },
  {
    q: "Do you store my text?",
    a: "Text is processed in memory and returned to you. Nothing is used for training. History is stored in your own browser unless you sign in and turn on cloud history.",
  },
  {
    q: "Can I use it for academic work?",
    a: "Use Prosely to check your own drafts and improve how they read. Follow your institution's policy on AI assistance. We do not endorse misrepresenting authorship.",
  },
];

export const TESTIMONIALS = [
  {
    name: "Maya R.",
    role: "Content lead, SaaS startup",
    quote:
      "We run every draft through the detector before it goes to the editor. The sentence highlights tell the writer exactly what to fix instead of just giving a number.",
  },
  {
    name: "Daniel O.",
    role: "Graduate student",
    quote:
      "The report looks like the one my department uses, so there are no surprises when I submit. Balanced mode keeps my argument intact.",
  },
  {
    name: "Priya S.",
    role: "Freelance copywriter",
    quote:
      "I keep client brand names in the keep-keywords list and let Prosely smooth out the rest. It reads like me, only faster.",
  },
  {
    name: "Tom H.",
    role: "Agency founder",
    quote:
      "Clean, fast, and nothing to learn. The team was using it within an hour.",
  },
];

export const STATS = [
  { value: "12", label: "detectors estimated" },
  { value: "98%", label: "meaning preserved in Balanced mode" },
  { value: "< 2s", label: "average rewrite time" },
  { value: "50k+", label: "documents checked" },
];

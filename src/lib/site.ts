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

export interface Plan {
  id: PlanId;
  name: string;
  monthly: number;
  yearlyMonthly: number;
  wordsPerMonth: number;
  wordsPerRequest: number;
  blurb: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
}

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    monthly: 0,
    yearlyMonthly: 0,
    wordsPerMonth: 1500,
    wordsPerRequest: 500,
    blurb: "Try the detector and humanizer with no account.",
    features: [
      "1,500 humanizer words / month",
      "Unlimited AI detection",
      "Estimates across 12 detectors",
      "Sentence-level highlights",
      "500 words per request",
    ],
    cta: "Start for free",
  },
  {
    id: "starter",
    name: "Starter",
    monthly: 9.99,
    yearlyMonthly: 5.99,
    wordsPerMonth: 20000,
    wordsPerRequest: 2000,
    blurb: "For students and occasional writers.",
    features: [
      "20,000 words / month",
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
    monthly: 19.99,
    yearlyMonthly: 12.99,
    wordsPerMonth: 60000,
    wordsPerRequest: 5000,
    blurb: "For marketers, freelancers and editors.",
    features: [
      "60,000 words / month",
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
    monthly: 49,
    yearlyMonthly: 34,
    wordsPerMonth: 200000,
    wordsPerRequest: 10000,
    blurb: "For agencies and teams that publish at scale.",
    features: [
      "200,000 words / month",
      "Everything in Pro",
      "API access",
      "5 team seats",
      "Usage analytics",
      "Dedicated support",
    ],
    cta: "Talk to us",
  },
];

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
    a: "Yes. Detection is free and unlimited, and you get 1,500 humanizer words a month without a card. Paid plans raise the monthly and per-request limits.",
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

import type { Metadata } from "next";
import { Comparison } from "@/components/marketing/Comparison";
import { CtaBand } from "@/components/marketing/CtaBand";
import { DetectorsGrid } from "@/components/marketing/DetectorsGrid";
import { FAQ } from "@/components/marketing/FAQ";
import { Features } from "@/components/marketing/Features";
import { Hero } from "@/components/marketing/Hero";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { Pricing } from "@/components/marketing/Pricing";
import { ReportPreview } from "@/components/marketing/ReportPreview";
import { Testimonials } from "@/components/marketing/Testimonials";
import { TrustRow } from "@/components/marketing/TrustRow";
import { UseCases } from "@/components/marketing/UseCases";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: `${SITE.name} — ${SITE.tagline}` },
  description: SITE.description,
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustRow />
      <HowItWorks />
      <Features />
      <ReportPreview />
      <DetectorsGrid />
      <UseCases />
      <Comparison />
      <Testimonials />
      <Pricing />
      <FAQ />
      <CtaBand />
    </>
  );
}

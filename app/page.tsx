import { SiteChrome } from "@/components/SiteChrome";
import { Hero } from "@/components/Hero";
import { ReportCard } from "@/components/ReportCard";
import { FeatureCards } from "@/components/FeatureCards";
import { exampleReport } from "@/lib/types";

export default function Home() {
  return (
    <SiteChrome>
      <Hero />
      <section className="pt-22">
        <ReportCard report={exampleReport} />
        <FeatureCards />
      </section>
    </SiteChrome>
  );
}

import { Suspense } from "react";
import { SiteChrome } from "@/components/SiteChrome";
import { ReportRoute } from "@/components/report/ReportClient";

export default function ReportPage() {
  return (
    <SiteChrome>
      <Suspense fallback={<div className="py-24" />}>
        <ReportRoute />
      </Suspense>
    </SiteChrome>
  );
}

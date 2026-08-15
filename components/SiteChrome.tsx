import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      <div className="bg-grid pointer-events-none fixed inset-0 z-0" />
      <div className="relative z-10">
        <Navbar />
        <main className="mx-auto max-w-[1180px] px-8">{children}</main>
        <Footer />
      </div>
    </div>
  );
}

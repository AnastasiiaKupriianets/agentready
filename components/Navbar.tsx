"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/docs", label: "Docs" },
  { href: "/spec", label: "Spec" },
  { href: "/cli", label: "CLI" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/85 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-[1180px] items-center justify-between px-8">
        <Link href="/" className="flex items-center gap-2.5 font-mono text-[15px] font-medium tracking-tight">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect x="1" y="1" width="18" height="18" stroke="var(--color-green)" strokeWidth="1.4" />
            <path
              d="M5 10.5L8.2 13.5L15 6.5"
              stroke="var(--color-green)"
              strokeWidth="1.6"
              strokeLinecap="square"
              strokeLinejoin="miter"
            />
          </svg>
          AgentReady
          <span className="border border-line-strong px-1.5 py-0.5 text-[10px] tracking-wide text-ink-faint">
            v0.4
          </span>
        </Link>

        <nav className="flex items-center gap-7 font-mono text-[13px] text-ink-dim">
          {LINKS.map((link) => {
            const active = pathname === link.href || pathname?.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors hover:text-ink ${active ? "text-ink" : ""}`}
              >
                {link.label}
              </Link>
            );
          })}
          <span className="flex items-center gap-1.5">
            <span className="animate-pulse-dot h-1.5 w-1.5 rounded-full bg-green shadow-[0_0_8px_var(--color-green)]" />
            agent runtime online
          </span>
        </nav>
      </div>
    </header>
  );
}

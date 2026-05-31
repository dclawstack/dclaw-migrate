"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import CopilotPanel from "@/components/CopilotPanel";

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/connections", label: "Connections" },
  { href: "/jobs", label: "Jobs" },
  { href: "/waves", label: "Waves" },
  { href: "/assets", label: "Assets" },
  { href: "/cutover", label: "Cutover" },
  { href: "/testing", label: "Testing" },
  { href: "/optimization", label: "Optimize" },
  { href: "/runbooks", label: "Runbooks" },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  if (isLanding) {
    return <>{children}</>;
  }

  return (
    <>
      <nav className="sticky top-0 z-40 flex items-center gap-6 border-b border-border bg-white px-6 py-3 shadow-sm">
        <Link href="/" className="font-heading text-lg font-extrabold tracking-tight">
          <span className="text-primary">DClaw</span>{" "}
          <span className="text-foreground">Migrate</span>
        </Link>
        {navLinks.map(({ href, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`text-sm transition-colors ${
                active
                  ? "font-semibold text-primary"
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>
      <main>{children}</main>
      <CopilotPanel />
    </>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import CopilotPanel from "@/components/CopilotPanel";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  if (isLanding) {
    return <>{children}</>;
  }

  return (
    <>
      <nav className="border-b bg-white px-6 py-3 flex items-center gap-6 shadow-sm sticky top-0 z-40">
        <Link href="/" className="text-amber-500 font-bold text-lg tracking-tight">
          DClaw Migrate
        </Link>
        <Link href="/dashboard" className="text-sm text-gray-600 hover:text-amber-500 transition-colors">
          Dashboard
        </Link>
        <Link href="/connections" className="text-sm text-gray-600 hover:text-amber-500 transition-colors">
          Connections
        </Link>
        <Link href="/jobs" className="text-sm text-gray-600 hover:text-amber-500 transition-colors">
          Jobs
        </Link>
        <Link href="/waves" className="text-sm text-gray-600 hover:text-amber-500 transition-colors">
          Waves
        </Link>
        <Link href="/assets" className="text-sm text-gray-600 hover:text-amber-500 transition-colors">
          Assets
        </Link>
        <Link href="/cutover" className="text-sm text-gray-600 hover:text-amber-500 transition-colors">
          Cutover
        </Link>
        <Link href="/testing" className="text-sm text-gray-600 hover:text-amber-500 transition-colors">
          Testing
        </Link>
        <Link href="/optimization" className="text-sm text-gray-600 hover:text-amber-500 transition-colors">
          Optimize
        </Link>
        <Link href="/runbooks" className="text-sm text-gray-600 hover:text-amber-500 transition-colors">
          Runbooks
        </Link>
      </nav>
      <main>{children}</main>
      <CopilotPanel />
    </>
  );
}

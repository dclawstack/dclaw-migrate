import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import CopilotPanel from "@/components/CopilotPanel";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DClaw Migrate",
  description: "Cloud & database migration with AI guidance",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="border-b bg-white px-6 py-3 flex items-center gap-6 shadow-sm">
          <Link href="/dashboard" className="text-amber-500 font-bold text-lg tracking-tight">
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
        </nav>
        <main>{children}</main>
        <CopilotPanel />
      </body>
    </html>
  );
}

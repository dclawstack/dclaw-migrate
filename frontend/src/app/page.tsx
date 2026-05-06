import Link from "next/link";
import { ArrowRightLeft } from "lucide-react";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-8">
      <div className="flex flex-col items-center gap-6 text-center">
        <ArrowRightLeft className="h-16 w-16 text-brand" />
        <h1 className="text-4xl font-bold text-brand">DClaw Migrate</h1>
        <p className="text-lg text-gray-600">Cloud migration assistant</p>
        <Link
          href="/dashboard"
          className="rounded-lg bg-brand px-6 py-3 font-semibold text-white hover:bg-amber-600"
        >
          Go to Dashboard
        </Link>
      </div>
    </main>
  );
}

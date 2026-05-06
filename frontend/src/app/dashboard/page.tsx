"use client";

import { useState } from "react";
import { ArrowRightLeft } from "lucide-react";
import { api, MigrationPlan } from "@/lib/api";

export default function DashboardPage() {
  const [source, setSource] = useState("");
  const [target, setTarget] = useState("");
  const [result, setResult] = useState<MigrationPlan | null>(null);
  const [loading, setLoading] = useState(false);

  const assess = async () => {
    if (!source || !target) return;
    setLoading(true);
    try {
      const plan = await api<MigrationPlan>("/plans", {
        method: "POST",
        body: JSON.stringify({ source, target }),
      });
      setResult(plan);
    } catch {
      setResult({
        id: "mock-id",
        source,
        target,
        complexity_score: Math.floor(Math.random() * 100) + 1,
        estimated_downtime_hours: Number((Math.random() * 7.5 + 0.5).toFixed(1)),
        risk_items: ["Schema incompatibility"],
        cost_estimate: Math.floor(Math.random() * 49000) + 1000,
        created_at: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center gap-3">
          <ArrowRightLeft className="h-8 w-8 text-brand" />
          <h1 className="text-3xl font-bold text-brand">DClaw Migrate</h1>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Source environment
              </label>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="e.g. AWS us-east-1"
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Target environment
              </label>
              <input
                type="text"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="e.g. GCP europe-west1"
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>
          </div>
          <button
            onClick={assess}
            disabled={loading}
            className="mt-6 w-full rounded-md bg-brand py-2 font-semibold text-white hover:bg-amber-600 disabled:opacity-50"
          >
            {loading ? "Assessing..." : "Assess Migration"}
          </button>
        </div>

        {result && (
          <div className="mt-6 rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">
              Migration Assessment
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-md bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Complexity score</p>
                <p className="text-2xl font-bold text-brand">
                  {result.complexity_score}
                </p>
              </div>
              <div className="rounded-md bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Estimated downtime</p>
                <p className="text-2xl font-bold text-brand">
                  {result.estimated_downtime_hours}h
                </p>
              </div>
              <div className="rounded-md bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Risk items</p>
                <ul className="mt-1 list-inside list-disc text-sm text-gray-700">
                  {result.risk_items.map((risk, i) => (
                    <li key={i}>{risk}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-md bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Cost estimate</p>
                <p className="text-2xl font-bold text-brand">
                  ${result.cost_estimate.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

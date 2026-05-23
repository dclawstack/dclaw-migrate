"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { dashboardApi, DashboardStats, MigrationJob } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  draft: "outline",
  ready: "secondary",
  running: "default",
  completed: "secondary",
  failed: "destructive",
  paused: "outline",
};

function StatCard({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <Card>
      <CardHeader className="pb-1">
        <CardTitle className="text-sm font-medium text-gray-500">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold text-amber-500">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    dashboardApi.stats()
      .then(setStats)
      .catch((e) => setError(e.message));
  }, []);

  if (error) {
    return (
      <div className="p-8 text-red-500">
        Failed to load dashboard: {error}
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Connections" value={stats?.total_connections ?? 0} />
        <StatCard label="Total Jobs" value={stats?.total_jobs ?? 0} />
        <StatCard label="Running" value={stats?.running_jobs ?? 0} />
        <StatCard
          label="Completed"
          value={stats?.completed_jobs ?? 0}
          sub={stats?.failed_jobs ? `${stats.failed_jobs} failed` : undefined}
        />
      </div>

      <div className="bg-white rounded-lg border shadow-sm">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="font-semibold text-gray-700">Recent Jobs</h2>
          <Link href="/jobs" className="text-sm text-amber-500 hover:underline">
            View all
          </Link>
        </div>
        {!stats || stats.recent_jobs.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-400 text-sm">
            No jobs yet.{" "}
            <Link href="/jobs" className="text-amber-500 hover:underline">
              Create your first job →
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 text-left">Name</th>
                <th className="px-6 py-3 text-left">Type</th>
                <th className="px-6 py-3 text-left">Source → Target</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {stats.recent_jobs.map((job: MigrationJob) => (
                <tr key={job.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-800">{job.name}</td>
                  <td className="px-6 py-4 text-gray-500">{job.migration_type.replace("_", " ")}</td>
                  <td className="px-6 py-4 text-gray-500">
                    {job.source_connection?.name ?? "—"} → {job.target_connection?.name ?? "—"}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={STATUS_VARIANT[job.status] ?? "outline"}>{job.status}</Badge>
                  </td>
                  <td className="px-6 py-4 text-gray-400">
                    {new Date(job.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

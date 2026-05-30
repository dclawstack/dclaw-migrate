"use client";

import { useEffect, useState } from "react";
import { jobsApi, MigrationJob } from "@/lib/api";
import { optimizationApi, OptimizationRec } from "@/lib/extendedApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

const PRIORITY_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  high: "destructive",
  medium: "default",
  low: "secondary",
};

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  applied: "secondary",
  dismissed: "default",
};

export default function OptimizationPage() {
  const [jobs, setJobs] = useState<MigrationJob[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [recs, setRecs] = useState<OptimizationRec[]>([]);
  const [generating, setGenerating] = useState(false);
  const [acting, setActing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    jobsApi.list(100).then((r) => setJobs(r.items)).catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (!selectedJobId) { setRecs([]); return; }
    setError(null);
    optimizationApi.list(selectedJobId).then(setRecs).catch((e) => setError(e.message));
  }, [selectedJobId]);

  async function handleGenerate() {
    setGenerating(true);
    try {
      const res = await optimizationApi.generate(selectedJobId);
      setRecs(res.recommendations);
    } catch (e: any) { setError(e.message); }
    finally { setGenerating(false); }
  }

  async function handleStatus(recId: string, status: string) {
    setActing(recId);
    try {
      const updated = await optimizationApi.updateStatus(selectedJobId, recId, status);
      setRecs((prev) => prev.map((r) => r.id === recId ? updated : r));
    } catch (e: any) { setError(e.message); }
    finally { setActing(null); }
  }

  const savings = recs
    .filter((r) => r.estimated_savings && r.status !== "dismissed")
    .map((r) => r.estimated_savings)
    .slice(0, 3);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Post-Migration Optimization</h1>
        <p className="text-sm text-gray-500 mt-1">Right-size and cost-optimize migrated resources with AI recommendations</p>
      </div>

      {error && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}<button className="ml-2 underline" onClick={() => setError(null)}>dismiss</button>
        </div>
      )}

      <div className="mb-6">
        <Label>Select Job</Label>
        <Select value={selectedJobId} onChange={(e) => setSelectedJobId(e.target.value)}>
          <option value="">— choose a migration job —</option>
          {jobs.map((j) => <option key={j.id} value={j.id}>{j.name} ({j.status})</option>)}
        </Select>
      </div>

      {selectedJobId && (
        <>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-500">{recs.length} recommendations</p>
            <Button variant="outline" onClick={handleGenerate} disabled={generating}>
              {generating ? "Analyzing…" : "✦ Generate Recommendations"}
            </Button>
          </div>

          {recs.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              No recommendations yet. Click &quot;Generate Recommendations&quot; to run AI analysis.
            </div>
          ) : (
            <div className="space-y-3">
              {recs.map((rec) => (
                <Card key={rec.id} className={rec.status === "dismissed" ? "opacity-50" : ""}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <CardTitle className="text-base">{rec.title}</CardTitle>
                        <p className="text-xs text-gray-400 mt-0.5">{rec.category}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant={PRIORITY_VARIANT[rec.priority] ?? "outline"}>{rec.priority}</Badge>
                        <Badge variant={STATUS_VARIANT[rec.status] ?? "outline"}>{rec.status}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
                    {rec.estimated_savings && (
                      <p className="text-sm font-medium text-green-600 mb-3">
                        Estimated savings: {rec.estimated_savings}
                      </p>
                    )}
                    {rec.status === "pending" && (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleStatus(rec.id, "applied")} disabled={acting === rec.id}>
                          {acting === rec.id ? "…" : "Mark Applied"}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleStatus(rec.id, "dismissed")} disabled={acting === rec.id}>
                          Dismiss
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {!selectedJobId && (
        <div className="text-center py-16 text-gray-400">Select a job above to view optimization recommendations.</div>
      )}
    </div>
  );
}

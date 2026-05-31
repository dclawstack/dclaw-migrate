"use client";

import { useEffect, useState } from "react";
import { jobsApi, MigrationJob } from "@/lib/api";
import { cutoverApi, CutoverPlan } from "@/lib/extendedApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  planned: "outline",
  "in-progress": "default",
  completed: "secondary",
  "rolled-back": "destructive",
};

export default function CutoverPage() {
  const [jobs, setJobs] = useState<MigrationJob[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [plan, setPlan] = useState<CutoverPlan | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [acting, setActing] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    jobsApi.list(100).then((r) => setJobs(r.items)).catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (!selectedJobId) { setPlan(null); setNotFound(false); return; }
    setError(null); setNotFound(false); setPlan(null);
    cutoverApi.get(selectedJobId)
      .then(setPlan)
      .catch((e) => {
        if (e.message?.includes("404")) setNotFound(true);
        else setError(e.message);
      });
  }, [selectedJobId]);

  async function handleCreate() {
    setActing(true);
    try {
      const created = await cutoverApi.create(selectedJobId, { strategy: "blue-green" });
      setPlan(created); setNotFound(false);
    } catch (e: any) { setError(e.message); }
    finally { setActing(false); }
  }

  async function handleAction(action: "execute" | "complete" | "rollback") {
    setActing(true);
    try {
      const updated = await (action === "execute"
        ? cutoverApi.execute(selectedJobId)
        : action === "complete"
        ? cutoverApi.complete(selectedJobId)
        : cutoverApi.rollback(selectedJobId));
      setPlan(updated);
    } catch (e: any) { setError(e.message); }
    finally { setActing(false); }
  }

  async function handleAiPlan() {
    setAiLoading(true); setAiSuggestion(null);
    try {
      const res = await cutoverApi.aiPlan(selectedJobId);
      setAiSuggestion(res.reply);
    } catch (e: any) { setError(e.message); }
    finally { setAiLoading(false); }
  }

  const selectedJob = jobs.find((j) => j.id === selectedJobId);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Cutover Management</h1>
        <p className="text-sm text-gray-500 mt-1">Orchestrate blue-green cutovers with 1-click rollback</p>
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

      {selectedJobId && notFound && (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-gray-500 mb-4">No cutover plan exists for <strong>{selectedJob?.name}</strong>.</p>
            <Button onClick={handleCreate} disabled={acting}>{acting ? "Creating…" : "Create Cutover Plan"}</Button>
          </CardContent>
        </Card>
      )}

      {plan && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>Cutover Plan</CardTitle>
                <Badge variant={STATUS_VARIANT[plan.status] ?? "outline"}>{plan.status}</Badge>
              </div>
              <p className="text-sm text-gray-500">Strategy: <strong>{plan.strategy}</strong></p>
            </CardHeader>
            <CardContent className="space-y-3">
              {plan.pre_checks && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Pre-checks</p>
                  <pre className="text-sm bg-gray-50 rounded p-3 whitespace-pre-wrap">{plan.pre_checks}</pre>
                </div>
              )}
              {plan.post_checks && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Post-checks</p>
                  <pre className="text-sm bg-gray-50 rounded p-3 whitespace-pre-wrap">{plan.post_checks}</pre>
                </div>
              )}
              {plan.rollback_procedure && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Rollback Procedure</p>
                  <pre className="text-sm bg-accent rounded p-3 whitespace-pre-wrap">{plan.rollback_procedure}</pre>
                </div>
              )}
              <div className="flex gap-2 pt-2 flex-wrap">
                {plan.status === "planned" && (
                  <Button onClick={() => handleAction("execute")} disabled={acting}>
                    {acting ? "…" : "Execute Cutover"}
                  </Button>
                )}
                {plan.status === "in-progress" && (
                  <>
                    <Button onClick={() => handleAction("complete")} disabled={acting}>
                      {acting ? "…" : "Complete"}
                    </Button>
                    <Button variant="destructive" onClick={() => handleAction("rollback")} disabled={acting}>
                      {acting ? "…" : "Rollback"}
                    </Button>
                  </>
                )}
                {plan.status === "completed" && (
                  <Button variant="destructive" onClick={() => handleAction("rollback")} disabled={acting}>
                    {acting ? "…" : "Rollback"}
                  </Button>
                )}
                <Button variant="outline" onClick={handleAiPlan} disabled={aiLoading}>
                  {aiLoading ? "Thinking…" : "✦ AI Plan Review"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {aiSuggestion && (
            <Card className="border-primary/30 bg-accent">
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <CardTitle className="text-primary text-base">AI Cutover Analysis</CardTitle>
                  <button className="text-xs text-primary hover:underline" onClick={() => setAiSuggestion(null)}>dismiss</button>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">{aiSuggestion}</pre>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {!selectedJobId && (
        <div className="text-center py-16 text-gray-400">Select a job above to manage its cutover.</div>
      )}
    </div>
  );
}

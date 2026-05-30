"use client";

import { useEffect, useState } from "react";
import { jobsApi, MigrationJob } from "@/lib/api";
import { runbooksApi, Runbook } from "@/lib/extendedApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

const TYPE_LABELS: Record<string, string> = {
  pre_migration: "Pre-Migration",
  migration: "Migration",
  post_migration: "Post-Migration",
  rollback: "Rollback",
  validation: "Validation",
};

export default function RunbooksPage() {
  const [jobs, setJobs] = useState<MigrationJob[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [runbooks, setRunbooks] = useState<Runbook[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [generating, setGenerating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const RUNBOOK_TYPES = ["pre_migration", "migration", "post_migration", "rollback", "validation"];

  useEffect(() => {
    jobsApi.list(100).then((r) => setJobs(r.items)).catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (!selectedJobId) { setRunbooks([]); setExpanded(null); return; }
    setError(null);
    runbooksApi.list(selectedJobId).then(setRunbooks).catch((e) => setError(e.message));
  }, [selectedJobId]);

  async function handleGenerate(type: string) {
    setGenerating(type);
    try {
      const rb = await runbooksApi.generate(selectedJobId, type);
      setRunbooks((prev) => {
        const idx = prev.findIndex((r) => r.runbook_type === type);
        return idx >= 0 ? prev.map((r, i) => i === idx ? rb : r) : [...prev, rb];
      });
      setExpanded(rb.id);
    } catch (e: any) { setError(e.message); }
    finally { setGenerating(null); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this runbook?")) return;
    try {
      await runbooksApi.remove(selectedJobId, id);
      setRunbooks((prev) => prev.filter((r) => r.id !== id));
      if (expanded === id) setExpanded(null);
    } catch (e: any) { setError(e.message); }
  }

  const existingTypes = new Set(runbooks.map((r) => r.runbook_type));

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Training & Documentation</h1>
        <p className="text-sm text-gray-500 mt-1">AI-generated runbooks, SOPs, and knowledge artifacts per migration job</p>
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
          <div className="mb-4">
            <p className="text-sm font-semibold text-gray-600 mb-2">Generate runbooks</p>
            <div className="flex flex-wrap gap-2">
              {RUNBOOK_TYPES.map((type) => (
                <Button
                  key={type}
                  size="sm"
                  variant={existingTypes.has(type) ? "secondary" : "outline"}
                  onClick={() => handleGenerate(type)}
                  disabled={generating === type}
                >
                  {generating === type ? "Generating…" : `✦ ${TYPE_LABELS[type] ?? type}`}
                </Button>
              ))}
            </div>
          </div>

          {runbooks.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              No runbooks yet. Generate one above.
            </div>
          ) : (
            <div className="space-y-3">
              {runbooks.map((rb) => (
                <Card key={rb.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-base">{rb.title}</CardTitle>
                        <Badge variant="outline">{TYPE_LABELS[rb.runbook_type] ?? rb.runbook_type}</Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setExpanded(expanded === rb.id ? null : rb.id)}>
                          {expanded === rb.id ? "Collapse" : "View"}
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(rb.id)}>Delete</Button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400">
                      Generated {new Date(rb.created_at).toLocaleDateString()}
                    </p>
                  </CardHeader>
                  {expanded === rb.id && (
                    <CardContent>
                      <pre className="text-sm text-gray-700 bg-gray-50 rounded p-4 whitespace-pre-wrap max-h-96 overflow-y-auto">
                        {rb.content}
                      </pre>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {!selectedJobId && (
        <div className="text-center py-16 text-gray-400">Select a job above to view or generate runbooks.</div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { jobsApi, MigrationJob } from "@/lib/api";
import { testCasesApi, TestCase } from "@/lib/extendedApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  passed: "secondary",
  failed: "destructive",
  skipped: "default",
};

interface RunResult {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  cases: TestCase[];
}

export default function TestingPage() {
  const [jobs, setJobs] = useState<MigrationJob[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [cases, setCases] = useState<TestCase[]>([]);
  const [runResult, setRunResult] = useState<RunResult | null>(null);
  const [generating, setGenerating] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    jobsApi.list(100).then((r) => setJobs(r.items)).catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (!selectedJobId) { setCases([]); setRunResult(null); return; }
    setError(null); setRunResult(null);
    testCasesApi.list(selectedJobId).then(setCases).catch((e) => setError(e.message));
  }, [selectedJobId]);

  async function handleGenerate() {
    setGenerating(true);
    try {
      const generated = await testCasesApi.generate(selectedJobId);
      setCases(generated);
    } catch (e: any) { setError(e.message); }
    finally { setGenerating(false); }
  }

  async function handleRun() {
    setRunning(true); setRunResult(null);
    try {
      const result = await testCasesApi.run(selectedJobId);
      setRunResult(result);
      setCases(result.cases);
    } catch (e: any) { setError(e.message); }
    finally { setRunning(false); }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Testing & Validation</h1>
        <p className="text-sm text-gray-500 mt-1">AI-generated test cases with parallel execution and regression detection</p>
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
          {runResult && (
            <div className="grid grid-cols-4 gap-4 mb-6">
              {[
                { label: "Total", value: runResult.total, color: "text-gray-800" },
                { label: "Passed", value: runResult.passed, color: "text-green-600" },
                { label: "Failed", value: runResult.failed, color: "text-red-600" },
                { label: "Skipped", value: runResult.skipped, color: "text-gray-400" },
              ].map((s) => (
                <Card key={s.label}>
                  <CardContent className="pt-4 text-center">
                    <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{s.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>Test Cases ({cases.length})</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleGenerate} disabled={generating}>
                    {generating ? "Generating…" : "✦ Generate Tests"}
                  </Button>
                  <Button onClick={handleRun} disabled={running || cases.length === 0}>
                    {running ? "Running…" : "Run All"}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {cases.length === 0 ? (
                <p className="text-center py-10 text-gray-400">No test cases yet. Generate AI tests above.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Result</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cases.map((tc) => (
                      <TableRow key={tc.id}>
                        <TableCell className="font-medium">{tc.name}</TableCell>
                        <TableCell className="text-gray-500 text-xs">{tc.test_type}</TableCell>
                        <TableCell>
                          <Badge variant={STATUS_VARIANT[tc.status] ?? "outline"}>{tc.status}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500 max-w-xs truncate">
                          {tc.error_message ?? tc.actual_result ?? "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {!selectedJobId && (
        <div className="text-center py-16 text-gray-400">Select a job above to view or generate test cases.</div>
      )}
    </div>
  );
}

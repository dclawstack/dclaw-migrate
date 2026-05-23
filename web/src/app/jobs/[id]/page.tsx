"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { jobsApi, MigrationJob } from "@/lib/api";
import { jobDetailApi, SchemaMappingRead, ExecutionLogRead, ValidationReportRead } from "@/lib/jobDetailApi";
import { testCasesApi, cutoverApi, optimizationApi, runbooksApi, TestCase, CutoverPlan, OptimizationRec, Runbook } from "@/lib/extendedApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  draft: "outline", ready: "secondary", running: "default",
  completed: "secondary", failed: "destructive", paused: "outline",
};
const LOG_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  info: "secondary", warning: "default", error: "destructive",
};
const VAL_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  passed: "secondary", failed: "destructive", partial: "default",
};
const TEST_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline", passed: "secondary", failed: "destructive", skipped: "outline",
};
const RISK_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  low: "secondary", medium: "default", high: "destructive",
};

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [job, setJob] = useState<MigrationJob | null>(null);
  const [mappings, setMappings] = useState<SchemaMappingRead[]>([]);
  const [logs, setLogs] = useState<ExecutionLogRead[]>([]);
  const [validations, setValidations] = useState<ValidationReportRead[]>([]);
  const [tests, setTests] = useState<TestCase[]>([]);
  const [cutover, setCutover] = useState<CutoverPlan | null>(null);
  const [optimizations, setOptimizations] = useState<OptimizationRec[]>([]);
  const [runbooks, setRunbooks] = useState<Runbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Action loading states
  const [discovering, setDiscovering] = useState(false);
  const [validating, setValidating] = useState(false);
  const [generatingTests, setGeneratingTests] = useState(false);
  const [runningTests, setRunningTests] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [generatingRunbook, setGeneratingRunbook] = useState(false);
  const [runbookType, setRunbookType] = useState("general");
  const [cutoverActing, setCutoverActing] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [j, m, l, v, tc, opts, rbs] = await Promise.all([
        jobsApi.get(id),
        jobDetailApi.listMappings(id),
        jobDetailApi.listLogs(id),
        jobDetailApi.listValidations(id),
        testCasesApi.list(id),
        optimizationApi.list(id),
        runbooksApi.list(id),
      ]);
      setJob(j); setMappings(m); setLogs(l); setValidations(v);
      setTests(tc); setOptimizations(opts); setRunbooks(rbs);

      // Cutover might 404 (that's fine)
      try { setCutover(await cutoverApi.get(id)); } catch { setCutover(null); }
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [id]);

  async function act(fn: () => Promise<void>, setLoading: (v: boolean) => void) {
    setLoading(true); setError(null);
    try { await fn(); await load(); }
    catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  if (loading) return <div className="p-8 text-gray-400">Loading…</div>;
  if (!job) return <div className="p-8 text-red-500">{error || "Job not found"}</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-4">
        <Link href="/jobs" className="text-sm text-amber-500 hover:underline">← Back to Jobs</Link>
      </div>

      {error && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}<button className="ml-2 underline" onClick={() => setError(null)}>dismiss</button>
        </div>
      )}

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{job.name}</h1>
          {job.description && <p className="text-gray-500 mt-1">{job.description}</p>}
        </div>
        <Badge variant={STATUS_VARIANT[job.status] ?? "outline"} className="text-sm px-3 py-1">{job.status}</Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card><CardHeader className="pb-1"><CardTitle className="text-xs text-gray-500">Type</CardTitle></CardHeader>
          <CardContent><p className="font-semibold">{job.migration_type.replace("_", " ")}</p></CardContent></Card>
        <Card><CardHeader className="pb-1"><CardTitle className="text-xs text-gray-500">Source</CardTitle></CardHeader>
          <CardContent><p className="font-semibold text-sm">{job.source_connection?.name ?? "—"}</p></CardContent></Card>
        <Card><CardHeader className="pb-1"><CardTitle className="text-xs text-gray-500">Target</CardTitle></CardHeader>
          <CardContent><p className="font-semibold text-sm">{job.target_connection?.name ?? "—"}</p></CardContent></Card>
        <Card><CardHeader className="pb-1"><CardTitle className="text-xs text-gray-500">Tables</CardTitle></CardHeader>
          <CardContent><p className="font-semibold text-amber-500">{mappings.length}</p></CardContent></Card>
      </div>

      <Tabs defaultValue="mappings">
        <TabsList className="flex-wrap">
          <TabsTrigger value="mappings">Schema ({mappings.length})</TabsTrigger>
          <TabsTrigger value="logs">Logs ({logs.length})</TabsTrigger>
          <TabsTrigger value="validation">Validation ({validations.length})</TabsTrigger>
          <TabsTrigger value="tests">Tests ({tests.length})</TabsTrigger>
          <TabsTrigger value="cutover">Cutover</TabsTrigger>
          <TabsTrigger value="optimization">Optimization ({optimizations.length})</TabsTrigger>
          <TabsTrigger value="runbooks">Runbooks ({runbooks.length})</TabsTrigger>
        </TabsList>

        {/* ── Schema Mapper ── */}
        <TabsContent value="mappings">
          <div className="flex justify-end mb-3">
            <Button variant="outline" disabled={discovering} onClick={() => act(() => jobDetailApi.discover(id).then(), setDiscovering)}>
              {discovering ? "Discovering…" : "Discover Schema"}
            </Button>
          </div>
          <div className="bg-white rounded-lg border shadow-sm">
            <Table>
              <TableHeader><TableRow>
                <TableHead>Source Table</TableHead><TableHead>Target Table</TableHead>
                <TableHead>Transform</TableHead><TableHead>Excluded</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {mappings.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-8 text-gray-400">No mappings. Click &quot;Discover Schema&quot;.</TableCell></TableRow>
                ) : mappings.map((m) => (
                  <TableRow key={m.id} className={m.is_excluded ? "opacity-40" : ""}>
                    <TableCell className="font-mono text-sm">{m.source_table}</TableCell>
                    <TableCell className="font-mono text-sm">{m.target_table}</TableCell>
                    <TableCell className="text-gray-400 text-xs">{m.transform_rule ?? "—"}</TableCell>
                    <TableCell>
                      <button onClick={() => act(async () => { await jobDetailApi.updateMapping(id, m.id, { is_excluded: !m.is_excluded }); }, () => {})}
                        className={`text-xs px-2 py-1 rounded ${m.is_excluded ? "bg-gray-100 text-gray-500" : "bg-amber-50 text-amber-600"}`}>
                        {m.is_excluded ? "Excluded" : "Include"}
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* ── Execution Log ── */}
        <TabsContent value="logs">
          <div className="bg-white rounded-lg border shadow-sm">
            <Table>
              <TableHeader><TableRow><TableHead>Level</TableHead><TableHead>Message</TableHead><TableHead>Rows</TableHead><TableHead>Time</TableHead></TableRow></TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-8 text-gray-400">No log entries.</TableCell></TableRow>
                ) : logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell><Badge variant={LOG_VARIANT[log.level] ?? "outline"}>{log.level}</Badge></TableCell>
                    <TableCell className="text-sm">{log.message}</TableCell>
                    <TableCell className="text-gray-400">{log.rows_processed ?? "—"}</TableCell>
                    <TableCell className="text-gray-400 text-xs">{new Date(log.created_at).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* ── Validation ── */}
        <TabsContent value="validation">
          <div className="flex justify-end mb-3">
            <Button disabled={validating} onClick={() => act(() => jobDetailApi.validate(id).then(), setValidating)}>
              {validating ? "Validating…" : "Run Validation"}
            </Button>
          </div>
          <div className="bg-white rounded-lg border shadow-sm">
            <Table>
              <TableHeader><TableRow><TableHead>Table</TableHead><TableHead>Source Rows</TableHead><TableHead>Target Rows</TableHead><TableHead>Match</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>
                {validations.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-gray-400">No results. Run discovery then validation.</TableCell></TableRow>
                ) : validations.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="font-mono text-sm">{v.table_name}</TableCell>
                    <TableCell>{v.source_row_count.toLocaleString()}</TableCell>
                    <TableCell>{v.target_row_count.toLocaleString()}</TableCell>
                    <TableCell>{v.checksum_match ? "✓" : "✗"}</TableCell>
                    <TableCell><Badge variant={VAL_VARIANT[v.status] ?? "outline"}>{v.status}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* ── Tests (P1.2) ── */}
        <TabsContent value="tests">
          <div className="flex justify-end gap-2 mb-3">
            <Button variant="outline" disabled={generatingTests} onClick={() => act(() => testCasesApi.generate(id).then(), setGeneratingTests)}>
              {generatingTests ? "Generating…" : "✦ Generate Tests"}
            </Button>
            <Button disabled={runningTests || tests.length === 0} onClick={() => act(() => testCasesApi.run(id).then(), setRunningTests)}>
              {runningTests ? "Running…" : "Run Tests"}
            </Button>
          </div>
          <div className="bg-white rounded-lg border shadow-sm">
            <Table>
              <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Type</TableHead><TableHead>Expected</TableHead><TableHead>Actual</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>
                {tests.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-gray-400">No tests. Click &quot;Generate Tests&quot; to create AI test cases.</TableCell></TableRow>
                ) : tests.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium text-sm">{t.name}</TableCell>
                    <TableCell className="text-gray-500 text-xs">{t.test_type}</TableCell>
                    <TableCell className="text-gray-400 text-xs truncate max-w-[150px]">{t.expected_result ?? "—"}</TableCell>
                    <TableCell className="text-gray-400 text-xs truncate max-w-[150px]">{t.actual_result ?? "—"}</TableCell>
                    <TableCell><Badge variant={TEST_VARIANT[t.status] ?? "outline"}>{t.status}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* ── Cutover (P1.3) ── */}
        <TabsContent value="cutover">
          <div className="space-y-4">
            {!cutover ? (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">No cutover plan yet.</p>
                <Button onClick={() => act(() => cutoverApi.create(id, { strategy: "blue-green" }).then(), setCutoverActing)}>
                  Create Cutover Plan
                </Button>
              </div>
            ) : (
              <>
                <div className="bg-white rounded-lg border p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-700">Cutover Plan</h3>
                    <Badge variant={STATUS_VARIANT[cutover.status] ?? "outline"}>{cutover.status}</Badge>
                  </div>
                  <p className="text-sm"><span className="text-gray-500">Strategy:</span> {cutover.strategy}</p>
                  {cutover.notes && <p className="text-sm"><span className="text-gray-500">Notes:</span> {cutover.notes}</p>}
                  {cutover.pre_checks && (
                    <div><p className="text-xs font-medium text-gray-500 mb-1">Pre-checks:</p>
                      <pre className="text-xs text-gray-700 whitespace-pre-wrap bg-gray-50 p-2 rounded">{cutover.pre_checks}</pre></div>
                  )}
                  {cutover.rollback_procedure && (
                    <div><p className="text-xs font-medium text-gray-500 mb-1">Rollback:</p>
                      <pre className="text-xs text-gray-700 whitespace-pre-wrap bg-gray-50 p-2 rounded">{cutover.rollback_procedure}</pre></div>
                  )}
                  <div className="flex gap-2 pt-2">
                    {cutover.status === "planned" && (
                      <Button size="sm" onClick={() => act(() => cutoverApi.execute(id).then(), setCutoverActing)}>Execute</Button>
                    )}
                    {cutover.status === "in-progress" && (
                      <>
                        <Button size="sm" onClick={() => act(() => cutoverApi.complete(id).then(), setCutoverActing)}>Mark Complete</Button>
                        <Button size="sm" variant="destructive" onClick={() => act(() => cutoverApi.rollback(id).then(), setCutoverActing)}>Rollback</Button>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </TabsContent>

        {/* ── Optimization (P1.4) ── */}
        <TabsContent value="optimization">
          <div className="flex justify-end mb-3">
            <Button variant="outline" disabled={optimizing} onClick={() => act(() => optimizationApi.generate(id).then(), setOptimizing)}>
              {optimizing ? "Analyzing…" : "✦ Generate Recommendations"}
            </Button>
          </div>
          <div className="space-y-3">
            {optimizations.length === 0 ? (
              <div className="text-center py-8 text-gray-400">No recommendations yet. Click &quot;Generate Recommendations&quot;.</div>
            ) : optimizations.map((rec) => (
              <div key={rec.id} className={`bg-white rounded-lg border p-4 ${rec.status === "applied" ? "opacity-60" : ""}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={RISK_VARIANT[rec.priority === "high" ? "high" : rec.priority === "low" ? "low" : "medium"] ?? "outline"}>{rec.priority}</Badge>
                      <span className="text-xs text-gray-400 uppercase">{rec.category}</span>
                      {rec.estimated_savings && <span className="text-xs text-green-600 font-medium">{rec.estimated_savings}</span>}
                    </div>
                    <p className="font-medium text-sm">{rec.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{rec.description}</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    {rec.status === "pending" && (
                      <>
                        <Button size="sm" onClick={() => act(() => optimizationApi.updateStatus(id, rec.id, "applied").then(), () => {})}>Apply</Button>
                        <Button size="sm" variant="outline" onClick={() => act(() => optimizationApi.updateStatus(id, rec.id, "dismissed").then(), () => {})}>Dismiss</Button>
                      </>
                    )}
                    {rec.status !== "pending" && <span className="text-xs text-gray-400 capitalize">{rec.status}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* ── Runbooks (P2.4) ── */}
        <TabsContent value="runbooks">
          <div className="flex justify-end gap-2 mb-3">
            <Select value={runbookType} onChange={(e) => setRunbookType(e.target.value)} className="w-48">
              {["general", "pre-migration", "cutover", "rollback", "post-migration"].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </Select>
            <Button variant="outline" disabled={generatingRunbook}
              onClick={() => act(() => runbooksApi.generate(id, runbookType).then(), setGeneratingRunbook)}>
              {generatingRunbook ? "Generating…" : "✦ Generate Runbook"}
            </Button>
          </div>
          <div className="space-y-4">
            {runbooks.length === 0 ? (
              <div className="text-center py-8 text-gray-400">No runbooks yet. Generate one with AI.</div>
            ) : runbooks.map((rb) => (
              <div key={rb.id} className="bg-white rounded-lg border shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b flex items-center justify-between bg-gray-50">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{rb.runbook_type}</Badge>
                    <span className="font-semibold text-sm">{rb.title}</span>
                  </div>
                  <Button size="sm" variant="destructive" onClick={() => act(() => runbooksApi.remove(id, rb.id), () => {})}>Delete</Button>
                </div>
                <div className="px-4 py-3 max-h-96 overflow-y-auto">
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap">{rb.content}</pre>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

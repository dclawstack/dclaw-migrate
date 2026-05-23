"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { jobsApi, connectionsApi, MigrationJob, MigrationJobCreate, Connection } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  draft: "outline",
  ready: "secondary",
  running: "default",
  completed: "secondary",
  failed: "destructive",
  paused: "outline",
};

const BLANK: MigrationJobCreate = {
  name: "",
  description: "",
  migration_type: "full_load",
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<MigrationJob[]>([]);
  const [total, setTotal] = useState(0);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<MigrationJobCreate>(BLANK);
  const [saving, setSaving] = useState(false);
  const [acting, setActing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const [jobRes, connRes] = await Promise.all([jobsApi.list(), connectionsApi.list(100)]);
      setJobs(jobRes.items);
      setTotal(jobRes.total);
      setConnections(connRes.items);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleSave() {
    setSaving(true);
    try {
      const payload = {
        ...form,
        source_connection_id: form.source_connection_id || undefined,
        target_connection_id: form.target_connection_id || undefined,
      };
      await jobsApi.create(payload);
      setOpen(false);
      setForm(BLANK);
      await load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleRun(id: string) {
    setActing(id);
    try { await jobsApi.run(id); await load(); }
    catch (e: any) { setError(e.message); }
    finally { setActing(null); }
  }

  async function handleCancel(id: string) {
    setActing(id);
    try { await jobsApi.cancel(id); await load(); }
    catch (e: any) { setError(e.message); }
    finally { setActing(null); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this job?")) return;
    try { await jobsApi.remove(id); await load(); }
    catch (e: any) { setError(e.message); }
  }

  const sources = connections.filter((c) => c.role === "source");
  const targets = connections.filter((c) => c.role === "target");

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Migration Jobs</h1>
          <p className="text-sm text-gray-500 mt-1">{total} total</p>
        </div>
        <Button onClick={() => setOpen(true)}>+ New Job</Button>
      </div>

      {error && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
          <button className="ml-2 underline" onClick={() => setError(null)}>dismiss</button>
        </div>
      )}

      <div className="bg-white rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Source → Target</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-400">Loading…</TableCell></TableRow>
            ) : jobs.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-400">No jobs yet. Create your first migration job.</TableCell></TableRow>
            ) : (
              jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-medium">
                    <Link href={`/jobs/${job.id}`} className="hover:text-amber-500 hover:underline">
                      {job.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-gray-500 text-xs">{job.migration_type.replace("_", " ")}</TableCell>
                  <TableCell className="text-gray-500 text-sm">
                    {job.source_connection?.name ?? "—"} → {job.target_connection?.name ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[job.status] ?? "outline"}>{job.status}</Badge>
                  </TableCell>
                  <TableCell className="text-gray-400 text-xs">
                    {new Date(job.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    {["draft", "ready", "paused"].includes(job.status) && (
                      <Button size="sm" disabled={acting === job.id} onClick={() => handleRun(job.id)}>Run</Button>
                    )}
                    {job.status === "running" && (
                      <Button size="sm" variant="outline" disabled={acting === job.id} onClick={() => handleCancel(job.id)}>Cancel</Button>
                    )}
                    {job.status !== "running" && (
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(job.id)}>Delete</Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>New Migration Job</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div>
              <Label>Job Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="MySQL → Postgres full load" />
            </div>
            <div>
              <Label>Description (optional)</Label>
              <Input value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <Label>Migration Type</Label>
              <Select value={form.migration_type ?? "full_load"} onChange={(e) => setForm({ ...form, migration_type: e.target.value })}>
                <option value="full_load">Full Load</option>
                <option value="cdc">CDC (Real-time)</option>
                <option value="schema_only">Schema Only</option>
              </Select>
            </div>
            <div>
              <Label>Source Connection</Label>
              <Select value={form.source_connection_id ?? ""} onChange={(e) => setForm({ ...form, source_connection_id: e.target.value || undefined })}>
                <option value="">None</option>
                {sources.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.connection_type})</option>)}
              </Select>
            </div>
            <div>
              <Label>Target Connection</Label>
              <Select value={form.target_connection_id ?? ""} onChange={(e) => setForm({ ...form, target_connection_id: e.target.value || undefined })}>
                <option value="">None</option>
                {targets.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.connection_type})</option>)}
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Create Job"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

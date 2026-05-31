"use client";

import { useEffect, useState } from "react";
import { wavesApi, MigrationWave, MigrationWaveCreate } from "@/lib/extendedApi";
import { jobsApi, MigrationJob } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

const RISK_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  low: "secondary", medium: "default", high: "destructive",
};
const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  planned: "outline", "in-progress": "default", completed: "secondary",
};

const BLANK: MigrationWaveCreate = { name: "", sequence_order: 1, risk_level: "medium" };

export default function WavesPage() {
  const [waves, setWaves] = useState<MigrationWave[]>([]);
  const [jobs, setJobs] = useState<MigrationJob[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<MigrationWaveCreate>(BLANK);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPlan, setAiPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const [w, j] = await Promise.all([wavesApi.list(), jobsApi.list(100)]);
    setWaves(w);
    setJobs(j.items);
  }

  useEffect(() => { load().catch((e) => setError(e.message)); }, []);

  async function handleCreate() {
    setSaving(true);
    try { await wavesApi.create(form); setOpen(false); setForm(BLANK); await load(); }
    catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  }

  async function handleAiPlan() {
    setAiLoading(true); setAiPlan(null);
    try {
      const res = await fetch("/api/v1/ai/plan-waves", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      setAiPlan(data.reply);
    } catch (e: any) { setError(e.message); }
    finally { setAiLoading(false); }
  }

  const unassigned = jobs.filter((j) => !j.wave_id);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Wave Planning</h1>
          <p className="text-sm text-gray-500 mt-1">{waves.length} waves · {unassigned.length} unassigned jobs</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleAiPlan} disabled={aiLoading}>
            {aiLoading ? "Planning…" : "✦ AI Wave Plan"}
          </Button>
          <Button onClick={() => setOpen(true)}>+ New Wave</Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}<button className="ml-2 underline" onClick={() => setError(null)}>dismiss</button>
        </div>
      )}

      {aiPlan && (
        <div className="mb-6 rounded-lg border border-primary/30 bg-accent p-4">
          <div className="flex justify-between mb-2">
            <p className="font-semibold text-primary">AI Wave Plan Suggestion</p>
            <button className="text-xs text-primary hover:underline" onClick={() => setAiPlan(null)}>dismiss</button>
          </div>
          <pre className="text-sm text-gray-700 whitespace-pre-wrap">{aiPlan}</pre>
        </div>
      )}

      <div className="grid gap-4 mb-8">
        {waves.length === 0 ? (
          <div className="text-center py-12 text-gray-400">No waves yet. Create your first migration wave.</div>
        ) : (
          waves.map((wave) => (
            <Card key={wave.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-primary">#{wave.sequence_order}</span>
                    <CardTitle>{wave.name}</CardTitle>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={RISK_VARIANT[wave.risk_level]}>{wave.risk_level} risk</Badge>
                    <Badge variant={STATUS_VARIANT[wave.status]}>{wave.status}</Badge>
                  </div>
                </div>
                {wave.description && <p className="text-sm text-gray-500 mt-1">{wave.description}</p>}
              </CardHeader>
              <CardContent>
                {wave.jobs.length === 0 ? (
                  <p className="text-sm text-gray-400">No jobs assigned to this wave yet.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {wave.jobs.map((j) => (
                      <span key={j.id} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        {j.name}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {unassigned.length > 0 && (
        <div className="bg-white rounded-lg border p-4">
          <p className="font-semibold text-gray-600 mb-2">Unassigned Jobs ({unassigned.length})</p>
          <div className="flex flex-wrap gap-2">
            {unassigned.map((j) => (
              <span key={j.id} className="text-xs bg-accent text-primary border border-primary/30 px-2 py-1 rounded">
                {j.name}
              </span>
            ))}
          </div>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>New Wave</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div>
              <Label>Wave Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Wave 1 — Core Databases" />
            </div>
            <div>
              <Label>Sequence Order</Label>
              <Input type="number" value={form.sequence_order} onChange={(e) => setForm({ ...form, sequence_order: Number(e.target.value) })} />
            </div>
            <div>
              <Label>Risk Level</Label>
              <Select value={form.risk_level ?? "medium"} onChange={(e) => setForm({ ...form, risk_level: e.target.value })}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </Select>
            </div>
            <div>
              <Label>Description (optional)</Label>
              <Input value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={saving}>{saving ? "Saving…" : "Create"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

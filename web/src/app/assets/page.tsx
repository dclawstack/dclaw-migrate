"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { assetsApi, ApplicationAsset, ApplicationAssetCreate } from "@/lib/extendedApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const RISK_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  low: "secondary", medium: "default", high: "destructive",
};
const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline", "in-progress": "default", completed: "secondary", retired: "outline", blocked: "destructive",
};

const BLANK: ApplicationAssetCreate = {
  name: "", asset_type: "service", migration_strategy: "lift-and-shift", risk_level: "medium",
};

export default function AssetsPage() {
  const [assets, setAssets] = useState<ApplicationAsset[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<ApplicationAssetCreate>(BLANK);
  const [saving, setSaving] = useState(false);
  const [assessing, setAssessing] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<{ id: string; reply: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await assetsApi.list();
      setAssets(res.items);
      setTotal(res.total);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function handleCreate() {
    setSaving(true);
    try { await assetsApi.create(form); setOpen(false); setForm(BLANK); await load(); }
    catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  }

  async function handleAssess(id: string) {
    setAssessing(id);
    try {
      const res = await assetsApi.assess(id);
      setAiResult({ id, reply: res.reply });
    } catch (e: any) { setError(e.message); }
    finally { setAssessing(null); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this asset?")) return;
    try { await assetsApi.remove(id); await load(); }
    catch (e: any) { setError(e.message); }
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Application Assets</h1>
          <p className="text-sm text-gray-500 mt-1">{total} assets tracked</p>
        </div>
        <Button onClick={() => setOpen(true)}>+ Add Asset</Button>
      </div>

      {error && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}<button className="ml-2 underline" onClick={() => setError(null)}>dismiss</button>
        </div>
      )}

      {aiResult && (
        <div className="mb-6 rounded-lg border border-primary/30 bg-accent p-4">
          <div className="flex justify-between mb-2">
            <p className="font-semibold text-primary">AI Assessment</p>
            <button className="text-xs text-primary" onClick={() => setAiResult(null)}>dismiss</button>
          </div>
          <pre className="text-sm text-gray-700 whitespace-pre-wrap">{aiResult.reply}</pre>
        </div>
      )}

      <div className="bg-white rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Strategy</TableHead>
              <TableHead>Effort</TableHead>
              <TableHead>Risk</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-gray-400">Loading…</TableCell></TableRow>
            ) : assets.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-gray-400">No assets yet.</TableCell></TableRow>
            ) : (
              assets.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">
                    <Link href={`/assets/${a.id}`} className="hover:text-primary hover:underline">{a.name}</Link>
                  </TableCell>
                  <TableCell className="text-gray-500">{a.asset_type}</TableCell>
                  <TableCell className="text-gray-500 text-xs">{a.migration_strategy}</TableCell>
                  <TableCell className="text-gray-400 text-xs">
                    {a.effort_estimate_days ? `${a.effort_estimate_days}d` : "—"}
                  </TableCell>
                  <TableCell><Badge variant={RISK_VARIANT[a.risk_level]}>{a.risk_level}</Badge></TableCell>
                  <TableCell><Badge variant={STATUS_VARIANT[a.status] ?? "outline"}>{a.status}</Badge></TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button size="sm" variant="outline" disabled={assessing === a.id} onClick={() => handleAssess(a.id)}>
                      {assessing === a.id ? "…" : "✦ Assess"}
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(a.id)}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Application Asset</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div>
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="User Auth Service" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Type</Label>
                <Select value={form.asset_type} onChange={(e) => setForm({ ...form, asset_type: e.target.value })}>
                  {["service", "database", "api", "frontend", "batch", "legacy", "other"].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Risk</Label>
                <Select value={form.risk_level ?? "medium"} onChange={(e) => setForm({ ...form, risk_level: e.target.value })}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </Select>
              </div>
            </div>
            <div>
              <Label>Strategy</Label>
              <Select value={form.migration_strategy ?? "lift-and-shift"} onChange={(e) => setForm({ ...form, migration_strategy: e.target.value })}>
                {["lift-and-shift", "replatform", "refactor", "replace", "retire", "retain"].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Current Host</Label>
                <Input value={form.current_host ?? ""} onChange={(e) => setForm({ ...form, current_host: e.target.value })} placeholder="on-prem-01" />
              </div>
              <div>
                <Label>Target Host</Label>
                <Input value={form.target_host ?? ""} onChange={(e) => setForm({ ...form, target_host: e.target.value })} placeholder="aws-eks" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={saving}>{saving ? "Saving…" : "Add Asset"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

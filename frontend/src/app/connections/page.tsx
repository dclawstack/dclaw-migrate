"use client";

import { useEffect, useState } from "react";
import { connectionsApi, Connection, ConnectionCreate } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  unchecked: "outline",
  ok: "secondary",
  error: "destructive",
};

const CONN_TYPES = ["postgresql", "mysql", "mongodb", "mssql", "aws_rds", "gcp_cloudsql", "azure_sql"];

const BLANK: ConnectionCreate = {
  name: "",
  connection_type: "postgresql",
  role: "source",
  host: "",
  port: 5432,
  database_name: "",
  username: "",
  password_secret: "",
  ssl_enabled: false,
};

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<ConnectionCreate>(BLANK);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await connectionsApi.list();
      setConnections(res.items);
      setTotal(res.total);
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
      await connectionsApi.create(form);
      setOpen(false);
      setForm(BLANK);
      await load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this connection?")) return;
    try {
      await connectionsApi.remove(id);
      await load();
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function handleTest(id: string) {
    setTesting(id);
    try {
      const res = await connectionsApi.test(id);
      alert(res.ok ? `Connected in ${res.latency_ms}ms` : `Failed: ${res.error}`);
      await load();
    } finally {
      setTesting(null);
    }
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Connections</h1>
          <p className="text-sm text-gray-500 mt-1">{total} total</p>
        </div>
        <Button onClick={() => setOpen(true)}>+ Add Connection</Button>
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
              <TableHead>Role</TableHead>
              <TableHead>Host</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-400">Loading…</TableCell>
              </TableRow>
            ) : connections.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                  No connections yet. Add your first one.
                </TableCell>
              </TableRow>
            ) : (
              connections.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-gray-500">{c.connection_type}</TableCell>
                  <TableCell><Badge variant="outline">{c.role}</Badge></TableCell>
                  <TableCell className="text-gray-500 font-mono text-xs">
                    {c.host}:{c.port}/{c.database_name}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[c.status]}>{c.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" disabled={testing === c.id} onClick={() => handleTest(c.id)}>
                      {testing === c.id ? "Testing…" : "Test"}
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(c.id)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Connection</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="col-span-2">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Production Postgres" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type</Label>
                <Select value={form.connection_type} onChange={(e) => setForm({ ...form, connection_type: e.target.value })}>
                  {CONN_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </Select>
              </div>
              <div>
                <Label>Role</Label>
                <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  <option value="source">Source</option>
                  <option value="target">Target</option>
                </Select>
              </div>
              <div>
                <Label>Host</Label>
                <Input value={form.host} onChange={(e) => setForm({ ...form, host: e.target.value })} placeholder="localhost" />
              </div>
              <div>
                <Label>Port</Label>
                <Input type="number" value={form.port} onChange={(e) => setForm({ ...form, port: Number(e.target.value) })} />
              </div>
              <div>
                <Label>Database</Label>
                <Input value={form.database_name} onChange={(e) => setForm({ ...form, database_name: e.target.value })} placeholder="mydb" />
              </div>
              <div>
                <Label>Username</Label>
                <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="postgres" />
              </div>
            </div>
            <div>
              <Label>Password</Label>
              <Input type="password" value={form.password_secret} onChange={(e) => setForm({ ...form, password_secret: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

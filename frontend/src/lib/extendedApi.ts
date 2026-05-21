import { api } from "@/lib/api";

// ── Waves ──────────────────────────────────────────────────────────────────────

export interface MigrationWave {
  id: string;
  name: string;
  sequence_order: number;
  description: string | null;
  status: "planned" | "in-progress" | "completed";
  risk_level: "low" | "medium" | "high";
  jobs: WaveJobSummary[];
  created_at: string;
  updated_at: string;
}

export interface WaveJobSummary {
  id: string;
  name: string;
  status: string;
  migration_type: string;
}

export interface MigrationWaveCreate {
  name: string;
  sequence_order?: number;
  description?: string;
  risk_level?: string;
}

export const wavesApi = {
  list: () => api<MigrationWave[]>("/api/v1/waves"),
  create: (data: MigrationWaveCreate) =>
    api<MigrationWave>("/api/v1/waves", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<MigrationWave>) =>
    api<MigrationWave>(`/api/v1/waves/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  remove: (id: string) => api<void>(`/api/v1/waves/${id}`, { method: "DELETE" }),
  assignJob: (waveId: string, jobId: string) =>
    api<MigrationWave>(`/api/v1/waves/${waveId}/jobs`, {
      method: "POST", body: JSON.stringify({ job_id: jobId }),
    }),
  removeJob: (waveId: string, jobId: string) =>
    api<MigrationWave>(`/api/v1/waves/${waveId}/jobs/${jobId}`, { method: "DELETE" }),
};

// ── Assets ─────────────────────────────────────────────────────────────────────

export interface ApplicationAsset {
  id: string;
  name: string;
  asset_type: string;
  migration_strategy: string;
  current_host: string | null;
  target_host: string | null;
  status: string;
  effort_estimate_days: number | null;
  risk_level: string;
  notes: string | null;
  containerization_plan: string | null;
  cloud_strategy: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApplicationAssetCreate {
  name: string;
  asset_type: string;
  migration_strategy?: string;
  current_host?: string;
  target_host?: string;
  risk_level?: string;
  effort_estimate_days?: number;
  notes?: string;
}

export const assetsApi = {
  list: (limit = 20, offset = 0) =>
    api<{ items: ApplicationAsset[]; total: number }>(`/api/v1/assets?limit=${limit}&offset=${offset}`),
  create: (data: ApplicationAssetCreate) =>
    api<ApplicationAsset>("/api/v1/assets", { method: "POST", body: JSON.stringify(data) }),
  get: (id: string) => api<ApplicationAsset>(`/api/v1/assets/${id}`),
  update: (id: string, data: Partial<ApplicationAsset>) =>
    api<ApplicationAsset>(`/api/v1/assets/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  remove: (id: string) => api<void>(`/api/v1/assets/${id}`, { method: "DELETE" }),
  assess: (id: string) =>
    api<{ reply: string }>("/api/v1/ai/assess-application", {
      method: "POST", body: JSON.stringify({ asset_id: id }),
    }),
  containerize: (id: string) =>
    api<{ reply: string }>("/api/v1/ai/containerize", {
      method: "POST", body: JSON.stringify({ asset_id: id }),
    }),
  cloudStrategy: (id: string, targetClouds?: string[]) =>
    api<{ reply: string }>("/api/v1/ai/cloud-strategy", {
      method: "POST",
      body: JSON.stringify({ asset_id: id, target_clouds: targetClouds ?? ["aws", "gcp", "azure"] }),
    }),
};

// ── Test Cases ─────────────────────────────────────────────────────────────────

export interface TestCase {
  id: string;
  job_id: string;
  name: string;
  description: string | null;
  test_type: string;
  status: "pending" | "passed" | "failed" | "skipped";
  expected_result: string | null;
  actual_result: string | null;
  error_message: string | null;
  created_at: string;
}

export const testCasesApi = {
  list: (jobId: string) => api<TestCase[]>(`/api/v1/jobs/${jobId}/test-cases`),
  generate: (jobId: string) => api<TestCase[]>(`/api/v1/jobs/${jobId}/generate-tests`, { method: "POST" }),
  run: (jobId: string) =>
    api<{ total: number; passed: number; failed: number; skipped: number; cases: TestCase[] }>(
      `/api/v1/jobs/${jobId}/run-tests`, { method: "POST" }
    ),
};

// ── Cutover ────────────────────────────────────────────────────────────────────

export interface CutoverPlan {
  id: string;
  job_id: string;
  strategy: string;
  status: string;
  planned_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  rolled_back_at: string | null;
  pre_checks: string | null;
  post_checks: string | null;
  rollback_procedure: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const cutoverApi = {
  get: (jobId: string) => api<CutoverPlan>(`/api/v1/jobs/${jobId}/cutover`),
  create: (jobId: string, data: Partial<CutoverPlan>) =>
    api<CutoverPlan>(`/api/v1/jobs/${jobId}/cutover`, { method: "POST", body: JSON.stringify(data) }),
  update: (jobId: string, data: Partial<CutoverPlan>) =>
    api<CutoverPlan>(`/api/v1/jobs/${jobId}/cutover`, { method: "PUT", body: JSON.stringify(data) }),
  execute: (jobId: string) =>
    api<CutoverPlan>(`/api/v1/jobs/${jobId}/cutover/execute`, { method: "POST" }),
  complete: (jobId: string) =>
    api<CutoverPlan>(`/api/v1/jobs/${jobId}/cutover/complete`, { method: "POST" }),
  rollback: (jobId: string) =>
    api<CutoverPlan>(`/api/v1/jobs/${jobId}/cutover/rollback`, { method: "POST" }),
  aiPlan: (jobId: string) =>
    api<{ reply: string }>("/api/v1/ai/plan-cutover", { method: "POST", body: JSON.stringify({ job_id: jobId }) }),
};

// ── Optimization ───────────────────────────────────────────────────────────────

export interface OptimizationRec {
  id: string;
  job_id: string;
  category: string;
  title: string;
  description: string;
  estimated_savings: string | null;
  priority: string;
  status: string;
  created_at: string;
}

export const optimizationApi = {
  list: (jobId: string) => api<OptimizationRec[]>(`/api/v1/jobs/${jobId}/optimizations`),
  generate: (jobId: string) =>
    api<{ generated: number; recommendations: OptimizationRec[] }>(
      `/api/v1/jobs/${jobId}/optimize`, { method: "POST" }
    ),
  updateStatus: (jobId: string, recId: string, status: string) =>
    api<OptimizationRec>(`/api/v1/jobs/${jobId}/optimizations/${recId}`, {
      method: "POST", body: JSON.stringify({ status }),
    }),
};

// ── Runbooks ───────────────────────────────────────────────────────────────────

export interface Runbook {
  id: string;
  job_id: string;
  title: string;
  runbook_type: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export const runbooksApi = {
  list: (jobId: string) => api<Runbook[]>(`/api/v1/jobs/${jobId}/runbooks`),
  create: (jobId: string, data: Partial<Runbook>) =>
    api<Runbook>(`/api/v1/jobs/${jobId}/runbooks`, { method: "POST", body: JSON.stringify(data) }),
  update: (jobId: string, id: string, data: Partial<Runbook>) =>
    api<Runbook>(`/api/v1/jobs/${jobId}/runbooks/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  remove: (jobId: string, id: string) =>
    api<void>(`/api/v1/jobs/${jobId}/runbooks/${id}`, { method: "DELETE" }),
  generate: (jobId: string, runbookType: string) =>
    api<Runbook>(`/api/v1/jobs/${jobId}/runbooks/generate`, {
      method: "POST", body: JSON.stringify({ runbook_type: runbookType }),
    }),
};

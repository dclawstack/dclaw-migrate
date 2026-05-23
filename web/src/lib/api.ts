// All API calls go through next.config.js rewrites:
//   /api/* → BACKEND_URL/api/*  (server-side, browser never sees BACKEND_URL)
// No NEXT_PUBLIC_API_URL needed; no CORS issues.
const API_BASE = "";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function fetchJson<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new ApiError(`API error ${res.status}: ${text}`, res.status);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// ── Domain types ──────────────────────────────────────────────────────────────

export interface Connection {
  id: string;
  name: string;
  connection_type: string;
  role: "source" | "target";
  host: string;
  port: number;
  database_name: string;
  username: string;
  ssl_enabled: boolean;
  status: "unchecked" | "ok" | "error";
  last_tested_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ConnectionCreate {
  name: string;
  connection_type: string;
  role: string;
  host: string;
  port: number;
  database_name: string;
  username: string;
  password_secret: string;
  ssl_enabled?: boolean;
}

export interface ConnectionSummary {
  id: string;
  name: string;
  connection_type: string;
  role: string;
}

export interface MigrationJob {
  id: string;
  name: string;
  description: string | null;
  source_connection_id: string | null;
  target_connection_id: string | null;
  source_connection: ConnectionSummary | null;
  target_connection: ConnectionSummary | null;
  migration_type: "full_load" | "cdc" | "schema_only";
  status: "draft" | "ready" | "running" | "paused" | "completed" | "failed";
  wave_id: string | null;
  scheduled_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MigrationJobCreate {
  name: string;
  description?: string;
  source_connection_id?: string;
  target_connection_id?: string;
  migration_type?: string;
  scheduled_at?: string;
}

export interface ListResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

export interface DashboardStats {
  total_connections: number;
  total_jobs: number;
  running_jobs: number;
  completed_jobs: number;
  failed_jobs: number;
  recent_jobs: MigrationJob[];
}

export interface TestResult {
  ok: boolean;
  latency_ms: number;
  error?: string;
}

// ── API functions ─────────────────────────────────────────────────────────────

export const connectionsApi = {
  list: (limit = 20, offset = 0) =>
    fetchJson<ListResponse<Connection>>(`/api/v1/connections?limit=${limit}&offset=${offset}`),
  create: (data: ConnectionCreate) =>
    fetchJson<Connection>("/api/v1/connections", { method: "POST", body: JSON.stringify(data) }),
  get: (id: string) => fetchJson<Connection>(`/api/v1/connections/${id}`),
  update: (id: string, data: Partial<ConnectionCreate>) =>
    fetchJson<Connection>(`/api/v1/connections/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  remove: (id: string) => fetchJson<void>(`/api/v1/connections/${id}`, { method: "DELETE" }),
  test: (id: string) =>
    fetchJson<TestResult>(`/api/v1/connections/${id}/test`, { method: "POST" }),
};

export const jobsApi = {
  list: (limit = 20, offset = 0) =>
    fetchJson<ListResponse<MigrationJob>>(`/api/v1/jobs?limit=${limit}&offset=${offset}`),
  create: (data: MigrationJobCreate) =>
    fetchJson<MigrationJob>("/api/v1/jobs", { method: "POST", body: JSON.stringify(data) }),
  get: (id: string) => fetchJson<MigrationJob>(`/api/v1/jobs/${id}`),
  update: (id: string, data: Partial<MigrationJobCreate>) =>
    fetchJson<MigrationJob>(`/api/v1/jobs/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  remove: (id: string) => fetchJson<void>(`/api/v1/jobs/${id}`, { method: "DELETE" }),
  run: (id: string) => fetchJson<MigrationJob>(`/api/v1/jobs/${id}/run`, { method: "POST" }),
  cancel: (id: string) => fetchJson<MigrationJob>(`/api/v1/jobs/${id}/cancel`, { method: "POST" }),
};

export const dashboardApi = {
  stats: () => fetchJson<DashboardStats>("/api/v1/dashboard"),
};

export { fetchJson as api };

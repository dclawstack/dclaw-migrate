export interface MigrationPlan {
  id: string;
  source: string;
  target: string;
  complexity_score: number;
  estimated_downtime_hours: number;
  risk_items: string[];
  cost_estimate: number;
  created_at: string;
}

export async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `/api/v1${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

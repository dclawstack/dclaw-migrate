import { api } from "@/lib/api";

export interface SchemaMappingRead {
  id: string;
  job_id: string;
  source_table: string;
  target_table: string;
  source_column: string | null;
  target_column: string | null;
  transform_rule: string | null;
  is_excluded: boolean;
  created_at: string;
  updated_at: string;
}

export interface ExecutionLogRead {
  id: string;
  job_id: string;
  level: "info" | "warning" | "error";
  message: string;
  rows_processed: number | null;
  created_at: string;
}

export interface ValidationReportRead {
  id: string;
  job_id: string;
  table_name: string;
  source_row_count: number;
  target_row_count: number;
  checksum_match: boolean;
  sample_mismatches: number;
  status: "passed" | "failed" | "partial";
  detail: string | null;
  created_at: string;
}

export interface DiscoverResponse {
  discovered: number;
  mappings: SchemaMappingRead[];
}

export interface ValidationRunResponse {
  validated_tables: number;
  passed: number;
  failed: number;
  reports: ValidationReportRead[];
}

export const jobDetailApi = {
  listMappings: (jobId: string) =>
    api<SchemaMappingRead[]>(`/api/v1/jobs/${jobId}/mappings`),

  createMapping: (jobId: string, data: Partial<SchemaMappingRead>) =>
    api<SchemaMappingRead>(`/api/v1/jobs/${jobId}/mappings`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateMapping: (jobId: string, mappingId: string, data: Partial<SchemaMappingRead>) =>
    api<SchemaMappingRead>(`/api/v1/jobs/${jobId}/mappings/${mappingId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteMapping: (jobId: string, mappingId: string) =>
    api<void>(`/api/v1/jobs/${jobId}/mappings/${mappingId}`, { method: "DELETE" }),

  discover: (jobId: string) =>
    api<DiscoverResponse>(`/api/v1/jobs/${jobId}/discover`, { method: "POST" }),

  listLogs: (jobId: string, level?: string) => {
    const qs = level ? `?level=${level}` : "";
    return api<{ items: ExecutionLogRead[]; total: number }>(`/api/v1/jobs/${jobId}/logs${qs}`)
      .then((r) => r.items);
  },

  listValidations: (jobId: string) =>
    api<ValidationReportRead[]>(`/api/v1/jobs/${jobId}/validations`),

  validate: (jobId: string) =>
    api<ValidationRunResponse>(`/api/v1/jobs/${jobId}/validate`, { method: "POST" }),
};

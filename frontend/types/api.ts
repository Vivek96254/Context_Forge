export interface Document {
  id: number;
  filename: string;
  file_path: string;
  file_hash: string;
  content_hash: string | null;
  file_size: number;
  mime_type: string;
  owner_id: number;
  access_level: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error_message: string | null;
  created_at: string;
  updated_at: string | null;
  indexed_at: string | null;
}

export interface SourceReference {
  document_id: number;
  filename: string;
  chunk_index: number;
  content: string;
  score: number;
}

export interface QueryRequest {
  query: string;
  top_k?: number;
}

export interface QueryResponse {
  query: string;
  rewritten_query: string | null;
  answer: string;
  sources: SourceReference[];
  retrieval_time_ms: number;
  generation_time_ms: number;
  confidence: number | null;
}

export interface MetricsResponse {
  window_hours: number;
  total_queries: number;
  average_latencies: {
    response_time_ms: number;
    retrieval_time_ms: number;
    generation_time_ms: number;
  };
  chunks_stats: {
    avg_retrieved: number;
    avg_after_rbac: number;
  };
  confidence_stats: {
    avg: number;
    min: number;
    max: number;
    p50: number;
  };
  provider_distribution: {
    [key: string]: number;
  };
  runtime_metrics: any;
}

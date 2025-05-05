
export interface JobHistory {
  id: string;
  job_id: string;
  start_time: string;
  end_time: string | null;
  status: 'Running' | 'Finished' | 'Failed';
  runtime_seconds: number | null;
  status_text: string | null;
  created_at: string;
  updated_at: string;
}

export interface JobHistoryWithJobDetails extends JobHistory {
  job_name?: string;
  job_type?: string;
}

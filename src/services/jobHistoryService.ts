
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export interface JobHistoryEntry {
  id: string;
  job_id: string;
  job_name?: string;
  start_time: string;
  end_time: string | null;
  status: 'Running' | 'Finished' | 'Failed';
  runtime_seconds: number | null;
  status_text: string | null;
  formatted_start_time?: string;
  formatted_end_time?: string;
  formatted_runtime?: string;
}

// Fetch job history with optional filters
export const fetchJobHistory = async (
  filters: {
    jobId?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
  } = {}
): Promise<JobHistoryEntry[]> => {
  try {
    // Start building the query
    let query = supabase
      .from('job_history')
      .select(`
        *,
        cron_jobs(name)
      `)
      .order('start_time', { ascending: false });

    // Apply filters
    if (filters.jobId) {
      query = query.eq('job_id', filters.jobId);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.startDate) {
      query = query.gte('start_time', filters.startDate.toISOString());
    }

    if (filters.endDate) {
      query = query.lte('start_time', filters.endDate.toISOString());
    }

    const { data, error } = await query;

    if (error) throw error;

    // Format the data for display
    return (data || []).map(entry => {
      const formattedEntry: JobHistoryEntry = {
        id: entry.id,
        job_id: entry.job_id,
        job_name: entry.cron_jobs?.name || 'Unknown Job',
        start_time: entry.start_time,
        end_time: entry.end_time,
        status: entry.status as 'Running' | 'Finished' | 'Failed',
        runtime_seconds: entry.runtime_seconds,
        status_text: entry.status_text,
        formatted_start_time: entry.start_time ? format(new Date(entry.start_time), 'MMM dd, yyyy HH:mm:ss') : 'N/A',
        formatted_end_time: entry.end_time ? format(new Date(entry.end_time), 'MMM dd, yyyy HH:mm:ss') : 'N/A',
        formatted_runtime: formatRuntime(entry.runtime_seconds),
      };
      return formattedEntry;
    });
  } catch (error) {
    console.error('Error fetching job history:', error);
    throw error;
  }
};

// Format runtime in a human-readable way
const formatRuntime = (seconds: number | null): string => {
  if (seconds === null) return 'Running';
  
  if (seconds < 60) {
    return `${seconds} sec`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes} min ${remainingSeconds} sec`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const remainingMinutes = Math.floor((seconds % 3600) / 60);
    return `${hours} hr ${remainingMinutes} min`;
  }
};

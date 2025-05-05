
import { supabase } from "@/lib/supabase";
import { JobHistory, JobHistoryWithJobDetails } from "@/types/JobHistory";

// Fetch job history for a specific job
export const fetchJobHistory = async (jobId: string): Promise<JobHistory[]> => {
  try {
    const { data, error } = await supabase
      .from('job_history')
      .select('*')
      .eq('job_id', jobId)
      .order('start_time', { ascending: false });

    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching job history:', error);
    throw error;
  }
};

// Fetch all job history with related job details
export const fetchAllJobHistory = async (): Promise<JobHistoryWithJobDetails[]> => {
  try {
    const { data, error } = await supabase
      .from('job_history')
      .select(`
        *,
        cron_jobs (id, name, target_type)
      `)
      .order('start_time', { ascending: false });

    if (error) throw error;
    
    // Format the response to include job name and type
    return (data || []).map(item => ({
      ...item,
      job_name: item.cron_jobs?.name || 'Unknown',
      job_type: item.cron_jobs?.target_type || 'Unknown'
    }));
  } catch (error) {
    console.error('Error fetching all job history:', error);
    throw error;
  }
};

// Create a new job history record
export const createJobHistoryRecord = async (jobId: string, status: 'Running' | 'Finished' | 'Failed', statusText?: string): Promise<JobHistory> => {
  try {
    const record = {
      job_id: jobId,
      status,
      status_text: statusText || null
    };

    const { data, error } = await supabase
      .from('job_history')
      .insert(record)
      .select()
      .single();

    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error creating job history record:', error);
    throw error;
  }
};

// Update a job history record
export const updateJobHistoryRecord = async (id: string, updates: Partial<JobHistory>): Promise<JobHistory> => {
  try {
    const { data, error } = await supabase
      .from('job_history')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error updating job history record:', error);
    throw error;
  }
};

// Get job run statistics (success rate, average runtime, etc.)
export const getJobStatistics = async (jobId: string) => {
  try {
    const { data, error } = await supabase
      .from('job_history')
      .select('*')
      .eq('job_id', jobId);

    if (error) throw error;
    
    const history = data || [];
    const totalRuns = history.length;
    const successfulRuns = history.filter(h => h.status === 'Finished').length;
    const failedRuns = history.filter(h => h.status === 'Failed').length;
    
    // Calculate average runtime for completed jobs
    const completedJobs = history.filter(h => h.runtime_seconds !== null);
    const totalRuntime = completedJobs.reduce((sum, job) => sum + (job.runtime_seconds || 0), 0);
    const averageRuntime = completedJobs.length > 0 ? totalRuntime / completedJobs.length : 0;
    
    return {
      totalRuns,
      successfulRuns,
      failedRuns,
      successRate: totalRuns > 0 ? (successfulRuns / totalRuns) * 100 : 0,
      averageRuntimeSeconds: averageRuntime,
      lastRun: history[0] || null
    };
  } catch (error) {
    console.error('Error fetching job statistics:', error);
    throw error;
  }
};

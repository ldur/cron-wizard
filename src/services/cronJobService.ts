
import { supabase } from '@/lib/supabase';
import { CronJob } from '@/types/CronJob';
import { calculateNextRun } from '@/utils/cronCalculator';

export const fetchCronJobs = async (): Promise<CronJob[]> => {
  const { data, error } = await supabase
    .from('cron_jobs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching cron jobs:', error);
    throw error;
  }

  return data.map((job) => ({
    id: job.id,
    name: job.name,
    command: job.command,
    cronExpression: job.cron_expression,
    status: job.status,
    nextRun: calculateNextRun(job.cron_expression),
  }));
};

export const createCronJob = async (job: Omit<CronJob, 'id' | 'nextRun'>): Promise<CronJob> => {
  const { data, error } = await supabase
    .from('cron_jobs')
    .insert({
      name: job.name,
      command: job.command,
      cron_expression: job.cronExpression,
      status: job.status,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating cron job:', error);
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    command: data.command,
    cronExpression: data.cron_expression,
    status: data.status,
    nextRun: calculateNextRun(data.cron_expression),
  };
};

export const updateCronJob = async (id: string, job: Partial<Omit<CronJob, 'id' | 'nextRun'>>): Promise<CronJob> => {
  const updateData: any = {};
  
  if (job.name) updateData.name = job.name;
  if (job.command) updateData.command = job.command;
  if (job.cronExpression) updateData.cron_expression = job.cronExpression;
  if (job.status) updateData.status = job.status;
  
  const { data, error } = await supabase
    .from('cron_jobs')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating cron job:', error);
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    command: data.command,
    cronExpression: data.cron_expression,
    status: data.status,
    nextRun: calculateNextRun(data.cron_expression),
  };
};

export const deleteCronJob = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('cron_jobs')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting cron job:', error);
    throw error;
  }
};

export const toggleCronJobStatus = async (id: string, currentStatus: 'active' | 'paused'): Promise<CronJob> => {
  const newStatus = currentStatus === 'active' ? 'paused' : 'active';
  
  const { data, error } = await supabase
    .from('cron_jobs')
    .update({ status: newStatus })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error toggling cron job status:', error);
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    command: data.command,
    cronExpression: data.cron_expression,
    status: data.status,
    nextRun: calculateNextRun(data.cron_expression),
  };
};

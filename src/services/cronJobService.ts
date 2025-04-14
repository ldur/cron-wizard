import { supabase } from '@/lib/supabase';
import { CronJob } from '@/types/CronJob';
import { calculateNextRun } from '@/utils/cronCalculator';

// Fetch groups
export const fetchGroups = async () => {
  const { data, error } = await supabase
    .from('schedule_groups')
    .select('*')
    .order('created_at');

  if (error) {
    console.error('Error fetching groups:', error);
    throw error;
  }

  return data;
};

export const fetchCronJobs = async (): Promise<CronJob[]> => {
  const { data, error } = await supabase
    .from('cron_jobs')
    .select(`
      *,
      schedule_groups (name)
    `)
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
    isApi: job.is_api,
    endpointName: job.endpoint_name,
    iacCode: job.iac_code,
    groupId: job.group_id,
    groupName: job.schedule_groups?.name || 'Default',
  }));
};

// Update existing CRUD methods to include group_id
export const createCronJob = async (job: Omit<CronJob, 'id' | 'nextRun'>): Promise<CronJob> => {
  const { data, error } = await supabase
    .from('cron_jobs')
    .insert({
      name: job.name,
      command: job.command,
      cron_expression: job.cronExpression,
      status: job.status,
      is_api: job.isApi,
      endpoint_name: job.endpointName,
      iac_code: job.iacCode,
      group_id: job.groupId, // Add group_id to insertion
    })
    .select(`
      *,
      schedule_groups (name)
    `)
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
    isApi: data.is_api,
    endpointName: data.endpoint_name,
    iacCode: data.iac_code,
    groupId: data.group_id,
    groupName: data.schedule_groups?.name || 'Default',
  };
};

// Update existing methods similarly to include group handling
export const updateCronJob = async (id: string, job: Partial<Omit<CronJob, 'id' | 'nextRun'>>): Promise<CronJob> => {
  const updateData: any = {};
  
  if (job.name !== undefined) updateData.name = job.name;
  if (job.command !== undefined) updateData.command = job.command;
  if (job.cronExpression !== undefined) updateData.cron_expression = job.cronExpression;
  if (job.status !== undefined) updateData.status = job.status;
  if (job.isApi !== undefined) updateData.is_api = job.isApi;
  if (job.endpointName !== undefined) updateData.endpoint_name = job.endpointName;
  if (job.iacCode !== undefined) updateData.iac_code = job.iacCode;
  if (job.groupId !== undefined) updateData.group_id = job.groupId;
  
  const { data, error } = await supabase
    .from('cron_jobs')
    .update(updateData)
    .eq('id', id)
    .select(`
      *,
      schedule_groups (name)
    `)
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
    isApi: data.is_api,
    endpointName: data.endpoint_name,
    iacCode: data.iac_code,
    groupId: data.group_id,
    groupName: data.schedule_groups?.name || 'Default',
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
    .select(`
      *,
      schedule_groups (name)
    `)
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
    isApi: data.is_api,
    endpointName: data.endpoint_name,
    iacCode: data.iac_code,
    groupId: data.group_id,
    groupName: data.schedule_groups?.name || 'Default',
  };
};

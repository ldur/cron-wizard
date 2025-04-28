
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

// Create a new group
export const createGroup = async (name: string) => {
  const { data, error } = await supabase
    .from('schedule_groups')
    .insert({ name })
    .select()
    .single();

  if (error) {
    console.error('Error creating group:', error);
    throw error;
  }

  return data;
};

// Update a group
export const updateGroup = async (id: string, name: string) => {
  const { data, error } = await supabase
    .from('schedule_groups')
    .update({ name })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating group:', error);
    throw error;
  }

  return data;
};

// Delete a group
export const deleteGroup = async (id: string) => {
  // First, reassign all jobs in this group to the default group
  const { data: defaultGroup } = await supabase
    .from('schedule_groups')
    .select('id')
    .eq('name', 'Default')
    .single();
  
  if (defaultGroup) {
    await supabase
      .from('cron_jobs')
      .update({ group_id: defaultGroup.id })
      .eq('group_id', id);
  }

  // Then delete the group
  const { error } = await supabase
    .from('schedule_groups')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting group:', error);
    throw error;
  }
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

  return data.map((job) => {
    try {
      const nextRun = calculateNextRun(job.cron_expression);
      
      return {
        id: job.id,
        name: job.name,
        command: job.command,
        cronExpression: job.cron_expression,
        status: job.status,
        nextRun: nextRun,
        isApi: job.is_api,
        endpointName: job.endpoint_name,
        iacCode: job.iac_code,
        groupId: job.group_id,
        groupName: job.schedule_groups?.name || 'Default',
        timeZone: job.time_zone,
        tags: job.tags || [],
      };
    } catch (error) {
      console.error(`Error processing job ${job.id}:`, error);
      // In case of error, return the job with current date as nextRun
      return {
        id: job.id,
        name: job.name,
        command: job.command,
        cronExpression: job.cron_expression,
        status: job.status,
        nextRun: new Date().toISOString(),
        isApi: job.is_api,
        endpointName: job.endpoint_name,
        iacCode: job.iac_code,
        groupId: job.group_id,
        groupName: job.schedule_groups?.name || 'Default',
        timeZone: job.time_zone,
        tags: job.tags || [],
      };
    }
  });
};

// Fetch default timezone from settings
export const fetchDefaultTimezone = async (): Promise<string> => {
  const { data, error } = await supabase
    .from('settings')
    .select('time_zone')
    .single();

  if (error) {
    console.error('Error fetching default timezone:', error);
    return 'Europe/Oslo'; // Fallback default
  }

  return data.time_zone;
};

// Create a new cron job - modified to explicitly include the time_zone in the insert
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
      group_id: job.groupId,
      time_zone: job.timeZone,
      tags: job.tags || [],
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
    timeZone: data.time_zone,
    tags: data.tags || [],
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
  if (job.timeZone !== undefined) updateData.time_zone = job.timeZone;
  if (job.tags !== undefined) updateData.tags = job.tags;
  
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
    timeZone: data.time_zone,
    tags: data.tags || [],
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
    timeZone: data.time_zone,
    tags: data.tags || [],
  };
};

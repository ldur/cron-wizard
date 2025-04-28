
import { supabase } from "@/lib/supabase";
import { CronJob } from "@/types/CronJob";
import { formatCronJobData } from "./cronJobFormService";

// Fetch all cron jobs
export const fetchCronJobs = async (): Promise<CronJob[]> => {
  const { data, error } = await supabase
    .from('cron_jobs')
    .select(`
      *,
      schedule_groups (
        name
      )
    `);
  
  if (error) throw error;
  
  return data.map(formatCronJobData);
};

// Fetch a single cron job by ID
export const fetchCronJobById = async (id: string): Promise<CronJob> => {
  const { data, error } = await supabase
    .from('cron_jobs')
    .select(`
      *,
      schedule_groups (
        name
      )
    `)
    .eq('id', id)
    .single();
  
  if (error) throw error;
  
  return formatCronJobData(data);
};

// Create a new cron job
export const createCronJob = async (job: Omit<CronJob, "id" | "nextRun">): Promise<CronJob> => {
  const newJob = {
    name: job.name,
    description: job.description,
    schedule_expression: job.scheduleExpression,
    start_time: job.startTime,
    end_time: job.endTime,
    status: job.status,
    is_api: job.isApi,
    endpoint_name: job.endpointName,
    iac_code: job.iacCode,
    group_id: job.groupId,
    timezone: job.timezone,
    tags: job.tags || [],
    flexible_time_window_mode: job.flexibleTimeWindowMode,
    flexible_window_minutes: job.flexibleWindowMinutes,
    command: job.scheduleExpression,
    target_type: job.targetType,
  };

  const { data, error } = await supabase
    .from('cron_jobs')
    .insert([newJob])
    .select()
    .single();
  
  if (error) throw error;
  
  return fetchCronJobById(data.id);
};

// Update an existing cron job
export const updateCronJob = async (
  id: string, 
  job: Partial<Omit<CronJob, "id" | "nextRun">>
): Promise<CronJob> => {
  const updateData = {
    ...(job.name && { name: job.name }),
    ...(job.description !== undefined && { description: job.description }),
    ...(job.scheduleExpression && { schedule_expression: job.scheduleExpression }),
    ...(job.scheduleExpression && { command: job.scheduleExpression }),
    ...(job.startTime !== undefined && { start_time: job.startTime }),
    ...(job.endTime !== undefined && { end_time: job.endTime }),
    ...(job.status && { status: job.status }),
    ...(job.isApi !== undefined && { is_api: job.isApi }),
    ...(job.endpointName !== undefined && { endpoint_name: job.endpointName }),
    ...(job.iacCode !== undefined && { iac_code: job.iacCode }),
    ...(job.groupId && { group_id: job.groupId }),
    ...(job.timezone && { timezone: job.timezone }),
    ...(job.tags && { tags: job.tags }),
    ...(job.flexibleTimeWindowMode && { flexible_time_window_mode: job.flexibleTimeWindowMode }),
    ...(job.flexibleWindowMinutes !== undefined && { flexible_window_minutes: job.flexibleWindowMinutes }),
    ...(job.targetType && { target_type: job.targetType }),
  };

  const { error } = await supabase
    .from('cron_jobs')
    .update(updateData)
    .eq('id', id);
  
  if (error) throw error;
  
  // Return the updated cron job with fresh data
  return fetchCronJobById(id);
};

// Delete a cron job
export const deleteCronJob = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('cron_jobs')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// Toggle the status of a cron job (active/paused)
export const toggleCronJobStatus = async (id: string, currentStatus: 'active' | 'paused'): Promise<CronJob> => {
  const newStatus = currentStatus === 'active' ? 'paused' : 'active';
  
  const { error } = await supabase
    .from('cron_jobs')
    .update({ status: newStatus })
    .eq('id', id);
  
  if (error) throw error;
  
  // Return the updated cron job
  return fetchCronJobById(id);
};

// Fetch all job groups
export const fetchGroups = async () => {
  const { data, error } = await supabase
    .from('schedule_groups')
    .select('*')
    .order('name');
  
  if (error) throw error;
  
  return data;
};

// Create a new group
export const createGroup = async (name: string) => {
  const { data, error } = await supabase
    .from('schedule_groups')
    .insert([{ name }])
    .select()
    .single();
  
  if (error) throw error;
  
  return data;
};

// Update an existing group
export const updateGroup = async (id: string, name: string) => {
  const { data, error } = await supabase
    .from('schedule_groups')
    .update({ name })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  
  return data;
};

// Delete a group and move all jobs to Default group
export const deleteGroup = async (id: string) => {
  // Find Default group id
  const { data: defaultGroup, error: findError } = await supabase
    .from('schedule_groups')
    .select('id')
    .eq('name', 'Default')
    .single();
  
  if (findError) throw findError;
  
  // Update all jobs in the deleted group to use the Default group
  const { error: updateError } = await supabase
    .from('cron_jobs')
    .update({ group_id: defaultGroup.id })
    .eq('group_id', id);
  
  if (updateError) throw updateError;
  
  // Now delete the group
  const { error: deleteError } = await supabase
    .from('schedule_groups')
    .delete()
    .eq('id', id);
  
  if (deleteError) throw deleteError;
  
  return { success: true };
};


import { supabase } from "@/integrations/supabase/client";
import { CronJob } from "@/types/CronJob";
import { v4 as uuidv4 } from 'uuid';
import { calculateNextRun } from "@/utils/cronCalculator";

// Fetch all cron jobs
export const fetchCronJobs = async (): Promise<CronJob[]> => {
  try {
    const { data: jobs, error } = await supabase
      .from('cron_jobs')
      .select('*, schedule_groups(name, icon_name)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return jobs.map(job => formatCronJobData(job));
  } catch (error) {
    console.error('Error fetching cron jobs:', error);
    throw error;
  }
};

// Fetch all groups
export const fetchGroups = async (): Promise<any[]> => {
  try {
    const { data: groups, error } = await supabase
      .from('schedule_groups')
      .select('*')
      .order('name');

    if (error) throw error;

    return groups || [];
  } catch (error) {
    console.error('Error fetching groups:', error);
    throw error;
  }
};

// Create a new group
export const createGroup = async (name: string, iconName: string): Promise<any> => {
  try {
    const { data, error } = await supabase
      .from('schedule_groups')
      .insert({
        name,
        icon_name: iconName
      })
      .select('*')
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error creating group:', error);
    throw error;
  }
};

// Update an existing group
export const updateGroup = async (id: string, name: string, iconName: string): Promise<any> => {
  try {
    const { data, error } = await supabase
      .from('schedule_groups')
      .update({
        name,
        icon_name: iconName
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error updating group:', error);
    throw error;
  }
};

// Delete a group
export const deleteGroup = async (id: string): Promise<void> => {
  try {
    // First update any jobs in the group to use the default group
    const defaultGroup = 'eee2c3ea-8ef7-4e52-b96d-adc41b790367'; // Default group ID
    await supabase
      .from('cron_jobs')
      .update({ group_id: defaultGroup })
      .eq('group_id', id);

    // Then delete the group
    const { error } = await supabase
      .from('schedule_groups')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting group:', error);
    throw error;
  }
};

// Create a new cron job
export const createCronJob = async (jobData: Omit<CronJob, 'id' | 'nextRun'>): Promise<CronJob> => {
  try {
    const { data, error } = await supabase
      .from('cron_jobs')
      .insert(convertToDbFormat(jobData))
      .select('*, schedule_groups(name, icon_name)')
      .single();

    if (error) throw error;

    return formatCronJobData(data);
  } catch (error) {
    console.error('Error creating cron job:', error);
    throw error;
  }
};

// Update an existing cron job
export const updateCronJob = async (id: string, jobData: Partial<Omit<CronJob, 'id' | 'nextRun'>>): Promise<CronJob> => {
  try {
    const { data, error } = await supabase
      .from('cron_jobs')
      .update(convertToDbFormat(jobData))
      .eq('id', id)
      .select('*, schedule_groups(name, icon_name)')
      .single();

    if (error) throw error;

    return formatCronJobData(data);
  } catch (error) {
    console.error('Error updating cron job:', error);
    throw error;
  }
};

// Submit a cron job (create or update)
export const submitCronJob = async (values: any, isUpdate: boolean): Promise<void> => {
  const jobId = values.id || uuidv4();
  
  // Handle targetConfig - ensure it's always a valid object
  let targetConfig = values.targetConfig || {};
  
  // If targetConfig is a string, try to parse it as JSON or create an empty object
  if (typeof targetConfig === 'string') {
    try {
      targetConfig = JSON.parse(targetConfig);
    } catch (e) {
      // If parsing fails, create an object with a single property
      targetConfig = { value: targetConfig };
    }
  }
  
  // Generic cron job data
  const cronJobData = {
    id: jobId,
    name: values.name,
    description: values.description,
    schedule_expression: values.scheduleExpression,
    start_time: values.startTime?.toISOString() || null,
    end_time: values.endTime?.toISOString() || null,
    status: values.status as 'active' | 'paused',
    is_api: values.isApi,
    endpoint_name: values.endpointName,
    iac_code: values.iacCode,
    sdk_code: values.sdkCode,
    group_id: values.groupId,
    timezone: values.timezone,
    tags: values.tags || [],
    flexible_time_window_mode: values.flexibleTimeWindowMode,
    flexible_window_minutes: values.flexibleWindowMinutes,
    command: values.scheduleExpression, // Required by database schema
    target_type: values.targetType,
    target_config: targetConfig,
  };

  console.log("Submitting cron job with data:", cronJobData);

  try {
    if (isUpdate) {
      const { error } = await supabase
        .from('cron_jobs')
        .update(cronJobData)
        .eq('id', jobId);
      
      if (error) {
        console.error("Error updating cron job:", error);
        throw error;
      }
    } else {
      const { error } = await supabase
        .from('cron_jobs')
        .insert(cronJobData);
      
      if (error) {
        console.error("Error creating cron job:", error);
        throw error;
      }
    }
  } catch (error) {
    console.error("Database operation failed:", error);
    throw error;
  }
};

// Helper function to convert CronJob object to database format
const convertToDbFormat = (job: Partial<CronJob>): any => {
  // Ensure targetConfig is an object
  let targetConfig = job.targetConfig || {};
  
  return {
    ...(job.name !== undefined && { name: job.name }),
    ...(job.description !== undefined && { description: job.description }),
    ...(job.scheduleExpression !== undefined && { 
      schedule_expression: job.scheduleExpression,
      command: job.scheduleExpression, // Required by database schema
    }),
    ...(job.startTime !== undefined && { start_time: job.startTime }),
    ...(job.endTime !== undefined && { end_time: job.endTime }),
    ...(job.status !== undefined && { status: job.status }),
    ...(job.isApi !== undefined && { is_api: job.isApi }),
    ...(job.endpointName !== undefined && { endpoint_name: job.endpointName }),
    ...(job.iacCode !== undefined && { iac_code: job.iacCode }),
    ...(job.sdkCode !== undefined && { sdk_code: job.sdkCode }),
    ...(job.groupId !== undefined && { group_id: job.groupId }),
    ...(job.timezone !== undefined && { timezone: job.timezone }),
    ...(job.tags !== undefined && { tags: job.tags }),
    ...(job.flexibleTimeWindowMode !== undefined && { 
      flexible_time_window_mode: job.flexibleTimeWindowMode 
    }),
    ...(job.flexibleWindowMinutes !== undefined && { 
      flexible_window_minutes: job.flexibleWindowMinutes 
    }),
    ...(job.targetType !== undefined && { target_type: job.targetType }),
    ...(job.targetConfig !== undefined && { target_config: targetConfig }),
  };
};

export const formatCronJobData = (data: any): CronJob & { nextRun: string } => {
  const nextRun = calculateNextRun(data.schedule_expression);
  
  // Extract group name and icon from the joined schedule_groups table
  const groupName = data.schedule_groups?.name || 'Default';
  const groupIcon = data.schedule_groups?.icon_name || 'folder';
  
  // Ensure we have safe default values
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    scheduleExpression: data.schedule_expression,
    startTime: data.start_time,
    endTime: data.end_time,
    status: data.status,
    isApi: data.is_api,
    endpointName: data.endpoint_name,
    iacCode: data.iac_code,
    sdkCode: data.sdk_code,
    groupId: data.group_id,
    groupName: groupName,
    groupIcon: groupIcon,
    timezone: data.timezone,
    tags: data.tags || [],
    flexibleTimeWindowMode: data.flexible_time_window_mode,
    flexibleWindowMinutes: data.flexible_window_minutes,
    targetType: data.target_type,
    targetConfig: data.target_config || {},
    nextRun: nextRun
  };
};

// Restore the deleteCronJob function
export const deleteCronJob = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('cron_jobs')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting cron job:', error);
    throw error;
  }
};

// Fix the toggleCronJobStatus function
export const toggleCronJobStatus = async (id: string, status: 'active' | 'paused'): Promise<CronJob> => {
  try {
    // First, get the existing job
    const { data: existingJob, error: fetchError } = await supabase
      .from('cron_jobs')
      .select('*, schedule_groups(name, icon_name)')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;
    if (!existingJob) throw new Error("Cron job not found");

    // Update the job status
    const { data: updatedJobs, error: updateError } = await supabase
      .from('cron_jobs')
      .update({ status })
      .eq('id', id)
      .select('*, schedule_groups(name, icon_name)');

    if (updateError) throw updateError;

    const updatedJob = updatedJobs?.[0] || existingJob;
    
    // Format the job data before returning it
    return formatCronJobData(updatedJob);
  } catch (error) {
    console.error('Error toggling cron job status:', error);
    throw error;
  }
};

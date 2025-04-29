
import { supabase } from "@/integrations/supabase/client";
import { CronJob } from "@/types/CronJob";
import { v4 as uuidv4 } from 'uuid';
import { calculateNextRun } from "@/utils/cronCalculator";

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
    status: values.status,
    is_api: values.isApi,
    endpoint_name: values.endpointName,
    iac_code: values.iacCode,
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

export const formatCronJobData = (data: any): CronJob & { nextRun: string } => {
  const nextRun = calculateNextRun(data.schedule_expression);
  
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
    groupId: data.group_id,
    // Use fallback values for group-related fields
    groupName: data.schedule_groups?.name || 'Default',
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
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;
    if (!existingJob) throw new Error("Cron job not found");

    // Update the job status
    const { data: updatedJobs, error: updateError } = await supabase
      .from('cron_jobs')
      .update({ status })
      .eq('id', id)
      .select('*');

    if (updateError) throw updateError;

    const updatedJob = updatedJobs?.[0] || existingJob;
    
    // If we have the updated job data, return it
    if (updatedJob) {
      return {
        id: updatedJob.id,
        name: updatedJob.name,
        description: updatedJob.description,
        scheduleExpression: updatedJob.schedule_expression,
        startTime: updatedJob.start_time,
        endTime: updatedJob.end_time,
        status: updatedJob.status,
        isApi: updatedJob.is_api,
        endpointName: updatedJob.endpoint_name,
        iacCode: updatedJob.iac_code,
        groupId: updatedJob.group_id,
        groupName: updatedJob.schedule_groups?.name || 'Default',
        timezone: updatedJob.timezone,
        tags: updatedJob.tags || [],
        flexibleTimeWindowMode: updatedJob.flexible_time_window_mode,
        flexibleWindowMinutes: updatedJob.flexible_window_minutes,
        targetType: updatedJob.target_type,
        targetConfig: updatedJob.target_config || {},
      };
    }
    
    // Fall back to the existing job with the updated status
    return {
      id: existingJob.id,
      name: existingJob.name,
      description: existingJob.description,
      scheduleExpression: existingJob.schedule_expression,
      startTime: existingJob.start_time,
      endTime: existingJob.end_time,
      status: status, // Use the new status
      isApi: existingJob.is_api,
      endpointName: existingJob.endpoint_name,
      iacCode: existingJob.iac_code,
      groupId: existingJob.group_id,
      groupName: existingJob.schedule_groups?.name || 'Default',
      timezone: existingJob.timezone,
      tags: existingJob.tags || [],
      flexibleTimeWindowMode: existingJob.flexible_time_window_mode,
      flexibleWindowMinutes: existingJob.flexible_window_minutes,
      targetType: existingJob.target_type,
      targetConfig: existingJob.target_config || {},
    };
  } catch (error) {
    console.error('Error toggling cron job status:', error);
    throw error;
  }
};

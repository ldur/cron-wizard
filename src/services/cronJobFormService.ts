
import { supabase } from "@/integrations/supabase/client";
import { CronJob } from "@/types/CronJob";
import { v4 as uuidv4 } from 'uuid';
import { calculateNextRun } from "@/utils/cronCalculator";

// Submit a cron job (create or update)
export const submitCronJob = async (values: any, isUpdate: boolean): Promise<void> => {
  const jobId = values.id || uuidv4();
  
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
    sdk_code: values.sdkCode,
    group_id: values.groupId,
    timezone: values.timezone,
    tags: values.tags || [],
    flexible_time_window_mode: values.flexibleTimeWindowMode,
    flexible_window_minutes: values.flexibleWindowMinutes,
    command: values.scheduleExpression, // Required by database schema
    target_type: values.targetType,
    target_config: values.targetConfig || {},
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

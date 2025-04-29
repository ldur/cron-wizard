
import { supabase } from "@/integrations/supabase/client";
import { CronJob } from "@/types/CronJob";

export const fetchCronJobs = async (): Promise<CronJob[]> => {
  try {
    const { data: jobsData, error: jobsError } = await supabase
      .from('cron_jobs')
      .select('*, schedule_groups(name, icon_name)');

    if (jobsError) throw jobsError;

    // Map the data to CronJob type
    const jobs = jobsData.map((job: any) => {
      return {
        id: job.id,
        name: job.name,
        description: job.description,
        scheduleExpression: job.schedule_expression,
        startTime: job.start_time,
        endTime: job.end_time,
        status: job.status as 'active' | 'paused',
        isApi: job.is_api,
        endpointName: job.endpoint_name,
        iacCode: job.iac_code,
        groupId: job.group_id,
        groupName: job.schedule_groups ? job.schedule_groups.name : 'Default',
        groupIcon: job.schedule_groups ? job.schedule_groups.icon_name : 'briefcase',
        timezone: job.timezone,
        tags: job.tags || [],
        flexibleTimeWindowMode: job.flexible_time_window_mode,
        flexibleWindowMinutes: job.flexible_window_minutes,
        targetType: job.target_type,
        targetConfig: job.target_config || {},
      };
    });

    return jobs;
  } catch (error) {
    console.error('Error fetching cron jobs:', error);
    throw error;
  }
};

export const createCronJob = async (job: Omit<CronJob, 'id' | 'nextRun'>): Promise<CronJob> => {
  try {
    // Convert from TypeScript CronJob type to database format (snake_case)
    const dbJob = {
      name: job.name,
      description: job.description,
      schedule_expression: job.scheduleExpression,
      start_time: job.startTime,
      end_time: job.endTime,
      status: job.status as 'active' | 'paused', // Explicit casting for type safety
      is_api: job.isApi,
      endpoint_name: job.endpointName,
      iac_code: job.iacCode,
      group_id: job.groupId,
      timezone: job.timezone,
      tags: job.tags || [],
      flexible_time_window_mode: job.flexibleTimeWindowMode,
      flexible_window_minutes: job.flexibleWindowMinutes,
      target_type: job.targetType,
      target_config: job.targetConfig ? (typeof job.targetConfig === 'object' ? job.targetConfig : {}) : {}, // Ensure it's always an object
      command: job.scheduleExpression, // Required by database schema
    };

    const { data, error } = await supabase
      .from('cron_jobs')
      .insert([dbJob])
      .select('*')
      .single();

    if (error) throw error;
    
    // Convert database response back to CronJob type
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      scheduleExpression: data.schedule_expression,
      startTime: data.start_time,
      endTime: data.end_time,
      status: data.status as 'active' | 'paused',
      isApi: data.is_api,
      endpointName: data.endpoint_name,
      iacCode: data.iac_code,
      groupId: data.group_id,
      groupName: job.groupName,
      groupIcon: job.groupIcon,
      timezone: data.timezone,
      tags: data.tags || [],
      flexibleTimeWindowMode: data.flexible_time_window_mode,
      flexibleWindowMinutes: data.flexible_window_minutes,
      targetType: data.target_type,
      targetConfig: data.target_config ? (typeof data.target_config === 'object' ? data.target_config : {}) : {},
    };
  } catch (error) {
    console.error('Error creating cron job:', error);
    throw error;
  }
};

export const updateCronJob = async (id: string, job: Partial<Omit<CronJob, 'id' | 'nextRun'>>): Promise<CronJob> => {
  try {
    // Convert from TypeScript CronJob type to database format (snake_case)
    const dbJob: any = {};
    
    // Only map fields that are provided
    if (job.name !== undefined) dbJob.name = job.name;
    if (job.description !== undefined) dbJob.description = job.description;
    if (job.scheduleExpression !== undefined) {
      dbJob.schedule_expression = job.scheduleExpression;
      dbJob.command = job.scheduleExpression; // Also update command field
    }
    if (job.startTime !== undefined) dbJob.start_time = job.startTime;
    if (job.endTime !== undefined) dbJob.end_time = job.endTime;
    if (job.status !== undefined) dbJob.status = job.status as 'active' | 'paused';
    if (job.isApi !== undefined) dbJob.is_api = job.isApi;
    if (job.endpointName !== undefined) dbJob.endpoint_name = job.endpointName;
    if (job.iacCode !== undefined) dbJob.iac_code = job.iacCode;
    if (job.groupId !== undefined) dbJob.group_id = job.groupId;
    if (job.timezone !== undefined) dbJob.timezone = job.timezone;
    if (job.tags !== undefined) dbJob.tags = job.tags;
    if (job.flexibleTimeWindowMode !== undefined) dbJob.flexible_time_window_mode = job.flexibleTimeWindowMode;
    if (job.flexibleWindowMinutes !== undefined) dbJob.flexible_window_minutes = job.flexibleWindowMinutes;
    if (job.targetType !== undefined) dbJob.target_type = job.targetType;
    if (job.targetConfig !== undefined) {
      // Ensure targetConfig is always an object
      dbJob.target_config = typeof job.targetConfig === 'object' ? job.targetConfig : {};
    }

    const { data, error } = await supabase
      .from('cron_jobs')
      .update(dbJob)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    
    // Convert database response back to CronJob type with proper type casting
    const result: CronJob = {
      id: data.id,
      name: data.name,
      description: data.description,
      scheduleExpression: data.schedule_expression,
      startTime: data.start_time,
      endTime: data.end_time,
      status: data.status as 'active' | 'paused',
      isApi: data.is_api,
      endpointName: data.endpoint_name,
      iacCode: data.iac_code,
      groupId: data.group_id,
      groupName: job.groupName || '',
      groupIcon: job.groupIcon || '',
      timezone: data.timezone,
      tags: data.tags || [],
      flexibleTimeWindowMode: data.flexible_time_window_mode,
      flexibleWindowMinutes: data.flexible_window_minutes,
      targetType: data.target_type,
      targetConfig: data.target_config ? (typeof data.target_config === 'object' ? data.target_config : {}) : {},
    };
    return result;
  } catch (error) {
    console.error('Error updating cron job:', error);
    throw error;
  }
};

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

export const toggleCronJobStatus = async (id: string, status: 'active' | 'paused'): Promise<CronJob> => {
  try {
    const { data, error } = await supabase
      .from('cron_jobs')
      .update({ status })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    
    // Convert database response to CronJob type
    const result: CronJob = {
      id: data.id,
      name: data.name,
      description: data.description || '',
      scheduleExpression: data.schedule_expression,
      startTime: data.start_time,
      endTime: data.end_time,
      status: data.status as 'active' | 'paused',
      isApi: data.is_api,
      endpointName: data.endpoint_name,
      iacCode: data.iac_code,
      groupId: data.group_id,
      timezone: data.timezone,
      tags: data.tags || [],
      flexibleTimeWindowMode: data.flexible_time_window_mode,
      flexibleWindowMinutes: data.flexible_window_minutes,
      targetType: data.target_type,
      targetConfig: data.target_config ? (typeof data.target_config === 'object' ? data.target_config : {}) : {},
    };
    
    return result;
  } catch (error) {
    console.error('Error toggling cron job status:', error);
    throw error;
  }
};

export const fetchGroups = async (): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('schedule_groups')
      .select('*');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching groups:', error);
    throw error;
  }
};

export const createGroup = async (name: string, iconName: string = 'folder'): Promise<any> => {
  try {
    const { data, error } = await supabase
      .from('schedule_groups')
      .insert([{ name, icon_name: iconName }])
      .select('*')
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating group:', error);
    throw error;
  }
};

export const updateGroup = async (id: string, name: string, iconName: string): Promise<any> => {
  try {
    const { data, error } = await supabase
      .from('schedule_groups')
      .update({ name, icon_name: iconName })
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

export const deleteGroup = async (id: string): Promise<void> => {
  try {
    // First, move all jobs from the deleting group to the Default group
    const { data: defaultGroup, error: defaultGroupError } = await supabase
      .from('schedule_groups')
      .select('id')
      .eq('name', 'Default')
      .single();

    if (defaultGroupError) {
      console.error('Error fetching Default group:', defaultGroupError);
      throw defaultGroupError;
    }

    if (!defaultGroup) {
      throw new Error('Default group not found');
    }

    const { error: updateError } = await supabase
      .from('cron_jobs')
      .update({ group_id: defaultGroup.id })
      .eq('group_id', id);

    if (updateError) {
      console.error('Error moving jobs to Default group:', updateError);
      throw updateError;
    }

    // Then, delete the group
    const { error: deleteError } = await supabase
      .from('schedule_groups')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting group:', deleteError);
      throw deleteError;
    }
  } catch (error) {
    console.error('Error deleting group:', error);
    throw error;
  }
};

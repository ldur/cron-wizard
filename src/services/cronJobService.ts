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
      // Ensure targetConfig is always an object
      let targetConfig: Record<string, any> = {};
      if (job.target_config) {
        if (typeof job.target_config === 'object' && job.target_config !== null) {
          targetConfig = job.target_config;
        } else {
          console.warn(`Invalid targetConfig format for job ${job.id}, defaulting to empty object`);
        }
      }

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
        targetConfig: targetConfig
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
    // Ensure target_config is an object
    const targetConfig: Record<string, any> = 
      job.targetConfig && typeof job.targetConfig === 'object' ? job.targetConfig : {};
    
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
      target_config: targetConfig, // Use our sanitized object
      command: job.scheduleExpression, // Required by database schema
    };

    const { data, error } = await supabase
      .from('cron_jobs')
      .insert([dbJob])
      .select('*')
      .single();

    if (error) throw error;
    
    // Ensure targetConfig from the response is an object
    let responseTargetConfig: Record<string, any> = {};
    if (data.target_config && typeof data.target_config === 'object') {
      responseTargetConfig = data.target_config;
    }
    
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
      targetConfig: responseTargetConfig,
    };
  } catch (error) {
    console.error('Error creating cron job:', error);
    throw error;
  }
};

// Modified updateCronJob function
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
    
    // Handle targetConfig properly
    if (job.targetConfig !== undefined) {
      // Ensure targetConfig is always an object
      dbJob.target_config = 
        typeof job.targetConfig === 'object' && job.targetConfig !== null ? job.targetConfig : {};
    }

    // Add logging for debugging
    console.log('Updating job with ID:', id);
    console.log('Update payload:', dbJob);

    // First check if the job exists
    const { data: existingJob, error: checkError } = await supabase
      .from('cron_jobs')
      .select('*')  // Select all fields to get current job data
      .eq('id', id)
      .single();
      
    if (checkError) {
      console.error('Error checking if job exists:', checkError);
      throw new Error(`Job with ID ${id} not found`);
    }

    // If job exists but no changes were requested, return the existing job
    if (Object.keys(dbJob).length === 0) {
      // Convert the existingJob to CronJob type
      return {
        id: existingJob.id,
        name: existingJob.name,
        description: existingJob.description || '',
        scheduleExpression: existingJob.schedule_expression,
        startTime: existingJob.start_time,
        endTime: existingJob.end_time,
        status: existingJob.status as 'active' | 'paused',
        isApi: existingJob.is_api,
        endpointName: existingJob.endpoint_name,
        iacCode: existingJob.iac_code,
        groupId: existingJob.group_id,
        // Use the groupName and groupIcon from the job parameter if available
        groupName: job.groupName || '',
        groupIcon: job.groupIcon || '',
        timezone: existingJob.timezone,
        tags: existingJob.tags || [],
        flexibleTimeWindowMode: existingJob.flexible_time_window_mode,
        flexibleWindowMinutes: existingJob.flexible_window_minutes,
        targetType: existingJob.target_type,
        targetConfig: existingJob.target_config || {},
      };
    }

    // Make the update request
    const { data, error } = await supabase
      .from('cron_jobs')
      .update(dbJob)
      .eq('id', id)
      .select();

    if (error) {
      console.error('Supabase update error:', error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.warn('No data returned from update operation, using existing job data');
      // Use the existing job data combined with the updates
      const updatedJob = {
        ...existingJob,
        ...dbJob,
        // Convert snake_case back to camelCase for response
        schedule_expression: dbJob.schedule_expression || existingJob.schedule_expression,
        start_time: dbJob.start_time || existingJob.start_time,
        end_time: dbJob.end_time || existingJob.end_time,
        is_api: dbJob.is_api !== undefined ? dbJob.is_api : existingJob.is_api,
        endpoint_name: dbJob.endpoint_name || existingJob.endpoint_name,
        iac_code: dbJob.iac_code || existingJob.iac_code,
        group_id: dbJob.group_id || existingJob.group_id,
        target_config: dbJob.target_config || existingJob.target_config || {},
      };
      
      // Convert database response back to CronJob type
      const result: CronJob = {
        id: updatedJob.id,
        name: updatedJob.name,
        description: updatedJob.description || '',
        scheduleExpression: updatedJob.schedule_expression,
        startTime: updatedJob.start_time,
        endTime: updatedJob.end_time,
        status: updatedJob.status as 'active' | 'paused',
        isApi: updatedJob.is_api,
        endpointName: updatedJob.endpoint_name,
        iacCode: updatedJob.iac_code,
        groupId: updatedJob.group_id,
        groupName: job.groupName || existingJob.group_name || '',
        groupIcon: job.groupIcon || existingJob.group_icon || '',
        timezone: updatedJob.timezone,
        tags: updatedJob.tags || [],
        flexibleTimeWindowMode: updatedJob.flexible_time_window_mode,
        flexibleWindowMinutes: updatedJob.flexible_window_minutes,
        targetType: updatedJob.target_type,
        targetConfig: updatedJob.target_config || {},
      };
      return result;
    }
    
    const updatedJob = data[0];
    
    // Ensure targetConfig is an object for the result
    let resultTargetConfig: Record<string, any> = {};
    if (updatedJob.target_config && typeof updatedJob.target_config === 'object') {
      resultTargetConfig = updatedJob.target_config;
    }
    
    // Convert database response back to CronJob type with proper type casting
    const result: CronJob = {
      id: updatedJob.id,
      name: updatedJob.name,
      description: updatedJob.description || '',
      scheduleExpression: updatedJob.schedule_expression,
      startTime: updatedJob.start_time,
      endTime: updatedJob.end_time,
      status: updatedJob.status as 'active' | 'paused',
      isApi: updatedJob.is_api,
      endpointName: updatedJob.endpoint_name,
      iacCode: updatedJob.iac_code,
      groupId: updatedJob.group_id,
      groupName: job.groupName || '',
      groupIcon: job.groupIcon || '',
      timezone: updatedJob.timezone,
      tags: updatedJob.tags || [],
      flexibleTimeWindowMode: updatedJob.flexible_time_window_mode,
      flexibleWindowMinutes: updatedJob.flexible_window_minutes,
      targetType: updatedJob.target_type,
      targetConfig: resultTargetConfig,
    };
    return result;
  } catch (error) {
    console.error('Error updating cron job:', error);
    throw error;
  }
};

// Update the toggleCronJobStatus function to fix the group_name and group_icon issue
export const toggleCronJobStatus = async (id: string, status: 'active' | 'paused'): Promise<CronJob> => {
  try {
    // First, get the existing job
    const { data: existingJob, error: getError } = await supabase
      .from('cron_jobs')
      .select('*')
      .eq('id', id)
      .single();
      
    if (getError) {
      console.error('Error getting job data:', getError);
      throw new Error(`Job with ID ${id} not found`);
    }
    
    // Make the update request
    const { data, error } = await supabase
      .from('cron_jobs')
      .update({ status })
      .eq('id', id)
      .select();

    if (error) throw error;
    
    if (!data || data.length === 0) {
      console.warn('No data returned from update operation, using existing job data with updated status');
      // Use existing job data with the updated status
      const updatedJob = {
        ...existingJob,
        status
      };
      
      // Ensure targetConfig is an object
      let targetConfig: Record<string, any> = {};
      if (updatedJob.target_config && typeof updatedJob.target_config === 'object') {
        targetConfig = updatedJob.target_config;
      }
      
      // Convert to CronJob type
      const result: CronJob = {
        id: updatedJob.id,
        name: updatedJob.name,
        description: updatedJob.description || '',
        scheduleExpression: updatedJob.schedule_expression,
        startTime: updatedJob.start_time,
        endTime: updatedJob.end_time,
        status: updatedJob.status as 'active' | 'paused',
        isApi: updatedJob.is_api,
        endpointName: updatedJob.endpoint_name,
        iacCode: updatedJob.iac_code,
        groupId: updatedJob.group_id,
        groupName: updatedJob.group_name || '',
        groupIcon: updatedJob.group_icon || '',
        timezone: updatedJob.timezone,
        tags: updatedJob.tags || [],
        flexibleTimeWindowMode: updatedJob.flexible_time_window_mode,
        flexibleWindowMinutes: updatedJob.flexible_window_minutes,
        targetType: updatedJob.target_type,
        targetConfig: targetConfig,
      };
      return result;
    }
    
    const updatedJob = data[0];
    
    // Ensure targetConfig is an object
    let targetConfig: Record<string, any> = {};
    if (updatedJob.target_config && typeof updatedJob.target_config === 'object') {
      targetConfig = updatedJob.target_config;
    }
    
    // Convert database response to CronJob type
    const result: CronJob = {
      id: updatedJob.id,
      name: updatedJob.name,
      description: updatedJob.description || '',
      scheduleExpression: updatedJob.schedule_expression,
      startTime: updatedJob.start_time,
      endTime: updatedJob.end_time,
      status: updatedJob.status as 'active' | 'paused',
      isApi: updatedJob.is_api,
      endpointName: updatedJob.endpoint_name,
      iacCode: updatedJob.iac_code,
      groupId: updatedJob.group_id,
      groupName: updatedJob.group_name || '',
      groupIcon: updatedJob.group_icon || '',
      timezone: updatedJob.timezone,
      tags: updatedJob.tags || [],
      flexibleTimeWindowMode: updatedJob.flexible_time_window_mode,
      flexibleWindowMinutes: updatedJob.flexible_window_minutes,
      targetType: updatedJob.target_type,
      targetConfig: targetConfig,
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

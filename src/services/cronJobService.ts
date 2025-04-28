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
      const nextRun = calculateNextRun(job.schedule_expression);
      
      return {
        id: job.id,
        name: job.name,
        description: job.description,
        scheduleExpression: job.schedule_expression,
        startTime: job.start_time,
        endTime: job.end_time,
        status: job.status,
        isApi: job.is_api,
        endpointName: job.endpoint_name,
        iacCode: job.iac_code,
        groupId: job.group_id,
        groupName: job.schedule_groups?.name || 'Default',
        timezone: job.timezone,
        tags: job.tags || [],
        flexibleTimeWindowMode: job.flexible_time_window_mode,
        flexibleWindowMinutes: job.flexible_window_minutes,
        targetType: job.target_type,
        // Next run is calculated but not stored in the database or the interface
        nextRun: nextRun
      } as CronJob & { nextRun: string };
    } catch (error) {
      console.error(`Error processing job ${job.id}:`, error);
      // In case of error, return the job with current date as nextRun
      return {
        id: job.id,
        name: job.name,
        description: job.description,
        scheduleExpression: job.schedule_expression,
        startTime: job.start_time,
        endTime: job.end_time,
        status: job.status,
        isApi: job.is_api,
        endpointName: job.endpoint_name,
        iacCode: job.iac_code,
        groupId: job.group_id,
        groupName: job.schedule_groups?.name || 'Default',
        timezone: job.timezone,
        tags: job.tags || [],
        flexibleTimeWindowMode: job.flexible_time_window_mode,
        flexibleWindowMinutes: job.flexible_window_minutes,
        targetType: job.target_type,
        nextRun: new Date().toISOString()
      } as CronJob & { nextRun: string };
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
export const createCronJob = async (job: Omit<CronJob, 'id'> & { nextRun?: string }): Promise<CronJob & { nextRun: string }> => {
  // First, insert the main cron job
  const { data, error } = await supabase
    .from('cron_jobs')
    .insert({
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
      target_type: job.targetType,
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

  // Insert target-specific data based on target type
  try {
    await insertTargetData(data.id, job);
  } catch (targetError) {
    console.error(`Error inserting target data for ${job.targetType}:`, targetError);
    // Consider whether to delete the main job record here if target insertion fails
  }

  const nextRun = calculateNextRun(data.schedule_expression);
  
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    scheduleExpression: data.schedule_expression,
    startTime: data.startTime,
    endTime: data.endTime,
    status: data.status,
    isApi: data.is_api,
    endpointName: data.endpoint_name,
    iacCode: data.iac_code,
    groupId: data.group_id,
    groupName: data.schedule_groups?.name || 'Default',
    timezone: data.timezone,
    tags: data.tags || [],
    flexibleTimeWindowMode: data.flexible_time_window_mode,
    flexibleWindowMinutes: data.flexible_window_minutes,
    targetType: data.target_type,
    nextRun: nextRun
  };
};

// Helper function to insert target-specific data
const insertTargetData = async (jobId: string, job: Partial<CronJob>) => {
  switch (job.targetType) {
    case 'LAMBDA':
      if (job.function_arn) {
        await supabase
          .from('lambda_targets')
          .insert({
            id: jobId,
            function_arn: job.function_arn,
            payload: job.payload
          });
      }
      break;
    case 'STEP_FUNCTION':
      if (job.state_machine_arn && job.execution_role_arn) {
        await supabase
          .from('stepfunction_targets')
          .insert({
            id: jobId,
            state_machine_arn: job.state_machine_arn,
            execution_role_arn: job.execution_role_arn,
            input_payload: job.input_payload
          });
      }
      break;
    case 'API_GATEWAY':
      if (job.endpoint_url && job.http_method) {
        await supabase
          .from('api_gateway_targets')
          .insert({
            id: jobId,
            endpoint_url: job.endpoint_url,
            http_method: job.http_method,
            headers: job.headers,
            body: job.body,
            authorization_type: job.authorization_type
          });
      }
      break;
    case 'EVENTBRIDGE':
      if (job.event_bus_arn) {
        await supabase
          .from('eventbridge_targets')
          .insert({
            id: jobId,
            event_bus_arn: job.event_bus_arn,
            event_payload: job.event_payload
          });
      }
      break;
    case 'SQS':
      if (job.queue_url && job.message_body) {
        await supabase
          .from('sqs_targets')
          .insert({
            id: jobId,
            queue_url: job.queue_url,
            message_body: job.message_body,
            message_group_id: job.message_group_id
          });
      }
      break;
    case 'ECS':
      if (job.cluster_arn && job.task_definition_arn) {
        await supabase
          .from('ecs_targets')
          .insert({
            id: jobId,
            cluster_arn: job.cluster_arn,
            task_definition_arn: job.task_definition_arn,
            launch_type: job.launch_type,
            network_configuration: job.network_configuration,
            overrides: job.overrides
          });
      }
      break;
    case 'KINESIS':
      if (job.stream_arn && job.partition_key) {
        await supabase
          .from('kinesis_targets')
          .insert({
            id: jobId,
            stream_arn: job.stream_arn,
            partition_key: job.partition_key,
            payload: job.payload
          });
      }
      break;
    case 'SAGEMAKER':
      if (job.training_job_definition_arn) {
        await supabase
          .from('sagemaker_targets')
          .insert({
            id: jobId,
            training_job_definition_arn: job.training_job_definition_arn,
            hyper_parameters: job.hyper_parameters,
            input_data_config: job.input_data_config
          });
      }
      break;
  }
};

// Helper function to update target-specific data
const updateTargetData = async (jobId: string, job: Partial<CronJob>) => {
  switch (job.targetType) {
    case 'LAMBDA':
      if (job.function_arn) {
        const { data: existingData } = await supabase
          .from('lambda_targets')
          .select('*')
          .eq('id', jobId)
          .maybeSingle();
        
        if (existingData) {
          await supabase
            .from('lambda_targets')
            .update({
              function_arn: job.function_arn,
              payload: job.payload
            })
            .eq('id', jobId);
        } else {
          await supabase
            .from('lambda_targets')
            .insert({
              id: jobId,
              function_arn: job.function_arn,
              payload: job.payload
            });
        }
      }
      break;
    case 'STEP_FUNCTION':
      if (job.state_machine_arn && job.execution_role_arn) {
        const { data: existingData } = await supabase
          .from('stepfunction_targets')
          .select('*')
          .eq('id', jobId)
          .maybeSingle();
        
        if (existingData) {
          await supabase
            .from('stepfunction_targets')
            .update({
              state_machine_arn: job.state_machine_arn,
              execution_role_arn: job.execution_role_arn,
              input_payload: job.input_payload
            })
            .eq('id', jobId);
        } else {
          await supabase
            .from('stepfunction_targets')
            .insert({
              id: jobId,
              state_machine_arn: job.state_machine_arn,
              execution_role_arn: job.execution_role_arn,
              input_payload: job.input_payload
            });
        }
      }
      break;
    case 'API_GATEWAY':
      if (job.endpoint_url && job.http_method) {
        const { data: existingData } = await supabase
          .from('api_gateway_targets')
          .select('*')
          .eq('id', jobId)
          .maybeSingle();
        
        if (existingData) {
          await supabase
            .from('api_gateway_targets')
            .update({
              endpoint_url: job.endpoint_url,
              http_method: job.http_method,
              headers: job.headers,
              body: job.body,
              authorization_type: job.authorization_type
            })
            .eq('id', jobId);
        } else {
          await supabase
            .from('api_gateway_targets')
            .insert({
              id: jobId,
              endpoint_url: job.endpoint_url,
              http_method: job.http_method,
              headers: job.headers,
              body: job.body,
              authorization_type: job.authorization_type
            });
        }
      }
      break;
    case 'EVENTBRIDGE':
      if (job.event_bus_arn) {
        const { data: existingData } = await supabase
          .from('eventbridge_targets')
          .select('*')
          .eq('id', jobId)
          .maybeSingle();
        
        if (existingData) {
          await supabase
            .from('eventbridge_targets')
            .update({
              event_bus_arn: job.event_bus_arn,
              event_payload: job.event_payload
            })
            .eq('id', jobId);
        } else {
          await supabase
            .from('eventbridge_targets')
            .insert({
              id: jobId,
              event_bus_arn: job.event_bus_arn,
              event_payload: job.event_payload
            });
        }
      }
      break;
    case 'SQS':
      if (job.queue_url && job.message_body) {
        const { data: existingData } = await supabase
          .from('sqs_targets')
          .select('*')
          .eq('id', jobId)
          .maybeSingle();
        
        if (existingData) {
          await supabase
            .from('sqs_targets')
            .update({
              queue_url: job.queue_url,
              message_body: job.message_body,
              message_group_id: job.message_group_id
            })
            .eq('id', jobId);
        } else {
          await supabase
            .from('sqs_targets')
            .insert({
              id: jobId,
              queue_url: job.queue_url,
              message_body: job.message_body,
              message_group_id: job.message_group_id
            });
        }
      }
      break;
    case 'ECS':
      if (job.cluster_arn && job.task_definition_arn) {
        const { data: existingData } = await supabase
          .from('ecs_targets')
          .select('*')
          .eq('id', jobId)
          .maybeSingle();
        
        if (existingData) {
          await supabase
            .from('ecs_targets')
            .update({
              cluster_arn: job.cluster_arn,
              task_definition_arn: job.task_definition_arn,
              launch_type: job.launch_type,
              network_configuration: job.network_configuration,
              overrides: job.overrides
            })
            .eq('id', jobId);
        } else {
          await supabase
            .from('ecs_targets')
            .insert({
              id: jobId,
              cluster_arn: job.cluster_arn,
              task_definition_arn: job.task_definition_arn,
              launch_type: job.launch_type,
              network_configuration: job.network_configuration,
              overrides: job.overrides
            });
        }
      }
      break;
    case 'KINESIS':
      if (job.stream_arn && job.partition_key) {
        const { data: existingData } = await supabase
          .from('kinesis_targets')
          .select('*')
          .eq('id', jobId)
          .maybeSingle();
        
        if (existingData) {
          await supabase
            .from('kinesis_targets')
            .update({
              stream_arn: job.stream_arn,
              partition_key: job.partition_key,
              payload: job.payload
            })
            .eq('id', jobId);
        } else {
          await supabase
            .from('kinesis_targets')
            .insert({
              id: jobId,
              stream_arn: job.stream_arn,
              partition_key: job.partition_key,
              payload: job.payload
            });
        }
      }
      break;
    case 'SAGEMAKER':
      if (job.training_job_definition_arn) {
        const { data: existingData } = await supabase
          .from('sagemaker_targets')
          .select('*')
          .eq('id', jobId)
          .maybeSingle();
        
        if (existingData) {
          await supabase
            .from('sagemaker_targets')
            .update({
              training_job_definition_arn: job.training_job_definition_arn,
              hyper_parameters: job.hyper_parameters,
              input_data_config: job.input_data_config
            })
            .eq('id', jobId);
        } else {
          await supabase
            .from('sagemaker_targets')
            .insert({
              id: jobId,
              training_job_definition_arn: job.training_job_definition_arn,
              hyper_parameters: job.hyper_parameters,
              input_data_config: job.input_data_config
            });
        }
      }
      break;
  }
};

// Update the updateCronJob function to handle target-specific data
export const updateCronJob = async (id: string, job: Partial<Omit<CronJob, 'id'>>): Promise<CronJob & { nextRun: string }> => {
  // Prepare the main job update
  const updateData: any = {};
  
  if (job.name !== undefined) updateData.name = job.name;
  if (job.description !== undefined) updateData.description = job.description;
  if (job.scheduleExpression !== undefined) updateData.schedule_expression = job.scheduleExpression;
  if (job.startTime !== undefined) updateData.start_time = job.startTime;
  if (job.endTime !== undefined) updateData.end_time = job.endTime;
  if (job.status !== undefined) updateData.status = job.status;
  if (job.isApi !== undefined) updateData.is_api = job.isApi;
  if (job.endpointName !== undefined) updateData.endpoint_name = job.endpointName;
  if (job.iacCode !== undefined) updateData.iac_code = job.iacCode;
  if (job.groupId !== undefined) updateData.group_id = job.groupId;
  if (job.timezone !== undefined) updateData.timezone = job.timezone;
  if (job.tags !== undefined) updateData.tags = job.tags;
  if (job.flexibleTimeWindowMode !== undefined) updateData.flexible_time_window_mode = job.flexibleTimeWindowMode;
  if (job.flexibleWindowMinutes !== undefined) updateData.flexible_window_minutes = job.flexibleWindowMinutes;
  if (job.targetType !== undefined) updateData.target_type = job.targetType;
  
  // Update the main cron job
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

  // Update target-specific data
  try {
    // Instead of deleting all target data first, we'll use a smarter approach
    // that updates existing target data or creates new target data if it doesn't exist
    await updateTargetData(id, job);
  } catch (targetError) {
    console.error(`Error updating target data for ${job.targetType}:`, targetError);
  }

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
    groupId: data.group_id,
    groupName: data.schedule_groups?.name || 'Default',
    timezone: data.timezone,
    tags: data.tags || [],
    flexibleTimeWindowMode: data.flexible_time_window_mode,
    flexibleWindowMinutes: data.flexible_window_minutes,
    targetType: data.target_type,
    nextRun: nextRun
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

export const toggleCronJobStatus = async (id: string, currentStatus: 'active' | 'paused'): Promise<CronJob & { nextRun: string }> => {
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
    groupId: data.group_id,
    groupName: data.schedule_groups?.name || 'Default',
    timezone: data.timezone,
    tags: data.tags || [],
    flexibleTimeWindowMode: data.flexible_time_window_mode,
    flexibleWindowMinutes: data.flexible_window_minutes,
    targetType: data.target_type,
    nextRun: nextRun
  };
};

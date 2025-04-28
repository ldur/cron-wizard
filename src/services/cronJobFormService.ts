
import { supabase } from "@/integrations/supabase/client";
import { CronJob } from "@/types/CronJob";
import { v4 as uuidv4 } from 'uuid';
import { calculateNextRun } from "@/utils/cronCalculator";

// Insert or update target-specific data
export const handleTargetData = async (
  jobId: string, 
  job: Partial<CronJob>, 
  isUpdate: boolean
): Promise<void> => {
  let targetTable: string | null = null;
  let targetData: any = {};

  switch (job.targetType) {
    case 'LAMBDA':
      targetTable = 'lambda_targets';
      targetData = {
        id: jobId,
        function_arn: job.function_arn,
        payload: job.payload,
      };
      break;
    case 'STEP_FUNCTION':
      targetTable = 'stepfunction_targets';
      targetData = {
        id: jobId,
        state_machine_arn: job.state_machine_arn,
        execution_role_arn: job.execution_role_arn,
        input_payload: job.input_payload,
      };
      break;
    case 'API_GATEWAY':
      targetTable = 'api_gateway_targets';
      targetData = {
        id: jobId,
        endpoint_url: job.endpoint_url,
        http_method: job.http_method,
        headers: job.headers,
        body: job.body,
        authorization_type: job.authorization_type,
      };
      break;
    case 'EVENTBRIDGE':
      targetTable = 'eventbridge_targets';
      targetData = {
        id: jobId,
        event_bus_arn: job.event_bus_arn,
        event_payload: job.event_payload,
      };
      break;
    case 'SQS':
      targetTable = 'sqs_targets';
      targetData = {
        id: jobId,
        queue_url: job.queue_url,
        message_body: job.message_body,
        message_group_id: job.message_group_id,
      };
      break;
    case 'ECS':
      targetTable = 'ecs_targets';
      targetData = {
        id: jobId,
        cluster_arn: job.cluster_arn,
        task_definition_arn: job.task_definition_arn,
        launch_type: job.launch_type,
        network_configuration: job.network_configuration,
        overrides: job.overrides,
      };
      break;
    case 'KINESIS':
      targetTable = 'kinesis_targets';
      targetData = {
        id: jobId,
        stream_arn: job.stream_arn,
        partition_key: job.partition_key,
        payload: job.payload,
      };
      break;
    case 'SAGEMAKER':
      targetTable = 'sagemaker_targets';
      targetData = {
        id: jobId,
        training_job_definition_arn: job.training_job_definition_arn,
        hyper_parameters: job.hyper_parameters,
        input_data_config: job.input_data_config,
      };
      break;
    default:
      console.warn('Unknown target type:', job.targetType);
      return;
  }

  if (!targetTable) return;

  if (isUpdate) {
    const { data: existingData } = await supabase
      .from(targetTable)
      .select('*')
      .eq('id', jobId)
      .maybeSingle();
    
    if (existingData) {
      await supabase
        .from(targetTable)
        .update(targetData)
        .eq('id', jobId);
    } else {
      await supabase
        .from(targetTable)
        .insert(targetData);
    }
  } else {
    await supabase
      .from(targetTable)
      .insert(targetData);
  }
};

// Create a new cron job
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
    group_id: values.groupId,
    timezone: values.timezone,
    tags: values.tags || [],
    flexible_time_window_mode: values.flexibleTimeWindowMode,
    flexible_window_minutes: values.flexibleWindowMinutes,
    command: values.scheduleExpression, // TODO: Remove this field
    target_type: values.targetType,
  };

  if (isUpdate) {
    await supabase
      .from('cron_jobs')
      .update(cronJobData)
      .eq('id', jobId);
  } else {
    await supabase
      .from('cron_jobs')
      .insert(cronJobData);
  }

  // Handle target-specific data
  await handleTargetData(jobId, values, isUpdate);
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

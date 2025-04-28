
import * as z from "zod";

export const cronJobSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, {
    message: "Name must be at least 3 characters.",
  }),
  description: z.string().optional(),
  scheduleExpression: z.string().min(1, {
    message: "Schedule expression is required.",
  }),
  startTime: z.date().optional(),
  endTime: z.date().optional(),
  status: z.enum(['active', 'paused']),
  isApi: z.boolean().default(false),
  endpointName: z.string().nullable().optional(),
  iacCode: z.string().nullable().optional(),
  groupId: z.string().optional(),
  timezone: z.string().optional(),
  tags: z.array(z.string()).default([]),
  flexibleTimeWindowMode: z.enum(['OFF', 'FLEXIBLE']).default('OFF'),
  flexibleWindowMinutes: z.number().nullable().optional(),
  targetType: z.enum(['LAMBDA', 'STEP_FUNCTION', 'API_GATEWAY', 'EVENTBRIDGE', 'SQS', 'ECS', 'KINESIS', 'SAGEMAKER']),

  // Target-specific fields (optional)
  // Lambda
  function_arn: z.string().optional(),
  payload: z.any().optional(),

  // Step Function
  state_machine_arn: z.string().optional(),
  execution_role_arn: z.string().optional(),
  input_payload: z.any().optional(),

  // API Gateway
  endpoint_url: z.string().optional(),
  http_method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']).optional(),
  headers: z.any().optional(),
  body: z.any().optional(),
  authorization_type: z.enum(['NONE', 'IAM', 'COGNITO_USER_POOLS']).optional(),

  // EventBridge
  event_bus_arn: z.string().optional(),
  event_payload: z.any().optional(),

  // SQS
  queue_url: z.string().optional(),
  message_body: z.string().optional(),
  message_group_id: z.string().optional(),

  // ECS
  cluster_arn: z.string().optional(),
  task_definition_arn: z.string().optional(),
  launch_type: z.enum(['FARGATE', 'EC2']).optional(),
  network_configuration: z.any().optional(),
  overrides: z.any().optional(),

  // Kinesis
  stream_arn: z.string().optional(),
  partition_key: z.string().optional(),

  // SageMaker
  training_job_definition_arn: z.string().optional(),
  hyper_parameters: z.any().optional(),
  input_data_config: z.any().optional(),
});


export interface CronJob {
  id: string;
  name: string;
  description?: string;
  scheduleExpression: string;
  startTime?: string;
  endTime?: string;
  status: 'active' | 'paused';
  isApi: boolean;
  endpointName: string | null;
  iacCode: string | null;
  groupId?: string;
  groupName?: string;
  groupIcon?: string;
  timezone?: string | null;
  tags: string[];
  flexibleTimeWindowMode: 'OFF' | 'FLEXIBLE';
  flexibleWindowMinutes: number | null;
  targetType: 'LAMBDA' | 'STEP_FUNCTION' | 'API_GATEWAY' | 'EVENTBRIDGE' | 'SQS' | 'ECS' | 'KINESIS' | 'SAGEMAKER';
  
  // Target-specific fields (optional)
  // Lambda
  function_arn?: string;
  payload?: any;
  
  // Step Function
  state_machine_arn?: string;
  execution_role_arn?: string;
  input_payload?: any;
  
  // API Gateway
  endpoint_url?: string;
  http_method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
  headers?: any;
  body?: any;
  authorization_type?: 'NONE' | 'IAM' | 'COGNITO_USER_POOLS';
  
  // EventBridge
  event_bus_arn?: string;
  event_payload?: any;
  
  // SQS
  queue_url?: string;
  message_body?: string;
  message_group_id?: string;
  
  // ECS
  cluster_arn?: string;
  task_definition_arn?: string;
  launch_type?: 'FARGATE' | 'EC2';
  network_configuration?: any;
  overrides?: any;
  
  // Kinesis
  stream_arn?: string;
  partition_key?: string;
  
  // SageMaker
  training_job_definition_arn?: string;
  hyper_parameters?: any;
  input_data_config?: any;
}

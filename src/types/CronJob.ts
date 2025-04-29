
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
  
  // Configuration for target-specific settings
  targetConfig?: Record<string, any>;

  // The fields below are deprecated and will be removed in a future version
  // All target configuration should use targetConfig instead
  /** @deprecated Use targetConfig instead */
  function_arn?: string;
  /** @deprecated Use targetConfig instead */
  payload?: any;
  /** @deprecated Use targetConfig instead */
  state_machine_arn?: string;
  /** @deprecated Use targetConfig instead */
  execution_role_arn?: string;
  /** @deprecated Use targetConfig instead */
  input_payload?: any;
  /** @deprecated Use targetConfig instead */
  endpoint_url?: string;
  /** @deprecated Use targetConfig instead */
  http_method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
  /** @deprecated Use targetConfig instead */
  headers?: any;
  /** @deprecated Use targetConfig instead */
  body?: any;
  /** @deprecated Use targetConfig instead */
  authorization_type?: 'NONE' | 'IAM' | 'COGNITO_USER_POOLS';
  /** @deprecated Use targetConfig instead */
  event_bus_arn?: string;
  /** @deprecated Use targetConfig instead */
  event_payload?: any;
  /** @deprecated Use targetConfig instead */
  queue_url?: string;
  /** @deprecated Use targetConfig instead */
  message_body?: string;
  /** @deprecated Use targetConfig instead */
  message_group_id?: string;
  /** @deprecated Use targetConfig instead */
  cluster_arn?: string;
  /** @deprecated Use targetConfig instead */
  task_definition_arn?: string;
  /** @deprecated Use targetConfig instead */
  launch_type?: 'FARGATE' | 'EC2';
  /** @deprecated Use targetConfig instead */
  network_configuration?: any;
  /** @deprecated Use targetConfig instead */
  overrides?: any;
  /** @deprecated Use targetConfig instead */
  stream_arn?: string;
  /** @deprecated Use targetConfig instead */
  partition_key?: string;
  /** @deprecated Use targetConfig instead */
  training_job_definition_arn?: string;
  /** @deprecated Use targetConfig instead */
  hyper_parameters?: any;
  /** @deprecated Use targetConfig instead */
  input_data_config?: any;
}

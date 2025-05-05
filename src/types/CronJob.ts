
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
  sdkCode: string | null;
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
}

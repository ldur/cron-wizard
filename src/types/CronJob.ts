
export interface CronJob {
  id: string;
  name: string;
  command: string;
  cronExpression: string;
  status: 'active' | 'paused';
  nextRun: string;
  isApi: boolean;
  endpointName: string | null;
  iacCode: string | null;
  groupId?: string;
  groupName?: string;
  timeZone?: string | null;
  tags: string[];
  flexibleTimeWindowMode: 'OFF' | 'FLEXIBLE';
  flexibleWindowMinutes: number | null;
  targetType: 'LAMBDA' | 'STEP_FUNCTION' | 'API_GATEWAY' | 'EVENTBRIDGE' | 'SQS' | 'ECS' | 'KINESIS' | 'SAGEMAKER';
}

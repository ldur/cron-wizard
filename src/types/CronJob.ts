
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
}

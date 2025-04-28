
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
  groupId?: string;  // Optional group ID
  groupName?: string; // Optional group name
  timeZone?: string | null; // Added the timeZone property
}

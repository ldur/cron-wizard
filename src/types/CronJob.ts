
export interface CronJob {
  id: string;
  name: string;
  command: string;
  cronExpression: string;
  status: 'active' | 'paused';
  nextRun: string;
}

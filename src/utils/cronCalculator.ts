
// This is a very simplistic implementation for demo purposes
// In a real app, you would use a library like cron-parser
export const calculateNextRun = (cronExpression: string): string => {
  // For the demo, we'll just return a time slightly in the future
  const now = new Date();
  now.setHours(now.getHours() + Math.floor(Math.random() * 24) + 1);
  now.setMinutes(Math.floor(Math.random() * 60));
  
  return now.toISOString();
};


// This is a more realistic implementation to calculate the next run date
// Still simplified for demo purposes
export const calculateNextRun = (cronExpression: string): string => {
  try {
    const [minute, hour, dayOfMonth, month, dayOfWeek] = cronExpression.split(' ');
    
    const now = new Date();
    let nextRun = new Date(now);
    
    // Set the next run time based on hour and minute
    if (hour !== '*') {
      nextRun.setHours(parseInt(hour));
    }
    
    if (minute !== '*') {
      nextRun.setMinutes(parseInt(minute));
    } else {
      nextRun.setMinutes(0);
    }
    
    nextRun.setSeconds(0);
    nextRun.setMilliseconds(0);
    
    // If the time is in the past, move to the next day
    if (nextRun < now) {
      nextRun.setDate(nextRun.getDate() + 1);
    }
    
    // Handle day of week (0-6, Sunday to Saturday)
    if (dayOfWeek !== '*') {
      let targetDay: number;
      
      if (dayOfWeek.includes('-')) {
        // Handle ranges like 1-5 (Monday to Friday)
        const [start, end] = dayOfWeek.split('-').map(d => parseInt(d));
        const currentDay = nextRun.getDay();
        
        if (currentDay < start || currentDay > end) {
          // Move to the next occurrence of the start day
          const daysToAdd = (start - currentDay + 7) % 7;
          nextRun.setDate(nextRun.getDate() + (daysToAdd === 0 ? 7 : daysToAdd));
        }
      } else if (dayOfWeek.includes(',')) {
        // Handle lists like 1,3,5 (Monday, Wednesday, Friday)
        const days = dayOfWeek.split(',').map(d => parseInt(d));
        const currentDay = nextRun.getDay();
        
        if (!days.includes(currentDay)) {
          // Find the next day in the list
          let daysToAdd = 7;
          for (const day of days) {
            const diff = (day - currentDay + 7) % 7;
            if (diff > 0 && diff < daysToAdd) {
              daysToAdd = diff;
            }
          }
          nextRun.setDate(nextRun.getDate() + daysToAdd);
        }
      } else {
        // Handle single day
        const targetDay = parseInt(dayOfWeek);
        const currentDay = nextRun.getDay();
        
        if (currentDay !== targetDay) {
          // Calculate days to add to reach the target day
          const daysToAdd = (targetDay - currentDay + 7) % 7;
          nextRun.setDate(nextRun.getDate() + (daysToAdd === 0 ? 7 : daysToAdd));
        }
      }
    }
    
    // Validate the date before returning
    const timestamp = nextRun.getTime();
    if (isNaN(timestamp) || timestamp < 0 || timestamp > 8640000000000000) {
      // Return a fallback date if the calculated date is invalid
      return new Date().toISOString();
    }
    
    return nextRun.toISOString();
  } catch (error) {
    console.error("Error calculating next run:", error);
    // Return current date as fallback in case of any error
    return new Date().toISOString();
  }
};

/**
 * Calculate multiple upcoming run dates for a cron expression
 * @param cronExpression The cron expression to calculate runs for
 * @param count Number of future runs to calculate
 * @param startDate Optional start date boundary (inclusive)
 * @param endDate Optional end date boundary (inclusive)
 * @returns Array of ISO date strings for upcoming runs
 */
export const calculateNextRuns = (
  cronExpression: string,
  count: number = 10,
  startDate?: string | null,
  endDate?: string | null
): string[] => {
  try {
    const runs: string[] = [];
    const now = new Date();
    const start = startDate ? new Date(startDate) : now;
    const end = endDate ? new Date(endDate) : null;
    
    // Use current date as base if start date is in the past
    let baseDate = start < now ? now : start;
    
    // Calculate the first run
    let lastCalculatedDate = calculateNextRunFromBase(cronExpression, baseDate);
    
    while (runs.length < count) {
      const nextRunDate = new Date(lastCalculatedDate);
      
      // Stop if we exceed the end date
      if (end && nextRunDate > end) {
        break;
      }
      
      runs.push(lastCalculatedDate);
      
      // Use the last calculated date as the base for the next calculation
      // Add 1 minute to avoid getting the same date again
      const nextBase = new Date(lastCalculatedDate);
      nextBase.setMinutes(nextBase.getMinutes() + 1);
      
      lastCalculatedDate = calculateNextRunFromBase(cronExpression, nextBase);
    }
    
    return runs;
  } catch (error) {
    console.error("Error calculating next runs:", error);
    return [new Date().toISOString()];
  }
};

/**
 * Helper function to calculate next run from a specific base date
 */
const calculateNextRunFromBase = (cronExpression: string, baseDate: Date): string => {
  try {
    const [minute, hour, dayOfMonth, month, dayOfWeek] = cronExpression.split(' ');
    
    let nextRun = new Date(baseDate);
    
    // Set the next run time based on hour and minute
    if (hour !== '*') {
      nextRun.setHours(parseInt(hour));
    }
    
    if (minute !== '*') {
      nextRun.setMinutes(parseInt(minute));
    } else {
      nextRun.setMinutes(0);
    }
    
    nextRun.setSeconds(0);
    nextRun.setMilliseconds(0);
    
    // If the time is in the past, move to the next day
    if (nextRun <= baseDate) {
      nextRun.setDate(nextRun.getDate() + 1);
    }
    
    // Handle day of week (0-6, Sunday to Saturday)
    if (dayOfWeek !== '*') {
      let targetDay: number;
      
      if (dayOfWeek.includes('-')) {
        // Handle ranges like 1-5 (Monday to Friday)
        const [start, end] = dayOfWeek.split('-').map(d => parseInt(d));
        const currentDay = nextRun.getDay();
        
        if (currentDay < start || currentDay > end) {
          // Move to the next occurrence of the start day
          const daysToAdd = (start - currentDay + 7) % 7;
          nextRun.setDate(nextRun.getDate() + (daysToAdd === 0 ? 7 : daysToAdd));
        }
      } else if (dayOfWeek.includes(',')) {
        // Handle lists like 1,3,5 (Monday, Wednesday, Friday)
        const days = dayOfWeek.split(',').map(d => parseInt(d));
        const currentDay = nextRun.getDay();
        
        if (!days.includes(currentDay)) {
          // Find the next day in the list
          let daysToAdd = 7;
          for (const day of days) {
            const diff = (day - currentDay + 7) % 7;
            if (diff > 0 && diff < daysToAdd) {
              daysToAdd = diff;
            }
          }
          nextRun.setDate(nextRun.getDate() + daysToAdd);
        }
      } else {
        // Handle single day
        const targetDay = parseInt(dayOfWeek);
        const currentDay = nextRun.getDay();
        
        if (currentDay !== targetDay) {
          // Calculate days to add to reach the target day
          const daysToAdd = (targetDay - currentDay + 7) % 7;
          nextRun.setDate(nextRun.getDate() + (daysToAdd === 0 ? 7 : daysToAdd));
        }
      }
    }
    
    // Validate the date before returning
    const timestamp = nextRun.getTime();
    if (isNaN(timestamp) || timestamp < 0 || timestamp > 8640000000000000) {
      // Return a fallback date if the calculated date is invalid
      return new Date().toISOString();
    }
    
    return nextRun.toISOString();
  } catch (error) {
    console.error("Error calculating next run from base:", error);
    // Return current date as fallback in case of any error
    return new Date().toISOString();
  }
};

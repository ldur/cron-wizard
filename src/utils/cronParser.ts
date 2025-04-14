// In a real app, you would use a more sophisticated parser library
// This is a very simplified version for demonstration

export const parseSchedule = (cronExpression: string): string => {
  const parts = cronExpression.split(' ');
  if (parts.length !== 5) return 'Invalid cron expression';

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

  // Fix the day mapping to ensure correct weekday is shown
  if (minute === '0' && hour === '0' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
    return 'Daily at midnight';
  }
  
  if (minute === '0' && hour === '*' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
    return 'Every hour at the start of the hour';
  }
  
  if (minute === '*/5' && hour === '*' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
    return 'Every 5 minutes';
  }
  
  if (minute === '*/15' && hour === '*' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
    return 'Every 15 minutes';
  }
  
  if (minute === '*/30' && hour === '*' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
    return 'Every 30 minutes';
  }
  
  if (minute === '0' && hour === '9' && dayOfMonth === '*' && month === '*' && dayOfWeek === '1-5') {
    return 'Every weekday at 9am';
  }
  
  if (minute === '0' && hour === '9' && dayOfMonth === '*' && month === '*' && dayOfWeek === '1') {
    return 'Every Monday at 9am';
  }
  
  if (minute === '0' && hour === '9' && dayOfMonth === '*' && month === '*' && dayOfWeek === '2') {
    return 'Every Tuesday at 9am';
  }
  
  if (minute === '0' && hour === '9' && dayOfMonth === '*' && month === '*' && dayOfWeek === '3') {
    return 'Every Wednesday at 9am';
  }
  
  if (minute === '0' && hour === '9' && dayOfMonth === '*' && month === '*' && dayOfWeek === '4') {
    return 'Every Thursday at 9am';
  }
  
  if (minute === '0' && hour === '9' && dayOfMonth === '*' && month === '*' && dayOfWeek === '5') {
    return 'Every Friday at 9am';
  }
  
  if (minute === '0' && hour === '9' && dayOfMonth === '*' && month === '*' && dayOfWeek === '6') {
    return 'Every Saturday at 9am';
  }
  
  if (minute === '0' && hour === '9' && dayOfMonth === '*' && month === '*' && dayOfWeek === '0') {
    return 'Every Sunday at 9am';
  }
  
  if (minute === '0' && hour !== '*' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
    return `Daily at ${formatHour(parseInt(hour))}`;
  }

  if (minute !== '*' && hour !== '*' && dayOfMonth === '*' && month === '*' && dayOfWeek !== '*') {
    const days = parseDaysOfWeek(dayOfWeek);
    return `Every ${days} at ${formatHour(parseInt(hour))}:${formatMinute(parseInt(minute))}`;
  }
  
  if (minute !== '*' && hour !== '*' && dayOfMonth !== '*' && month === '*' && dayOfWeek === '*') {
    return `Monthly on day ${dayOfMonth} at ${formatHour(parseInt(hour))}:${formatMinute(parseInt(minute))}`;
  }

  return `Custom schedule (${cronExpression})`;
};

export const convertToCron = (naturalLanguage: string): string => {
  const lowercased = naturalLanguage.toLowerCase();
  
  if (lowercased.includes('every minute')) {
    return '* * * * *';
  }
  
  if (lowercased.includes('every 5 minutes')) {
    return '*/5 * * * *';
  }
  
  if (lowercased.includes('every 15 minutes')) {
    return '*/15 * * * *';
  }
  
  if (lowercased.includes('every 30 minutes')) {
    return '*/30 * * * *';
  }
  
  if (lowercased.includes('every hour')) {
    return '0 * * * *';
  }
  
  if (lowercased.includes('daily at midnight') || lowercased.includes('every day at midnight')) {
    return '0 0 * * *';
  }

  // "At 8am every day"
  const dailyTimeMatch = lowercased.match(/(?:at|every day at) (\d+)(?::(\d+))?\s*(am|pm)?/);
  if (dailyTimeMatch) {
    let hour = parseInt(dailyTimeMatch[1]);
    const minute = dailyTimeMatch[2] ? parseInt(dailyTimeMatch[2]) : 0;
    const meridiem = dailyTimeMatch[3];
    
    if (meridiem === 'pm' && hour < 12) hour += 12;
    if (meridiem === 'am' && hour === 12) hour = 0;
    
    return `${minute} ${hour} * * *`;
  }

  // "Every Monday at 9am"
  const weekdayMatch = lowercased.match(/every (monday|tuesday|wednesday|thursday|friday|saturday|sunday) at (\d+)(?::(\d+))?\s*(am|pm)?/);
  if (weekdayMatch) {
    const dayOfWeek = convertDayToNumber(weekdayMatch[1]);
    let hour = parseInt(weekdayMatch[2]);
    const minute = weekdayMatch[3] ? parseInt(weekdayMatch[3]) : 0;
    const meridiem = weekdayMatch[4];
    
    if (meridiem === 'pm' && hour < 12) hour += 12;
    if (meridiem === 'am' && hour === 12) hour = 0;
    
    return `${minute} ${hour} * * ${dayOfWeek}`;
  }

  // "Every weekday at 9am"
  const weekdayTimeMatch = lowercased.match(/every weekday at (\d+)(?::(\d+))?\s*(am|pm)?/);
  if (weekdayTimeMatch) {
    let hour = parseInt(weekdayTimeMatch[1]);
    const minute = weekdayTimeMatch[2] ? parseInt(weekdayTimeMatch[2]) : 0;
    const meridiem = weekdayTimeMatch[3];
    
    if (meridiem === 'pm' && hour < 12) hour += 12;
    if (meridiem === 'am' && hour === 12) hour = 0;
    
    return `${minute} ${hour} * * 1-5`;
  }

  // "Every month on the 1st at 9am"
  const monthlyMatch = lowercased.match(/every month (?:on the|on) (\d+)(?:st|nd|rd|th)? at (\d+)(?::(\d+))?\s*(am|pm)?/);
  if (monthlyMatch) {
    const day = parseInt(monthlyMatch[1]);
    let hour = parseInt(monthlyMatch[2]);
    const minute = monthlyMatch[3] ? parseInt(monthlyMatch[3]) : 0;
    const meridiem = monthlyMatch[4];
    
    if (meridiem === 'pm' && hour < 12) hour += 12;
    if (meridiem === 'am' && hour === 12) hour = 0;
    
    return `${minute} ${hour} ${day} * *`;
  }
  
  // "At 2:30pm every Tuesday and Thursday"
  const multiDayMatch = lowercased.match(/(?:at|every) (\d+)(?::(\d+))?\s*(am|pm)? (?:every|on) ((?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)(?:(?:,| and) (?:monday|tuesday|wednesday|thursday|friday|saturday|sunday))*)/);
  if (multiDayMatch) {
    let hour = parseInt(multiDayMatch[1]);
    const minute = multiDayMatch[2] ? parseInt(multiDayMatch[2]) : 0;
    const meridiem = multiDayMatch[3];
    const daysText = multiDayMatch[4];
    
    if (meridiem === 'pm' && hour < 12) hour += 12;
    if (meridiem === 'am' && hour === 12) hour = 0;
    
    const days = daysText
      .split(/,| and /)
      .map(day => day.trim())
      .filter(day => !!day)
      .map(day => convertDayToNumber(day))
      .join(',');
    
    return `${minute} ${hour} * * ${days}`;
  }

  // Default to every hour if we can't parse
  return '0 * * * *';
};

const formatHour = (hour: number): string => {
  if (hour === 0 || hour === 24) {
    return '12am';
  }
  if (hour === 12) {
    return '12pm';
  }
  if (hour > 12) {
    return `${hour - 12}pm`;
  }
  return `${hour}am`;
};

const formatMinute = (minute: number): string => {
  return minute < 10 ? `0${minute}` : `${minute}`;
};

const formatDayOfWeek = (dayOfWeek: string): string => {
  if (dayOfWeek === '1-5') return 'weekday';
  
  const days: Record<string, string> = {
    '0': 'Sunday',
    '1': 'Monday',
    '2': 'Tuesday',
    '3': 'Wednesday',
    '4': 'Thursday',
    '5': 'Friday',
    '6': 'Saturday',
  };
  
  return days[dayOfWeek] || dayOfWeek;
};

const parseDaysOfWeek = (dayOfWeek: string): string => {
  if (dayOfWeek === '1-5') return 'weekday';
  if (dayOfWeek === '0,6') return 'weekend';
  
  const days: Record<string, string> = {
    '0': 'Sunday',
    '1': 'Monday',
    '2': 'Tuesday',
    '3': 'Wednesday',
    '4': 'Thursday',
    '5': 'Friday',
    '6': 'Saturday',
  };
  
  if (dayOfWeek.includes(',')) {
    const daysList = dayOfWeek.split(',').map(d => days[d] || d);
    const lastDay = daysList.pop();
    return `${daysList.join(', ')} and ${lastDay}`;
  }
  
  return days[dayOfWeek] || dayOfWeek;
};

const convertDayToNumber = (day: string): string => {
  const days: Record<string, string> = {
    'sunday': '0',
    'monday': '1',
    'tuesday': '2',
    'wednesday': '3',
    'thursday': '4',
    'friday': '5',
    'saturday': '6',
  };
  
  return days[day] || '0';
};

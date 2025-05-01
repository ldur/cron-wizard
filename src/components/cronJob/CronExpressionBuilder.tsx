
import React, { useEffect, useState } from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FormControl, FormDescription, FormItem, FormLabel } from '@/components/ui/form';

interface CronExpressionBuilderProps {
  value: string;
  onChange: (value: string) => void;
}

export const CronExpressionBuilder: React.FC<CronExpressionBuilderProps> = ({
  value,
  onChange
}) => {
  // Parse initial value or use defaults
  const parseCronExpression = (cronExpr: string): CronParts => {
    const parts = cronExpr.split(' ');
    return {
      minute: parts[0] || '*',
      hour: parts[1] || '*',
      dayOfMonth: parts[2] || '*',
      month: parts[3] || '*',
      dayOfWeek: parts[4] || '*'
    };
  };

  // Initial state from provided value
  const [cronParts, setCronParts] = useState<CronParts>(parseCronExpression(value));

  interface CronParts {
    minute: string;
    hour: string;
    dayOfMonth: string;
    month: string;
    dayOfWeek: string;
  }

  // Generate options for each dropdown
  const minuteOptions = ['*', ...Array.from({ length: 60 }, (_, i) => i.toString())];
  const hourOptions = ['*', ...Array.from({ length: 24 }, (_, i) => i.toString())];
  const dayOfMonthOptions = ['*', ...Array.from({ length: 31 }, (_, i) => (i + 1).toString())];
  const monthOptions = [
    '*',
    '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'
  ];
  const dayOfWeekOptions = [
    '*', 
    '0', '1', '2', '3', '4', '5', '6'
  ];
  
  // Display names for days and months
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const dayNames = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ];

  // Combine parts into a cron expression and call parent onChange
  useEffect(() => {
    const newCronExpression = `${cronParts.minute} ${cronParts.hour} ${cronParts.dayOfMonth} ${cronParts.month} ${cronParts.dayOfWeek}`;
    onChange(newCronExpression);
  }, [cronParts, onChange]);

  // Update individual cron part
  const updateCronPart = (part: keyof CronParts, value: string) => {
    setCronParts(prev => ({
      ...prev,
      [part]: value
    }));
  };

  return (
    <div className="space-y-4">
      <FormDescription>
        Build your cron expression by selecting values for each field
      </FormDescription>
      
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Minute Selector */}
        <div>
          <FormLabel>Minute</FormLabel>
          <Select
            value={cronParts.minute}
            onValueChange={(value) => updateCronPart('minute', value)}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Minute" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <ScrollArea className="h-72">
                {minuteOptions.map(option => (
                  <SelectItem key={`minute-${option}`} value={option}>
                    {option === '*' ? 'Every minute' : `Minute ${option}`}
                  </SelectItem>
                ))}
              </ScrollArea>
            </SelectContent>
          </Select>
        </div>
        
        {/* Hour Selector */}
        <div>
          <FormLabel>Hour</FormLabel>
          <Select
            value={cronParts.hour}
            onValueChange={(value) => updateCronPart('hour', value)}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Hour" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <ScrollArea className="h-72">
                {hourOptions.map(option => (
                  <SelectItem key={`hour-${option}`} value={option}>
                    {option === '*' ? 'Every hour' : `Hour ${option}`}
                  </SelectItem>
                ))}
              </ScrollArea>
            </SelectContent>
          </Select>
        </div>
        
        {/* Day of Month Selector */}
        <div>
          <FormLabel>Day of Month</FormLabel>
          <Select
            value={cronParts.dayOfMonth}
            onValueChange={(value) => updateCronPart('dayOfMonth', value)}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Day of Month" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <ScrollArea className="h-72">
                {dayOfMonthOptions.map(option => (
                  <SelectItem key={`dom-${option}`} value={option}>
                    {option === '*' ? 'Every day' : `Day ${option}`}
                  </SelectItem>
                ))}
              </ScrollArea>
            </SelectContent>
          </Select>
        </div>
        
        {/* Month Selector */}
        <div>
          <FormLabel>Month</FormLabel>
          <Select
            value={cronParts.month}
            onValueChange={(value) => updateCronPart('month', value)}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Month" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <ScrollArea className="h-72">
                {monthOptions.map((option, index) => (
                  <SelectItem key={`month-${option}`} value={option}>
                    {option === '*' ? 'Every month' : 
                    (Number(option) >= 1 && Number(option) <= 12) ? 
                      `${option} - ${monthNames[Number(option)-1]}` : option}
                  </SelectItem>
                ))}
              </ScrollArea>
            </SelectContent>
          </Select>
        </div>
        
        {/* Day of Week Selector */}
        <div>
          <FormLabel>Day of Week</FormLabel>
          <Select
            value={cronParts.dayOfWeek}
            onValueChange={(value) => updateCronPart('dayOfWeek', value)}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Day of Week" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <ScrollArea className="h-72">
                {dayOfWeekOptions.map((option, index) => (
                  <SelectItem key={`dow-${option}`} value={option}>
                    {option === '*' ? 'Every day' : 
                    (Number(option) >= 0 && Number(option) <= 6) ? 
                      `${option} - ${dayNames[Number(option)]}` : option}
                  </SelectItem>
                ))}
              </ScrollArea>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default CronExpressionBuilder;

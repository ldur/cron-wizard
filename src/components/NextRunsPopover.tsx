
import React from "react";
import { format } from "date-fns";
import { Calendar, Clock, ChevronDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { calculateNextRuns } from "@/utils/cronCalculator";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

interface NextRunsPopoverProps {
  scheduleExpression: string;
  timezone?: string | null;
  startTime?: string;
  endTime?: string;
  status: 'active' | 'paused';
}

const NextRunsPopover: React.FC<NextRunsPopoverProps> = ({
  scheduleExpression,
  timezone,
  startTime,
  endTime,
  status
}) => {
  // Only calculate runs for active jobs
  const nextRuns = status === 'active' 
    ? calculateNextRuns(scheduleExpression, 10, startTime, endTime) 
    : [];

  const formatRunDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      
      // For 24-hour format in European timezones
      const is24HourFormat = timezone?.startsWith("Europe/") || 
                            timezone?.startsWith("Africa/") ||
                            timezone?.includes("CET") || 
                            timezone?.includes("EET") || 
                            timezone?.includes("WET");
      
      // Use 24-hour format (HH) for European timezones, 12-hour (h) for others
      const timeFormat = is24HourFormat ? "HH:mm" : "h:mm a";
      return format(date, `MMM d, yyyy 'at' ${timeFormat}`);
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="p-0 h-auto hover:bg-transparent hover:text-blue-700 flex items-center gap-1"
          disabled={status !== 'active'}
        >
          <Calendar className="h-4 w-4 text-blue-500" />
          <ChevronDown className="h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-3 border-b">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-500" />
            <h3 className="font-medium">Next 10 Scheduled Runs</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {timezone ? `Timezone: ${timezone}` : "Timezone: UTC"}
          </p>
        </div>
        
        {status !== 'active' ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            Job is currently paused.<br />
            Activate it to see scheduled runs.
          </div>
        ) : nextRuns.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            No upcoming runs found within the configured time constraints.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Scheduled Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {nextRuns.map((run, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>{formatRunDate(run)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default NextRunsPopover;

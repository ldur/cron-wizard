import React, { useState, useEffect } from 'react';
import { format } from "date-fns";
import { CalendarIcon, TextQuote, Info } from "lucide-react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Control, useFormContext, useWatch } from "react-hook-form";
import TimeZoneSelect from "@/components/TimeZoneSelect";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import CronExpressionBuilder from "./CronExpressionBuilder";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { parseSchedule } from "@/utils/cronParser";

interface SchedulingFieldsProps {
  control: Control<any>;
}

const SchedulingFields: React.FC<SchedulingFieldsProps> = ({ control }) => {
  const form = useFormContext();
  const [scheduleMode, setScheduleMode] = useState<'builder' | 'manual'>('builder');
  const scheduleExpression = useWatch({ control, name: "scheduleExpression" });
  const [naturalLanguage, setNaturalLanguage] = useState<string>("");
  
  // Update natural language description when cron expression changes
  useEffect(() => {
    if (scheduleExpression) {
      try {
        const description = parseSchedule(scheduleExpression);
        setNaturalLanguage(description);
      } catch (error) {
        console.error("Error parsing cron expression:", error);
        setNaturalLanguage("Invalid cron expression");
      }
    } else {
      setNaturalLanguage("");
    }
  }, [scheduleExpression]);
  
  return (
    <>
      <div className="grid grid-cols-1 gap-4">
        {/* Schedule Expression with Tabs for Builder and Manual Input */}
        <FormField
          control={control}
          name="scheduleExpression"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Schedule Expression</FormLabel>
              <FormControl>
                <Tabs 
                  defaultValue="builder" 
                  className="w-full"
                  onValueChange={(value) => setScheduleMode(value as 'builder' | 'manual')}
                >
                  <TabsList className="mb-2">
                    <TabsTrigger value="builder">Builder</TabsTrigger>
                    <TabsTrigger value="manual">Manual</TabsTrigger>
                  </TabsList>
                  <TabsContent value="builder">
                    <CronExpressionBuilder value={field.value} onChange={field.onChange} />
                  </TabsContent>
                  <TabsContent value="manual">
                    <div className="flex items-center">
                      <TextQuote className="mr-2 h-4 w-4 opacity-70" />
                      <Input placeholder="e.g., 0 0 * * *" {...field} />
                    </div>
                  </TabsContent>
                </Tabs>
              </FormControl>
              {naturalLanguage && (
                <Alert variant="default" className="mt-2 bg-blue-50 border-blue-200">
                  <div className="flex items-center">
                    <Info className="h-4 w-4 text-blue-500 mr-2" />
                    <AlertDescription className="text-blue-700">
                      {naturalLanguage}
                    </AlertDescription>
                  </div>
                </Alert>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Timezone using our new component */}
        <TimeZoneSelect control={control} name="timezone" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Start Time */}
        <FormField
          control={control}
          name="startTime"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Start Time</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP p")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* End Time */}
        <FormField
          control={control}
          name="endTime"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>End Time</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP p")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => {
                      const startTime = form.getValues("startTime");
                      return date < new Date() || (startTime && date < startTime);
                    }}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
};

export default SchedulingFields;

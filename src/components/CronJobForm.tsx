import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchScheduleGroups } from "@/services/scheduleGroupService";
import type { CronJob } from "@/types/CronJob";
import { useQuery } from "@tanstack/react-query";
import { Folder, Calendar, Clock, Globe, Terminal } from "lucide-react";

// Define form validation schema
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  command: z.string().min(1, "Command is required"),
  cronExpression: z.string().min(1, "Cron expression is required"),
  status: z.enum(["active", "paused"]),
  isApi: z.boolean(),
  endpointName: z.string().optional(),
  iacCode: z.string().optional(),
  groupId: z.string().nullable(), // Changed to nullable to properly handle the 'None' value
});

interface CronJobFormProps {
  job?: CronJob;
  onSubmit: (data: z.infer<typeof formSchema>) => void;
  onCancel: () => void;
}

const CronJobForm = ({ job, onSubmit, onCancel }: CronJobFormProps) => {
  const [mode, setMode] = useState<"simple" | "advanced">("simple");
  const [scheduleType, setScheduleType] = useState<"minute" | "hour" | "day" | "week" | "month" | "custom">(
    job?.cronExpression ? "custom" : "hour"
  );

  // Fetch schedule groups
  const { data: scheduleGroups = [], isLoading: isLoadingGroups } = useQuery({
    queryKey: ['scheduleGroups'],
    queryFn: fetchScheduleGroups,
  });

  // Initialize form with default values or existing job data
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: job?.name || "",
      command: job?.command || "",
      cronExpression: job?.cronExpression || "0 * * * *", // Default hourly
      status: job?.status || "active",
      isApi: job?.isApi || false,
      endpointName: job?.endpointName || "",
      iacCode: job?.iacCode || "",
      groupId: job?.groupId || null, // Changed to null for 'None' value
    },
  });

  // Update cron expression based on schedule type
  const updateCronExpression = (type: string) => {
    setScheduleType(type as any);
    
    let expression = "";
    switch (type) {
      case "minute":
        expression = "* * * * *";
        break;
      case "hour":
        expression = "0 * * * *";
        break;
      case "day":
        expression = "0 0 * * *";
        break;
      case "week":
        expression = "0 0 * * 0";
        break;
      case "month":
        expression = "0 0 1 * *";
        break;
      case "custom":
        // Keep the current expression
        return;
    }
    
    form.setValue("cronExpression", expression);
  };

  // Handle form submission
  const handleFormSubmit = (data: z.infer<typeof formSchema>) => {
    // Convert null groupId to undefined for API compatibility
    const formattedData = {
      ...data,
      groupId: data.groupId || undefined,
    };
    onSubmit(formattedData);
  };

  // Helper function to get human-readable schedule description
  const getScheduleDescription = (cronExp: string) => {
    switch (cronExp) {
      case "* * * * *":
        return "Every minute";
      case "0 * * * *":
        return "Every hour";
      case "0 0 * * *":
        return "Every day at midnight";
      case "0 0 * * 0":
        return "Every Sunday at midnight";
      case "0 0 1 * *":
        return "On the 1st of every month at midnight";
      default:
        return "Custom schedule";
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Mode selection */}
        <div className="flex items-center space-x-4 mb-4">
          <Button 
            type="button" 
            variant={mode === "simple" ? "default" : "outline"}
            onClick={() => setMode("simple")}
          >
            Simple
          </Button>
          <Button 
            type="button" 
            variant={mode === "advanced" ? "default" : "outline"}
            onClick={() => setMode("advanced")}
          >
            Advanced
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="My Cron Job" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="command"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Command</FormLabel>
                  <FormControl>
                    <Input placeholder="echo 'Hello, world!'" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {mode === "simple" ? (
              <div className="space-y-4">
                <FormLabel>Schedule</FormLabel>
                <Tabs 
                  value={scheduleType} 
                  onValueChange={updateCronExpression}
                  className="w-full"
                >
                  <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full">
                    <TabsTrigger value="minute">Minute</TabsTrigger>
                    <TabsTrigger value="hour">Hour</TabsTrigger>
                    <TabsTrigger value="day">Day</TabsTrigger>
                    <TabsTrigger value="week">Week</TabsTrigger>
                    <TabsTrigger value="month">Month</TabsTrigger>
                    <TabsTrigger value="custom">Custom</TabsTrigger>
                  </TabsList>
                  <TabsContent value={scheduleType} className="pt-2">
                    <p className="text-sm text-muted-foreground">
                      {getScheduleDescription(form.getValues("cronExpression"))}
                    </p>
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <FormField
                control={form.control}
                name="cronExpression"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cron Expression</FormLabel>
                    <FormControl>
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="* * * * *" {...field} />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Format: minute hour day month weekday
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

          <div className="space-y-6">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Job Type Selection */}
            <FormField
              control={form.control}
              name="isApi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Type</FormLabel>
                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      variant={field.value ? "default" : "outline"}
                      className={field.value ? "bg-blue-500 hover:bg-blue-600" : ""}
                      onClick={() => form.setValue("isApi", true)}
                    >
                      <Globe className="mr-2 h-4 w-4" />
                      API Endpoint
                    </Button>
                    <Button
                      type="button"
                      variant={!field.value ? "default" : "outline"}
                      className={!field.value ? "bg-amber-500 hover:bg-amber-600" : ""}
                      onClick={() => form.setValue("isApi", false)}
                    >
                      <Terminal className="mr-2 h-4 w-4" />
                      Lambda Function
                    </Button>
                  </div>
                  <FormDescription>
                    Select the type of job to run
                  </FormDescription>
                </FormItem>
              )}
            />

            {/* Add group selection */}
            <FormField
              control={form.control}
              name="groupId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Schedule Group</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value || undefined}
                    value={field.value || undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <div className="flex items-center">
                          <Folder className="mr-2 h-4 w-4 text-muted-foreground" />
                          <SelectValue placeholder="Select a schedule group" />
                        </div>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {isLoadingGroups ? (
                        <SelectItem value="loading" disabled>Loading groups...</SelectItem>
                      ) : (
                        scheduleGroups.map((group) => (
                          <SelectItem key={group.id} value={group.id}>
                            {group.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Organize your cron jobs by assigning them to groups
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {form.getValues("isApi") && (
          <FormField
            control={form.control}
            name="endpointName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Endpoint Name</FormLabel>
                <FormControl>
                  <Input placeholder="my-api-endpoint" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="iacCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>IAC Code</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Infrastructure-as-code template" 
                  className="font-mono text-sm h-24"
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Infrastructure as Code template for this job
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4 pt-6">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {job ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CronJobForm;

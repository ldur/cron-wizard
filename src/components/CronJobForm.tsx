
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
import { fetchScheduleGroups } from "@/services/scheduleGroupService";
import type { CronJob } from "@/types/CronJob";
import { useQuery } from "@tanstack/react-query";
import { Folder, Calendar, Clock } from "lucide-react";

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
      cronExpression: job?.cronExpression || "",
      status: job?.status || "active",
      isApi: job?.isApi || false,
      endpointName: job?.endpointName || "",
      iacCode: job?.iacCode || "",
      groupId: job?.groupId || null, // Changed to null for 'None' value
    },
  });

  // Handle form submission
  const handleFormSubmit = (data: z.infer<typeof formSchema>) => {
    // Convert null groupId to undefined for API compatibility
    const formattedData = {
      ...data,
      groupId: data.groupId || undefined,
    };
    onSubmit(formattedData);
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

            {mode === "advanced" && (
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

        <FormField
          control={form.control}
          name="isApi"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Is API?</FormLabel>
                <FormDescription>
                  Enable if this cron job triggers an API endpoint.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

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
                <Input placeholder="infrastructure-as-code-template" {...field} />
              </FormControl>
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

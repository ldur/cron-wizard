
import React, { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Code, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { fetchGroups } from "@/services/cronJobService";
import { CronJob } from "@/types/CronJob";
import { useToast } from "@/hooks/use-toast";
import CronJobIacDialog from "./CronJobIacDialog";
import { parseSchedule, convertToCron } from "@/utils/cronParser";
import { calculateNextRun } from "@/utils/cronCalculator";

interface CronJobFormProps {
  job?: CronJob;
  onSubmit: (job: Omit<CronJob, "id" | "nextRun">) => void;
  onCancel: () => void;
}

const CronJobForm: React.FC<CronJobFormProps> = ({
  job,
  onSubmit,
  onCancel,
}) => {
  const [isIacDialogOpen, setIsIacDialogOpen] = useState(false);
  const [cronMode, setCronMode] = useState<"simple" | "advanced">("simple");
  const [naturalLanguage, setNaturalLanguage] = useState("");
  const [schedulePreview, setSchedulePreview] = useState("");
  const [isApiMode, setIsApiMode] = useState(job?.isApi ?? false);
  const [groups, setGroups] = useState<any[]>([]);
  const { toast } = useToast();
  
  // State for individual cron components
  const [minute, setMinute] = useState("0");
  const [hour, setHour] = useState("0");
  const [dayOfMonth, setDayOfMonth] = useState("*");
  const [month, setMonth] = useState("*");
  const [dayOfWeek, setDayOfWeek] = useState("*");

  // Fetch groups
  useEffect(() => {
    const loadGroups = async () => {
      try {
        const fetchedGroups = await fetchGroups();
        setGroups(fetchedGroups);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load job groups",
          variant: "destructive",
        });
      }
    };
    loadGroups();
  }, []);
  
  // Add the groups field to the form schema
  const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    command: z.string().min(1, "Command is required"),
    cronExpression: z.string().min(1, "Cron expression is required"),
    status: z.enum(["active", "paused"]),
    groupId: z.string().optional(),
    isApi: z.boolean().optional(),
    endpointName: z.string().optional().nullable(),
    iacCode: z.string().optional().nullable(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: job?.name || "",
      command: job?.command || "",
      cronExpression: job?.cronExpression || "0 0 * * *",
      status: job?.status || "active",
      groupId: job?.groupId || groups[0]?.id || undefined,
      isApi: job?.isApi || false,
      endpointName: job?.endpointName || null,
      iacCode: job?.iacCode || null,
    },
  });

  // Parse cron expression into individual components
  const parseCronExpression = (expression: string) => {
    const parts = expression.split(' ');
    if (parts.length === 5) {
      setMinute(parts[0]);
      setHour(parts[1]);
      setDayOfMonth(parts[2]);
      setMonth(parts[3]);
      setDayOfWeek(parts[4]);
    }
  };

  // Update cron expression from individual components
  const updateCronExpression = () => {
    const cronExpression = `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`;
    form.setValue("cronExpression", cronExpression);
  };

  // Update form when job or groups change
  useEffect(() => {
    if (job) {
      form.reset({
        name: job.name,
        command: job.command,
        cronExpression: job.cronExpression,
        status: job.status,
        groupId: job.groupId,
        isApi: job.isApi,
        endpointName: job.endpointName,
        iacCode: job.iacCode,
      });
      setIsApiMode(job.isApi);
      parseCronExpression(job.cronExpression);
    } else {
      // Set default cron values
      parseCronExpression("0 0 * * *");
    }
  }, [job, form, groups]);

  // Update schedule preview when cron expression changes
  useEffect(() => {
    const cronExpression = form.getValues("cronExpression");
    const preview = parseSchedule(cronExpression);
    setSchedulePreview(preview);
    
    // Also update the natural language field if switching to natural language mode
    if (cronMode === "simple") {
      setNaturalLanguage(preview);
    }
    
    // Parse the expression to update individual fields
    parseCronExpression(cronExpression);
  }, [form.getValues("cronExpression"), cronMode]);

  // Handler for natural language input
  const handleNaturalLanguageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setNaturalLanguage(newValue);
    
    // Convert to cron and update the form
    const cronExpression = convertToCron(newValue);
    form.setValue("cronExpression", cronExpression);
    
    // Update the schedule preview
    const preview = parseSchedule(cronExpression);
    setSchedulePreview(preview);
  };
  
  // Helper function to increment/decrement numeric values with boundaries
  const adjustValue = (value: string, increment: boolean, min: number, max: number, allowStar: boolean) => {
    if (value === "*" && !increment) return allowStar ? "*" : min.toString();
    if (value === "*" && increment) return min.toString();
    
    const numValue = parseInt(value);
    if (isNaN(numValue)) return allowStar ? "*" : min.toString();
    
    if (increment) {
      return numValue >= max ? (allowStar ? "*" : max.toString()) : (numValue + 1).toString();
    } else {
      return numValue <= min ? (allowStar ? "*" : min.toString()) : (numValue - 1).toString();
    }
  };

  // Handlers for cron component changes
  const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMinute(e.target.value);
    updateCronExpression();
  };
  
  const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHour(e.target.value);
    updateCronExpression();
  };
  
  const handleDayOfMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDayOfMonth(e.target.value);
    updateCronExpression();
  };
  
  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMonth(e.target.value);
    updateCronExpression();
  };
  
  const handleDayOfWeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDayOfWeek(e.target.value);
    updateCronExpression();
  };

  const onFormSubmit = (values: z.infer<typeof formSchema>) => {
    const { name, command, cronExpression, status, groupId, isApi, endpointName, iacCode } = values;
    onSubmit({
      name,
      command,
      cronExpression,
      status,
      isApi: isApi ?? false,
      endpointName: endpointName ?? null,
      iacCode: iacCode ?? null,
      groupId: groupId ?? undefined,
    });
  };

  const handleIacDialogOpen = () => {
    setIsIacDialogOpen(true);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Name</FormLabel>
                <FormControl>
                  <Input placeholder="Daily Backup" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="groupId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Group</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a group" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {groups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Tabs defaultValue="command" className="space-y-4">
          <TabsList>
            <TabsTrigger value="command">Command</TabsTrigger>
            <TabsTrigger value="iac">
              IaC
              <Code className="w-4 h-4 ml-1" />
            </TabsTrigger>
          </TabsList>
          <TabsContent value="command">
            <FormField
              control={form.control}
              name="command"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Command</FormLabel>
                  <FormControl>
                    <Textarea placeholder="ls -l" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
          <TabsContent value="iac">
            <div className="grid gap-6">
              <Textarea
                className="min-h-[80px]"
                placeholder="Click Generate to create IaC code"
                value={form.getValues("iacCode") || ""}
                readOnly
              />
              <Button type="button" onClick={handleIacDialogOpen}>
                Generate IaC Code
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <Tabs 
          defaultValue="simple" 
          className="space-y-4"
          onValueChange={(value) => setCronMode(value as "simple" | "advanced")}
        >
          <TabsList>
            <TabsTrigger value="simple">Simple</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>
          <TabsContent value="simple">
            <div className="space-y-4">
              <div className="grid gap-3">
                <label className="text-sm font-medium">Schedule in Plain English</label>
                <Input
                  placeholder="Every day at 9am"
                  value={naturalLanguage}
                  onChange={handleNaturalLanguageChange}
                />
              </div>
              
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm font-medium">Schedule Preview:</p>
                <p className="text-sm mt-1">{schedulePreview}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Next run would be around: {new Date(calculateNextRun(form.getValues("cronExpression"))).toLocaleString()}
                </p>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="advanced">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {/* Minute */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Minute (0-59)</label>
                  <div className="flex items-center">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const newValue = adjustValue(minute, false, 0, 59, true);
                        setMinute(newValue);
                        updateCronExpression();
                      }}
                      className="px-2"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    <Input
                      className="mx-1 text-center"
                      value={minute}
                      onChange={handleMinuteChange}
                      placeholder="0"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const newValue = adjustValue(minute, true, 0, 59, true);
                        setMinute(newValue);
                        updateCronExpression();
                      }}
                      className="px-2"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Hour */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Hour (0-23)</label>
                  <div className="flex items-center">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const newValue = adjustValue(hour, false, 0, 23, true);
                        setHour(newValue);
                        updateCronExpression();
                      }}
                      className="px-2"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    <Input
                      className="mx-1 text-center"
                      value={hour}
                      onChange={handleHourChange}
                      placeholder="0"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const newValue = adjustValue(hour, true, 0, 23, true);
                        setHour(newValue);
                        updateCronExpression();
                      }}
                      className="px-2"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Day of Month */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Day (1-31)</label>
                  <div className="flex items-center">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const newValue = adjustValue(dayOfMonth, false, 1, 31, true);
                        setDayOfMonth(newValue);
                        updateCronExpression();
                      }}
                      className="px-2"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    <Input
                      className="mx-1 text-center"
                      value={dayOfMonth}
                      onChange={handleDayOfMonthChange}
                      placeholder="*"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const newValue = adjustValue(dayOfMonth, true, 1, 31, true);
                        setDayOfMonth(newValue);
                        updateCronExpression();
                      }}
                      className="px-2"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Month */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Month (1-12)</label>
                  <div className="flex items-center">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const newValue = adjustValue(month, false, 1, 12, true);
                        setMonth(newValue);
                        updateCronExpression();
                      }}
                      className="px-2"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    <Input
                      className="mx-1 text-center"
                      value={month}
                      onChange={handleMonthChange}
                      placeholder="*"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const newValue = adjustValue(month, true, 1, 12, true);
                        setMonth(newValue);
                        updateCronExpression();
                      }}
                      className="px-2"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Day of Week */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Weekday (0-6)</label>
                  <div className="flex items-center">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const newValue = adjustValue(dayOfWeek, false, 0, 6, true);
                        setDayOfWeek(newValue);
                        updateCronExpression();
                      }}
                      className="px-2"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    <Input
                      className="mx-1 text-center"
                      value={dayOfWeek}
                      onChange={handleDayOfWeekChange}
                      placeholder="*"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const newValue = adjustValue(dayOfWeek, true, 0, 6, true);
                        setDayOfWeek(newValue);
                        updateCronExpression();
                      }}
                      className="px-2"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <FormField
                control={form.control}
                name="cronExpression"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cron Expression</FormLabel>
                    <FormControl>
                      <Input placeholder="0 0 * * *" {...field} onChange={(e) => {
                        field.onChange(e);
                        parseCronExpression(e.target.value);
                      }} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="p-3 bg-muted rounded-md mt-3">
                <p className="text-sm font-medium">Schedule Preview:</p>
                <p className="text-sm mt-1">{schedulePreview}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Next run would be around: {new Date(calculateNextRun(form.getValues("cronExpression"))).toLocaleString()}
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

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

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {job ? "Update Job" : "Create Job"}
          </Button>
        </div>
      </form>

      <CronJobIacDialog
        open={isIacDialogOpen}
        onOpenChange={setIsIacDialogOpen}
        iacCode={form.getValues("iacCode") || ""}
        onSave={(code) => {
          form.setValue("iacCode", code);
          setIsIacDialogOpen(false);
        }}
      />
    </Form>
  );
};

export default CronJobForm;

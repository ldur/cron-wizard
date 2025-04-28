import React, { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Code, ChevronDown, RefreshCw, Clock, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { fetchGroups } from "@/services/cronJobService";
import { CronJob } from "@/types/CronJob";
import { useToast } from "@/hooks/use-toast";
import CronJobIacDialog from "./CronJobIacDialog";
import { parseSchedule, convertToCron } from "@/utils/cronParser";
import { calculateNextRun } from "@/utils/cronCalculator";
import TimeZoneSelect from "./TimeZoneSelect";
import { fetchDefaultTimezone } from "@/services/cronJobService";
import TagInput from './TagInput';
import TargetForm from './TargetForm';

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
  const [cronMode, setCronMode] = useState<"natural" | "advanced">("natural");
  const [naturalLanguage, setNaturalLanguage] = useState("");
  const [schedulePreview, setSchedulePreview] = useState("");
  const [isApiMode, setIsApiMode] = useState(job?.isApi ?? false);
  const [groups, setGroups] = useState<any[]>([]);
  const [defaultTimeZone, setDefaultTimeZone] = useState("Europe/Oslo");
  const { toast } = useToast();
  
  // Flexible time window state
  const [isFlexibleTime, setIsFlexibleTime] = useState(job?.flexibleTimeWindowMode === 'FLEXIBLE');
  
  // State for individual cron components
  const [minute, setMinute] = useState("0");
  const [hour, setHour] = useState("0");
  const [dayOfMonth, setDayOfMonth] = useState("*");
  const [month, setMonth] = useState("*");
  const [dayOfWeek, setDayOfWeek] = useState("*");

  // Update cron expression whenever any of the cron component states change
  useEffect(() => {
    updateCronExpression();
  }, [minute, hour, dayOfMonth, month, dayOfWeek]);

  // Generate options for dropdowns
  const minuteOptions = ["*", ...Array.from({ length: 60 }, (_, i) => i.toString())];
  const hourOptions = ["*", ...Array.from({ length: 24 }, (_, i) => i.toString())];
  const dayOptions = ["*", ...Array.from({ length: 31 }, (_, i) => (i + 1).toString())];
  const monthOptions = ["*", ...Array.from({ length: 12 }, (_, i) => (i + 1).toString())];
  const weekdayOptions = ["*", ...Array.from({ length: 7 }, (_, i) => i.toString())];

  // Common day names for weekdays - fixed the mapping to ensure correct values
  const weekdayNames = {
    "0": "Sunday (0)",
    "1": "Monday (1)",
    "2": "Tuesday (2)",
    "3": "Wednesday (3)",
    "4": "Thursday (4)",
    "5": "Friday (5)",
    "6": "Saturday (6)",
    "*": "Every day (*)"
  };

  // Month names
  const monthNames = {
    "1": "January (1)",
    "2": "February (2)",
    "3": "March (3)",
    "4": "April (4)",
    "5": "May (5)",
    "6": "June (6)",
    "7": "July (7)",
    "8": "August (8)",
    "9": "September (9)",
    "10": "October (10)",
    "11": "November (11)",
    "12": "December (12)",
    "*": "Every month (*)"
  };

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

  // Fetch default timezone on component mount
  useEffect(() => {
    const loadDefaultTimezone = async () => {
      try {
        const timezone = await fetchDefaultTimezone();
        setDefaultTimeZone(timezone);
        if (!job) {
          // Only set the form value if we're creating a new job
          form.setValue("timeZone", timezone);
        }
      } catch (error) {
        console.error("Error loading default timezone:", error);
      }
    };
    loadDefaultTimezone();
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
    timeZone: z.string().optional(),
    tags: z.array(z.string()).default([]),
    flexibleTimeWindowMode: z.enum(["OFF", "FLEXIBLE"]).default("OFF"),
    flexibleWindowMinutes: z.number().nullable().refine(
      (val) => val === null || (val >= 1 && val <= 1440),
      { message: "Minutes must be between 1 and 1440 when in flexible mode" }
    ),
    targetType: z.enum([
      "LAMBDA",
      "STEP_FUNCTION",
      "API_GATEWAY",
      "EVENTBRIDGE",
      "SQS",
      "ECS",
      "KINESIS",
      "SAGEMAKER"
    ]).default("LAMBDA"),
    
    // Target-specific fields with appropriate types
    function_arn: z.string().optional(),
    payload: z.any().optional(),
    state_machine_arn: z.string().optional(),
    execution_role_arn: z.string().optional(),
    input_payload: z.any().optional(),
    endpoint_url: z.string().optional(),
    http_method: z.string().optional(),
    headers: z.any().optional(),
    body: z.any().optional(),
    authorization_type: z.string().optional(),
    event_bus_arn: z.string().optional(),
    event_payload: z.any().optional(),
    queue_url: z.string().optional(),
    message_body: z.string().optional(),
    message_group_id: z.string().optional(),
    cluster_arn: z.string().optional(),
    task_definition_arn: z.string().optional(),
    launch_type: z.string().optional(),
    network_configuration: z.any().optional(),
    overrides: z.any().optional(),
    stream_arn: z.string().optional(),
    partition_key: z.string().optional(),
    training_job_definition_arn: z.string().optional(),
    hyper_parameters: z.any().optional(),
    input_data_config: z.any().optional(),
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
      timeZone: job?.timeZone || defaultTimeZone,
      tags: job?.tags || [],
      flexibleTimeWindowMode: job?.flexibleTimeWindowMode || "OFF",
      flexibleWindowMinutes: job?.flexibleWindowMinutes || null,
      targetType: job?.targetType || "LAMBDA",
    },
  });

  // Handle flexible time window mode change
  const handleFlexibleModeChange = (checked: boolean) => {
    setIsFlexibleTime(checked);
    const newMode = checked ? "FLEXIBLE" : "OFF";
    form.setValue("flexibleTimeWindowMode", newMode);
    
    // Reset flexibleWindowMinutes when turning off flexible mode
    if (!checked) {
      form.setValue("flexibleWindowMinutes", null);
    } else if (!form.getValues("flexibleWindowMinutes")) {
      // Set a default value when enabling flexible mode
      form.setValue("flexibleWindowMinutes", 15);
    }
  };

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
    try {
      const cronExpression = `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`;
      form.setValue("cronExpression", cronExpression); // Update form value

      // Also update the preview
      const preview = parseSchedule(cronExpression);
      setSchedulePreview(preview);

      // Trigger re-render for immediate UI update
      form.trigger("cronExpression");
    } catch (error) {
      console.error("Error updating cron expression:", error);
      toast({
        title: "Error",
        description: "Failed to update cron expression",
        variant: "destructive",
      });
    }
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
        timeZone: job.timeZone,
        tags: job.tags,
        flexibleTimeWindowMode: job.flexibleTimeWindowMode,
        flexibleWindowMinutes: job.flexibleWindowMinutes,
        targetType: job.targetType,
      });
      setIsApiMode(job.isApi);
      setIsFlexibleTime(job.flexibleTimeWindowMode === 'FLEXIBLE');
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
    if (cronMode === "natural") {
      setNaturalLanguage(preview);
    }
    
    // Parse the expression to update individual fields
    parseCronExpression(cronExpression);
  }, [form.watch("cronExpression"), cronMode]);

  // Handler for natural language input
  const handleNaturalLanguageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Update the natural language state without processing
    setNaturalLanguage(e.target.value.replace(/(AM|PM)/gi, "").trim());
  };

  // Handler for keypress events in the input field
  const handleNaturalLanguageKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent form submission
      applyNaturalLanguage(); // Process the input
    }
  };

  // Apply natural language update
  const applyNaturalLanguage = () => {
    if (!naturalLanguage.trim()) {
      toast({
        title: "Error",
        description: "Natural language input cannot be empty",
        variant: "destructive", // Changed to a valid variant
      });
      return;
    }
  
    try {
      // Remove the extra locale and timeFormat arguments
      const cronExpression = convertToCron(naturalLanguage.trim());
  
      form.setValue("cronExpression", cronExpression);
  
      // Update the schedule preview
      const preview = parseSchedule(cronExpression);
      setSchedulePreview(preview);
  
      toast({
        title: "Schedule Updated",
        description: `Natural language "${naturalLanguage}" was converted to cron expression`,
        variant: "default", // Changed to a valid variant
      });
    } catch (error) {
      console.error("Error converting natural language to cron:", error);
      toast({
        title: "Error",
        description: "Could not convert natural language to cron expression. Check your input.",
        variant: "destructive",
      });
    }
  };

  // Dropdown select handlers (no need to call updateCronExpression here)
  const handleMinuteSelect = (value: string) => {
    setMinute(value);
  };

  const handleHourSelect = (value: string) => {
    setHour(value);
  };

  const handleDayOfMonthSelect = (value: string) => {
    setDayOfMonth(value);
  };

  const handleMonthSelect = (value: string) => {
    setMonth(value);
  };

  const handleDayOfWeekSelect = (value: string) => {
    setDayOfWeek(value);
  };

  const onFormSubmit = async (values: z.infer<typeof formSchema>) => {
    // Create a new object with all required fields ensuring they aren't undefined
    const submissionData: Omit<CronJob, "id" | "nextRun"> = {
      name: values.name,
      command: values.command,
      cronExpression: values.cronExpression,
      status: values.status,
      isApi: values.isApi ?? false,
      endpointName: values.endpointName ?? null,
      iacCode: values.iacCode ?? null,
      groupId: values.groupId,
      timeZone: values.timeZone ?? null,
      tags: values.tags ?? [],
      flexibleTimeWindowMode: values.flexibleTimeWindowMode,
      flexibleWindowMinutes: values.flexibleWindowMinutes,
      targetType: values.targetType
    };

    // Add target-specific fields based on the target type
    switch (values.targetType) {
      case 'LAMBDA':
        if (values.function_arn) submissionData.function_arn = values.function_arn;
        if (values.payload !== undefined) submissionData.payload = values.payload;
        break;
      case 'STEP_FUNCTION':
        if (values.state_machine_arn) submissionData.state_machine_arn = values.state_machine_arn;
        if (values.execution_role_arn) submissionData.execution_role_arn = values.execution_role_arn;
        if (values.input_payload !== undefined) submissionData.input_payload = values.input_payload;
        break;
      case 'API_GATEWAY':
        if (values.endpoint_url) submissionData.endpoint_url = values.endpoint_url;
        if (values.http_method) submissionData.http_method = values.http_method;
        if (values.headers !== undefined) submissionData.headers = values.headers;
        if (values.body !== undefined) submissionData.body = values.body;
        if (values.authorization_type) submissionData.authorization_type = values.authorization_type;
        break;
      case 'EVENTBRIDGE':
        if (values.event_bus_arn) submissionData.event_bus_arn = values.event_bus_arn;
        if (values.event_payload !== undefined) submissionData.event_payload = values.event_payload;
        break;
      case 'SQS':
        if (values.queue_url) submissionData.queue_url = values.queue_url;
        if (values.message_body) submissionData.message_body = values.message_body;
        if (values.message_group_id) submissionData.message_group_id = values.message_group_id;
        break;
      case 'ECS':
        if (values.cluster_arn) submissionData.cluster_arn = values.cluster_arn;
        if (values.task_definition_arn) submissionData.task_definition_arn = values.task_definition_arn;
        if (values.launch_type) submissionData.launch_type = values.launch_type;
        if (values.network_configuration !== undefined) submissionData.network_configuration = values.network_configuration;
        if (values.overrides !== undefined) submissionData.overrides = values.overrides;
        break;
      case 'KINESIS':
        if (values.stream_arn) submissionData.stream_arn = values.stream_arn;
        if (values.partition_key) submissionData.partition_key = values.partition_key;
        if (values.payload !== undefined) submissionData.payload = values.payload;
        break;
      case 'SAGEMAKER':
        if (values.training_job_definition_arn) submissionData.training_job_definition_arn = values.training_job_definition_arn;
        if (values.hyper_parameters !== undefined) submissionData.hyper_parameters = values.hyper_parameters;
        if (values.input_data_config !== undefined) submissionData.input_data_config = values.input_data_config;
        break;
    }

    // Submit the form with all required data
    onSubmit(submissionData);
  };

  const handleIacDialogOpen = () => {
    setIsIacDialogOpen(true);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          {/* Left Panel */}
          <div className="space-y-6">
            <div className="grid gap-6">
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
              defaultValue="natural" 
              className="space-y-4"
              onValueChange={(value) => setCronMode(value as "natural" | "advanced")}
            >
              <TabsList>
                <TabsTrigger value="natural">Natural Language</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>
              <TabsContent value="natural">
                <div className="space-y-4">
                  <div className="grid gap-3">
                    <label className="text-sm font-medium">Schedule in Plain English</label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Every day at 9am"
                        value={naturalLanguage}
                        onChange={handleNaturalLanguageChange}
                        onKeyPress={handleNaturalLanguageKeyPress}
                        className="flex-1"
                      />
                      <Button type="button" onClick={applyNaturalLanguage} variant="outline" size="icon">
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-muted rounded-md">
                    <p className="text-sm font-medium">Schedule Preview:</p>
                    <p className="text-sm mt-1">{schedulePreview}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Next run would be around: {new Date(calculateNextRun(form.getValues("cronExpression"))).toLocaleString()}
                    </p>
                    <div className="mt-2 pt-2 border-t border-border">
                      <p className="text-sm font-medium">Cron Expression:</p>
                      <code className="text-xs bg-muted-foreground/10 px-1 py-0.5 rounded">
                        {form.getValues("cronExpression")}
                      </code>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="advanced">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {/* Minute */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Minute (0-59)</label>
                      <Select 
                        value={minute} 
                        onValueChange={handleMinuteSelect}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select minute" />
                        </SelectTrigger>
                        <SelectContent className="max-h-80 overflow-y-auto">
                          {minuteOptions.map((value) => (
                            <SelectItem key={`minute-${value}`} value={value}>
                              {value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Hour */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Hour (0-23)</label>
                      <Select 
                        value={hour} 
                        onValueChange={handleHourSelect}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select hour" />
                        </SelectTrigger>
                        <SelectContent className="max-h-80 overflow-y-auto">
                          {hourOptions.map((value) => (
                            <SelectItem key={`hour-${value}`} value={value}>
                              {value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Day of Month */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Day (1-31)</label>
                      <Select 
                        value={dayOfMonth} 
                        onValueChange={handleDayOfMonthSelect}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select day" />
                        </SelectTrigger>
                        <SelectContent className="max-h-80 overflow-y-auto">
                          {dayOptions.map((value) => (
                            <SelectItem key={`day-${value}`} value={value}>
                              {value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Month */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Month (1-12)</label>
                      <Select 
                        value={month} 
                        onValueChange={handleMonthSelect}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select month" />
                        </SelectTrigger>
                        <SelectContent className="max-h-80 overflow-y-auto">
                          {monthOptions.map((value) => (
                            <SelectItem key={`month-${value}`} value={value}>
                              {monthNames[value as keyof typeof monthNames] || value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Day of Week */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Weekday (0-6)</label>
                      <Select 
                        value={dayOfWeek} 
                        onValueChange={handleDayOfWeekSelect}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select weekday" />
                        </SelectTrigger>
                        <SelectContent className="max-h-80 overflow-y-auto">
                          {weekdayOptions.map((value) => (
                            <SelectItem key={`weekday-${value}`} value={value}>
                              {weekdayNames[value as keyof typeof weekdayNames] || value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="p-3 bg-muted rounded-md mt-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium">Cron Expression:</p>
                        <code className="text-xs bg-muted-foreground/10 px-1 py-0.5 rounded">
                          {form.watch("cronExpression")} {/* Dynamically watch the cronExpression */}
                        </code>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-border">
                      <p className="text-sm font-medium">Schedule Preview:</p>
                      <p className="text-sm mt-1">{schedulePreview}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Next run would be around: {new Date(calculateNextRun(form.watch("cronExpression"))).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="grid gap-6 md:grid-cols-2">
              <TimeZoneSelect control={form.control} name="timeZone" />
              
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
            </div>

            <div className="border rounded-md p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="text-base font-medium">Flexible Time Window</h3>
                  <p className="text-sm text-muted-foreground">
                    Allow the schedule to run within a flexible time window
                  </p>
                </div>
                <FormField
                  control={form.control}
                  name="flexibleTimeWindowMode"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Switch 
                          checked={isFlexibleTime}
                          onCheckedChange={handleFlexibleModeChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              {isFlexibleTime && (
                <FormField
                  control={form.control}
                  name="flexibleWindowMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2">
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            max={1440}
                            placeholder="15"
                            {...field}
                            value={field.value === null ? '' : field.value}
                            onChange={(e) => {
                              const val = e.target.value !== '' ? parseInt(e.target.value, 10) : null;
                              field.onChange(val);
                            }}
                            className="w-24"
                          />
                        </FormControl>
                        <span>minutes</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        <Clock className="inline h-3 w-3 mr-1" />
                        Job can start anytime within this window after the scheduled time
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <TagInput 
                      tags={field.value} 
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Right Panel */}
          <div className="space-y-6 border-l pl-6">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Target Configuration</h2>
              <FormField
                control={form.control}
                name="targetType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Type</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        form.reset({
                          ...form.getValues(),
                          targetType: value as any,
                          function_arn: undefined,
                          payload: undefined,
                          state_machine_arn: undefined,
                          execution_role_arn: undefined,
                        });
                      }} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select target type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="LAMBDA">Lambda Function</SelectItem>
                        <SelectItem value="STEP_FUNCTION">Step Function</SelectItem>
                        <SelectItem value="API_GATEWAY">API Gateway</SelectItem>
                        <SelectItem value="EVENTBRIDGE">EventBridge</SelectItem>
                        <SelectItem value="SQS">Simple Queue Service</SelectItem>
                        <SelectItem value="ECS">Elastic Container Service</SelectItem>
                        <SelectItem value="KINESIS">Kinesis</SelectItem>
                        <SelectItem value="SAGEMAKER">SageMaker</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="mt-6">
                <TargetForm targetType={form.watch("targetType")} form={form} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-6">
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

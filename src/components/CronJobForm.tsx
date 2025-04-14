
import React, { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Code, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
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

  // Generate options for dropdowns
  const minuteOptions = ["*", ...Array.from({ length: 60 }, (_, i) => i.toString())];
  const hourOptions = ["*", ...Array.from({ length: 24 }, (_, i) => i.toString())];
  const dayOptions = ["*", ...Array.from({ length: 31 }, (_, i) => (i + 1).toString())];
  const monthOptions = ["*", ...Array.from({ length: 12 }, (_, i) => (i + 1).toString())];
  const weekdayOptions = ["*", ...Array.from({ length: 7 }, (_, i) => i.toString())];

  // Common day names for weekdays
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

    // Also update the preview
    const preview = parseSchedule(cronExpression);
    setSchedulePreview(preview);
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

  // Dropdown select handlers
  const handleMinuteSelect = (value: string) => {
    setMinute(value);
    updateCronExpression();
  };

  const handleHourSelect = (value: string) => {
    setHour(value);
    updateCronExpression();
  };

  const handleDayOfMonthSelect = (value: string) => {
    setDayOfMonth(value);
    updateCronExpression();
  };

  const handleMonthSelect = (value: string) => {
    setMonth(value);
    updateCronExpression();
  };

  const handleDayOfWeekSelect = (value: string) => {
    setDayOfWeek(value);
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
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                          <span>{minute}</span>
                          <ChevronDown className="h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-48 p-0">
                        <div className="max-h-60 overflow-y-auto">
                          {minuteOptions.map((value) => (
                            <button
                              key={value}
                              className={`w-full px-4 py-2 text-left hover:bg-accent ${
                                value === minute ? "bg-accent" : ""
                              }`}
                              onClick={() => handleMinuteSelect(value)}
                            >
                              {value}
                            </button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                    <div className="relative w-full">
                      <Input
                        value={minute}
                        onChange={handleMinuteChange}
                        placeholder="0"
                        className="mt-2 w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Hour */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Hour (0-23)</label>
                  <div className="flex items-center">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                          <span>{hour}</span>
                          <ChevronDown className="h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-48 p-0">
                        <div className="max-h-60 overflow-y-auto">
                          {hourOptions.map((value) => (
                            <button
                              key={value}
                              className={`w-full px-4 py-2 text-left hover:bg-accent ${
                                value === hour ? "bg-accent" : ""
                              }`}
                              onClick={() => handleHourSelect(value)}
                            >
                              {value}
                            </button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                    <div className="relative w-full">
                      <Input
                        value={hour}
                        onChange={handleHourChange}
                        placeholder="0"
                        className="mt-2 w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Day of Month */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Day (1-31)</label>
                  <div className="flex items-center">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                          <span>{dayOfMonth}</span>
                          <ChevronDown className="h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-48 p-0">
                        <div className="max-h-60 overflow-y-auto">
                          {dayOptions.map((value) => (
                            <button
                              key={value}
                              className={`w-full px-4 py-2 text-left hover:bg-accent ${
                                value === dayOfMonth ? "bg-accent" : ""
                              }`}
                              onClick={() => handleDayOfMonthSelect(value)}
                            >
                              {value}
                            </button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                    <div className="relative w-full">
                      <Input
                        value={dayOfMonth}
                        onChange={handleDayOfMonthChange}
                        placeholder="*"
                        className="mt-2 w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Month */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Month (1-12)</label>
                  <div className="flex items-center">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                          <span>{monthNames[month as keyof typeof monthNames] || month}</span>
                          <ChevronDown className="h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64 p-0">
                        <div className="max-h-60 overflow-y-auto">
                          {monthOptions.map((value) => (
                            <button
                              key={value}
                              className={`w-full px-4 py-2 text-left hover:bg-accent ${
                                value === month ? "bg-accent" : ""
                              }`}
                              onClick={() => handleMonthSelect(value)}
                            >
                              {monthNames[value as keyof typeof monthNames] || value}
                            </button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                    <div className="relative w-full">
                      <Input
                        value={month}
                        onChange={handleMonthChange}
                        placeholder="*"
                        className="mt-2 w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Day of Week */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Weekday (0-6)</label>
                  <div className="flex items-center">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                          <span>{weekdayNames[dayOfWeek as keyof typeof weekdayNames] || dayOfWeek}</span>
                          <ChevronDown className="h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64 p-0">
                        <div className="max-h-60 overflow-y-auto">
                          {weekdayOptions.map((value) => (
                            <button
                              key={value}
                              className={`w-full px-4 py-2 text-left hover:bg-accent ${
                                value === dayOfWeek ? "bg-accent" : ""
                              }`}
                              onClick={() => handleDayOfWeekSelect(value)}
                            >
                              {weekdayNames[value as keyof typeof weekdayNames] || value}
                            </button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                    <div className="relative w-full">
                      <Input
                        value={dayOfWeek}
                        onChange={handleDayOfWeekChange}
                        placeholder="*"
                        className="mt-2 w-full"
                      />
                    </div>
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

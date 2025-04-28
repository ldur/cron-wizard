import React from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form"
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Timezone } from 'timezone-support';
import { getAllTimezones, findTimezone } from 'timezone-support/lookup';
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from "react-router-dom";
import { Database } from '@/integrations/supabase/types';
import { supabase } from "@/integrations/supabase/client";
import { CronJob } from "@/types/CronJob";
import TargetForm from './TargetForm';

import * as z from "zod"

const cronJobSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, {
    message: "Name must be at least 3 characters.",
  }),
  description: z.string().optional(),
  scheduleExpression: z.string().min(1, {
    message: "Schedule expression is required.",
  }),
  startTime: z.date().optional(),
  endTime: z.date().optional(),
  status: z.enum(['active', 'paused']),
  isApi: z.boolean().default(false),
  endpointName: z.string().nullable().optional(),
  iacCode: z.string().nullable().optional(),
  groupId: z.string().optional(),
  timezone: z.string().optional(),
  tags: z.array(z.string()).default([]),
  flexibleTimeWindowMode: z.enum(['OFF', 'FLEXIBLE']).default('OFF'),
  flexibleWindowMinutes: z.number().nullable().optional(),
  targetType: z.enum(['LAMBDA', 'STEP_FUNCTION', 'API_GATEWAY', 'EVENTBRIDGE', 'SQS', 'ECS', 'KINESIS', 'SAGEMAKER']),

  // Target-specific fields (optional)
  // Lambda
  function_arn: z.string().optional(),
  payload: z.any().optional(),

  // Step Function
  state_machine_arn: z.string().optional(),
  execution_role_arn: z.string().optional(),
  input_payload: z.any().optional(),

  // API Gateway
  endpoint_url: z.string().optional(),
  http_method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']).optional(),
  headers: z.any().optional(),
  body: z.any().optional(),
  authorization_type: z.enum(['NONE', 'IAM', 'COGNITO_USER_POOLS']).optional(),

  // EventBridge
  event_bus_arn: z.string().optional(),
  event_payload: z.any().optional(),

  // SQS
  queue_url: z.string().optional(),
  message_body: z.string().optional(),
  message_group_id: z.string().optional(),

  // ECS
  cluster_arn: z.string().optional(),
  task_definition_arn: z.string().optional(),
  launch_type: z.enum(['FARGATE', 'EC2']).optional(),
  network_configuration: z.any().optional(),
  overrides: z.any().optional(),

  // Kinesis
  stream_arn: z.string().optional(),
  partition_key: z.string().optional(),

  // SageMaker
  training_job_definition_arn: z.string().optional(),
  hyper_parameters: z.any().optional(),
  input_data_config: z.any().optional(),
})

interface CronJobFormProps {
  initialValues?: CronJob;
  groupId?: string;
  groupName?: string;
  onSuccess?: () => void;
}

const timezones = getAllTimezones();

const CronJobForm: React.FC<CronJobFormProps> = ({ initialValues, groupId, groupName, onSuccess }) => {
  const navigate = useNavigate();
  const { toast } = useToast()

  const form = useForm<z.infer<typeof cronJobSchema>>({
    resolver: zodResolver(cronJobSchema),
    defaultValues: {
      id: initialValues?.id || uuidv4(),
      name: initialValues?.name || "",
      description: initialValues?.description || "",
      scheduleExpression: initialValues?.scheduleExpression || "",
      startTime: initialValues?.startTime ? new Date(initialValues.startTime) : undefined,
      endTime: initialValues?.endTime ? new Date(initialValues.endTime) : undefined,
      status: initialValues?.status || "active",
      isApi: initialValues?.isApi || false,
      endpointName: initialValues?.endpointName || null,
      iacCode: initialValues?.iacCode || null,
      groupId: initialValues?.groupId || groupId,
      groupName: initialValues?.groupName || groupName,
      timezone: initialValues?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      tags: initialValues?.tags || [],
      flexibleTimeWindowMode: initialValues?.flexibleTimeWindowMode || 'OFF',
      flexibleWindowMinutes: initialValues?.flexibleWindowMinutes || null,
      targetType: initialValues?.targetType || 'LAMBDA',

      // Target-specific fields (optional)
      // Lambda
      function_arn: initialValues?.function_arn || "",
      payload: initialValues?.payload || null,

      // Step Function
      state_machine_arn: initialValues?.state_machine_arn || "",
      execution_role_arn: initialValues?.execution_role_arn || "",
      input_payload: initialValues?.input_payload || null,

      // API Gateway
      endpoint_url: initialValues?.endpoint_url || "",
      http_method: initialValues?.http_method || undefined,
      headers: initialValues?.headers || null,
      body: initialValues?.body || null,
      authorization_type: initialValues?.authorization_type || undefined,

      // EventBridge
      event_bus_arn: initialValues?.event_bus_arn || "",
      event_payload: initialValues?.event_payload || null,

      // SQS
      queue_url: initialValues?.queue_url || "",
      message_body: initialValues?.message_body || "",
      message_group_id: initialValues?.message_group_id || "",

      // ECS
      cluster_arn: initialValues?.cluster_arn || "",
      task_definition_arn: initialValues?.task_definition_arn || "",
      launch_type: initialValues?.launch_type || undefined,
      network_configuration: initialValues?.network_configuration || null,
      overrides: initialValues?.overrides || null,

      // Kinesis
      stream_arn: initialValues?.stream_arn || "",
      partition_key: initialValues?.partition_key || "",

      // SageMaker
      training_job_definition_arn: initialValues?.training_job_definition_arn || "",
      hyper_parameters: initialValues?.hyper_parameters || null,
      input_data_config: initialValues?.input_data_config || null,
    },
  });

  const onSubmit = async (values: z.infer<typeof cronJobSchema>) => {
    try {
      // Generic cron job data
      const cronJobData: Database['public']['Tables']['cron_jobs']['Insert'] = {
        id: values.id || uuidv4(),
        name: values.name,
        description: values.description,
        schedule_expression: values.scheduleExpression,
        start_time: values.startTime?.toISOString() || null,
        end_time: values.endTime?.toISOString() || null,
        status: values.status,
        is_api: values.isApi,
        endpoint_name: values.endpointName,
        iac_code: values.iacCode,
        group_id: values.groupId,
        timezone: values.timezone,
        tags: values.tags,
        flexible_time_window_mode: values.flexibleTimeWindowMode,
        flexible_window_minutes: values.flexibleWindowMinutes,
        command: values.scheduleExpression, // TODO: Remove this field
        target_type: values.targetType,
      };

      // Target-specific data
      let targetTable: string | null = null;
      let targetData: any = {};

      switch (values.targetType) {
        case 'LAMBDA':
          targetTable = 'lambda_targets';
          targetData = {
            id: values.id || uuidv4(),
            function_arn: values.function_arn,
            payload: values.payload,
          };
          break;
        case 'STEP_FUNCTION':
          targetTable = 'stepfunction_targets';
          targetData = {
            id: values.id || uuidv4(),
            state_machine_arn: values.state_machine_arn,
            execution_role_arn: values.execution_role_arn,
            input_payload: values.input_payload,
          };
          break;
        case 'API_GATEWAY':
          targetTable = 'api_gateway_targets';
          targetData = {
            id: values.id || uuidv4(),
            endpoint_url: values.endpoint_url,
            http_method: values.http_method,
            headers: values.headers,
            body: values.body,
            authorization_type: values.authorization_type,
          };
          break;
        case 'EVENTBRIDGE':
          targetTable = 'eventbridge_targets';
          targetData = {
            id: values.id || uuidv4(),
            event_bus_arn: values.event_bus_arn,
            event_payload: values.event_payload,
          };
          break;
        case 'SQS':
          targetTable = 'sqs_targets';
          targetData = {
            id: values.id || uuidv4(),
            queue_url: values.queue_url,
            message_body: values.message_body,
            message_group_id: values.message_group_id,
          };
          break;
        case 'ECS':
          targetTable = 'ecs_targets';
          targetData = {
            id: values.id || uuidv4(),
            cluster_arn: values.cluster_arn,
            task_definition_arn: values.task_definition_arn,
            launch_type: values.launch_type,
            network_configuration: values.network_configuration,
            overrides: values.overrides,
          };
          break;
        case 'KINESIS':
          targetTable = 'kinesis_targets';
          targetData = {
            id: values.id || uuidv4(),
            stream_arn: values.stream_arn,
            partition_key: values.partition_key,
            payload: values.payload,
          };
          break;
        case 'SAGEMAKER':
          targetTable = 'sagemaker_targets';
          targetData = {
            id: values.id || uuidv4(),
            training_job_definition_arn: values.training_job_definition_arn,
            hyper_parameters: values.hyper_parameters,
            input_data_config: values.input_data_config,
          };
          break;
        default:
          console.warn('Unknown target type:', values.targetType);
          break;
      }

      if (initialValues) {
        // Update existing cron job
        const { error: cronJobError } = await supabase
          .from('cron_jobs')
          .update(cronJobData)
          .eq('id', values.id);

        if (cronJobError) {
          console.error('Error updating cron job:', cronJobError);
          toast({
            title: "Error updating cron job",
            description: "Failed to update the cron job. Please try again.",
            variant: "destructive",
          });
          return;
        }

        if (targetTable) {
          const { error: targetError } = await supabase
            .from(targetTable)
            .update(targetData)
            .eq('id', values.id);

          if (targetError) {
            console.error(`Error updating ${targetTable}:`, targetError);
            toast({
              title: `Error updating ${targetTable}`,
              description: `Failed to update the ${targetTable}. Please try again.`,
              variant: "destructive",
            });
            return;
          }
        }
      } else {
        // Create new cron job
        const { error: cronJobError } = await supabase
          .from('cron_jobs')
          .insert(cronJobData);

        if (cronJobError) {
          console.error('Error creating cron job:', cronJobError);
          toast({
            title: "Error creating cron job",
            description: "Failed to create the cron job. Please try again.",
            variant: "destructive",
          });
          return;
        }

        if (targetTable) {
          const { error: targetError } = await supabase
            .from(targetTable)
            .insert(targetData);

          if (targetError) {
            console.error(`Error creating ${targetTable}:`, targetError);
            toast({
              title: `Error creating ${targetTable}`,
              description: `Failed to create the ${targetTable}. Please try again.`,
              variant: "destructive",
            });
            return;
          }
        }
      }

      toast({
        title: "Success",
        description: initialValues ? "Cron job updated successfully." : "Cron job created successfully.",
      });
      onSuccess?.();
      navigate("/");
    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        title: "Submission Error",
        description: "An unexpected error occurred. Please check the console for details.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Cron Job Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Status */}
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

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Write a description for this cron job."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Schedule Expression */}
          <FormField
            control={form.control}
            name="scheduleExpression"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Schedule Expression</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., 0 0 * * *" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Timezone */}
          <FormField
            control={form.control}
            name="timezone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Timezone</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a timezone" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="max-h-96 overflow-y-auto">
                    {timezones.map((timezone) => (
                      <SelectItem key={timezone} value={timezone}>
                        {timezone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Start Time */}
          <FormField
            control={form.control}
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
                          "w-[240px] pl-3 text-left font-normal",
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
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date()
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* End Time */}
          <FormField
            control={form.control}
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
                          "w-[240px] pl-3 text-left font-normal",
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
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date() || (form.getValues("startTime") && date < form.getValues("startTime"))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Flexible Time Window */}
        <div>
          <FormLabel>Flexible Time Window</FormLabel>
          <div className="flex items-center space-x-2">
            <FormField
              control={form.control}
              name="flexibleTimeWindowMode"
              render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="OFF">Off</SelectItem>
                      <SelectItem value="FLEXIBLE">Flexible</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {form.getValues("flexibleTimeWindowMode") === "FLEXIBLE" && (
              <FormField
                control={form.control}
                name="flexibleWindowMinutes"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormControl>
                      <Slider
                        defaultValue={[field.value || 0]}
                        max={60}
                        step={1}
                        onValueChange={(value) => field.onChange(value[0])}
                        aria-label="Flexible Window Minutes"
                      />
                    </FormControl>
                    <div className="mt-2 text-sm text-muted-foreground">
                      {field.value || 0} minutes
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              )}
          </div>
        </div>

        {/* Target Type */}
        <FormField
          control={form.control}
          name="targetType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Target Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a target type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="LAMBDA">Lambda Function</SelectItem>
                  <SelectItem value="STEP_FUNCTION">Step Function</SelectItem>
                  <SelectItem value="API_GATEWAY">API Gateway</SelectItem>
                  <SelectItem value="EVENTBRIDGE">EventBridge</SelectItem>
                  <SelectItem value="SQS">SQS</SelectItem>
                  <SelectItem value="ECS">ECS</SelectItem>
                  <SelectItem value="KINESIS">Kinesis</SelectItem>
                  <SelectItem value="SAGEMAKER">SageMaker</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Target Form */}
        <TargetForm 
          form={form}
          targetType={form.watch("targetType")}
        />

        {/* Group ID (Conditionally rendered if creating a new cron job within a group) */}
        {groupId && (
          <FormField
            control={form.control}
            name="groupId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Group ID</FormLabel>
                <FormControl>
                  <Input placeholder="Group ID" {...field} disabled />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Group Name (Conditionally rendered if creating a new cron job within a group) */}
        {groupName && (
          <FormField
            control={form.control}
            name="groupName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Group Name</FormLabel>
                <FormControl>
                  <Input placeholder="Group Name" {...field} disabled />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Submit Button */}
        <Button type="submit" className="w-full">
          {initialValues ? "Update Cron Job" : "Create Cron Job"}
        </Button>
      </form>
    </Form>
  );
};

export default CronJobForm;

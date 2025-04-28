
import React from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from "react-router-dom";
import { CronJob } from "@/types/CronJob";
import TargetForm from './TargetForm';
import * as z from "zod";
import GeneralFormFields from './cronJob/GeneralFormFields';
import SchedulingFields from './cronJob/SchedulingFields';
import TargetTypeField from './cronJob/TargetTypeField';
import GroupFields from './cronJob/GroupFields';
import { submitCronJob } from '@/services/cronJobFormService';
import { findTimeZone, getTimeZones } from 'timezone-support';

// Import schema definition
import { cronJobSchema } from '@/schemas/cronJobSchema';

interface CronJobFormProps {
  initialValues?: CronJob;
  job?: CronJob; // Added to match usage in Index.tsx
  groupId?: string;
  groupName?: string;
  onSuccess?: () => void;
  onSubmit?: (values: CronJob) => void; // Updated type to match what's expected
  onCancel?: () => void;
}

const timezones = getTimeZones();

const CronJobForm: React.FC<CronJobFormProps> = ({ 
  initialValues, 
  job, 
  groupId, 
  groupName, 
  onSuccess, 
  onSubmit: externalSubmit, 
  onCancel 
}) => {
  // Use job prop if provided, otherwise use initialValues
  const jobData = job || initialValues;
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof cronJobSchema>>({
    resolver: zodResolver(cronJobSchema),
    defaultValues: {
      id: jobData?.id || uuidv4(),
      name: jobData?.name || "",
      description: jobData?.description || "",
      scheduleExpression: jobData?.scheduleExpression || "",
      startTime: jobData?.startTime ? new Date(jobData.startTime) : undefined,
      endTime: jobData?.endTime ? new Date(jobData.endTime) : undefined,
      status: jobData?.status || "active",
      isApi: jobData?.isApi || false,
      endpointName: jobData?.endpointName || null,
      iacCode: jobData?.iacCode || null,
      groupId: jobData?.groupId || groupId,
      timezone: jobData?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      tags: jobData?.tags || [],
      flexibleTimeWindowMode: jobData?.flexibleTimeWindowMode || 'OFF',
      flexibleWindowMinutes: jobData?.flexibleWindowMinutes || null,
      targetType: jobData?.targetType || 'LAMBDA',

      // Target-specific fields
      function_arn: jobData?.function_arn || "",
      payload: jobData?.payload || null,
      state_machine_arn: jobData?.state_machine_arn || "",
      execution_role_arn: jobData?.execution_role_arn || "",
      input_payload: jobData?.input_payload || null,
      endpoint_url: jobData?.endpoint_url || "",
      http_method: jobData?.http_method || undefined,
      headers: jobData?.headers || null,
      body: jobData?.body || null,
      authorization_type: jobData?.authorization_type || undefined,
      event_bus_arn: jobData?.event_bus_arn || "",
      event_payload: jobData?.event_payload || null,
      queue_url: jobData?.queue_url || "",
      message_body: jobData?.message_body || "",
      message_group_id: jobData?.message_group_id || "",
      cluster_arn: jobData?.cluster_arn || "",
      task_definition_arn: jobData?.task_definition_arn || "",
      launch_type: jobData?.launch_type || undefined,
      network_configuration: jobData?.network_configuration || null,
      overrides: jobData?.overrides || null,
      stream_arn: jobData?.stream_arn || "",
      partition_key: jobData?.partition_key || "",
      training_job_definition_arn: jobData?.training_job_definition_arn || "",
      hyper_parameters: jobData?.hyper_parameters || null,
      input_data_config: jobData?.input_data_config || null,
    },
  });

  const onSubmitForm = async (values: z.infer<typeof cronJobSchema>) => {
    if (externalSubmit) {
      // Cast the form values to match the required CronJob type
      // This ensures all required properties are present and properly typed
      const cronJobValues: CronJob = {
        id: values.id || uuidv4(),
        name: values.name,
        description: values.description || "",
        scheduleExpression: values.scheduleExpression,
        startTime: values.startTime?.toISOString(),
        endTime: values.endTime?.toISOString(),
        status: values.status,
        isApi: values.isApi,
        endpointName: values.endpointName,
        iacCode: values.iacCode,
        groupId: values.groupId,
        groupName: groupName,
        timezone: values.timezone,
        tags: values.tags,
        flexibleTimeWindowMode: values.flexibleTimeWindowMode,
        flexibleWindowMinutes: values.flexibleWindowMinutes,
        targetType: values.targetType,
        
        // Target-specific fields
        function_arn: values.function_arn,
        payload: values.payload,
        state_machine_arn: values.state_machine_arn,
        execution_role_arn: values.execution_role_arn,
        input_payload: values.input_payload,
        endpoint_url: values.endpoint_url,
        http_method: values.http_method,
        headers: values.headers,
        body: values.body,
        authorization_type: values.authorization_type,
        event_bus_arn: values.event_bus_arn,
        event_payload: values.event_payload,
        queue_url: values.queue_url,
        message_body: values.message_body,
        message_group_id: values.message_group_id,
        cluster_arn: values.cluster_arn,
        task_definition_arn: values.task_definition_arn,
        launch_type: values.launch_type,
        network_configuration: values.network_configuration,
        overrides: values.overrides,
        stream_arn: values.stream_arn,
        partition_key: values.partition_key,
        training_job_definition_arn: values.training_job_definition_arn,
        hyper_parameters: values.hyper_parameters,
        input_data_config: values.input_data_config
      };
      
      // If external submit handler is provided, use it
      externalSubmit(cronJobValues);
    } else {
      try {
        // Otherwise, use the default submit handler
        await submitCronJob(values, !!jobData);
        
        toast({
          title: "Success",
          description: jobData ? "Cron job updated successfully." : "Cron job created successfully.",
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
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitForm)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
          {/* Left Column - Cron Job Fields */}
          <div className="space-y-8">
            <div className="space-y-6">
              {/* General Form Fields */}
              <GeneralFormFields control={form.control} />
              
              {/* Scheduling Fields */}
              <SchedulingFields control={form.control} timezones={timezones} />
            </div>
          </div>

          {/* Separator */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 -ml-px">
            <div className="w-px h-full bg-gradient-to-b from-transparent via-border to-transparent" />
          </div>

          {/* Right Column - AWS Configuration */}
          <div className="space-y-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">AWS Configuration</h2>
            <div className="space-y-6">
              {/* Target Type */}
              <TargetTypeField control={form.control} />

              {/* Target Form */}
              <TargetForm 
                form={form}
                targetType={form.watch("targetType")}
              />

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
                  {form.watch("flexibleTimeWindowMode") === "FLEXIBLE" && (
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
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Group Fields at the bottom */}
        <GroupFields 
          control={form.control} 
          groupId={groupId} 
          groupName={groupName}
        />

        {/* Submit and Cancel Buttons */}
        <div className="flex justify-end space-x-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit">
            {jobData ? "Update Cron Job" : "Create Cron Job"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CronJobForm;

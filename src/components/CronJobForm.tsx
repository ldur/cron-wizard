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
import { getAllTimezones } from 'timezone-support';

// Import schema definition
import { cronJobSchema } from '@/schemas/cronJobSchema';

interface CronJobFormProps {
  initialValues?: CronJob;
  job?: CronJob; // Added to match usage in Index.tsx
  groupId?: string;
  groupName?: string;
  onSuccess?: () => void;
  onSubmit?: (values: Omit<CronJob, "id" | "nextRun">) => void; // Added to match usage in Index.tsx
  onCancel?: () => void; // Added to match usage in Index.tsx
}

const timezones = getAllTimezones();

const CronJobForm: React.FC<CronJobFormProps> = ({ 
  initialValues, 
  job, // Added to use the prop from Index.tsx
  groupId, 
  groupName, 
  onSuccess, 
  onSubmit: externalSubmit, // Use the prop from Index.tsx
  onCancel // Use the prop from Index.tsx
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
      // If external submit handler is provided, use it
      externalSubmit(values);
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
        {/* General Form Fields */}
        <GeneralFormFields control={form.control} />
        
        {/* Scheduling Fields */}
        <SchedulingFields control={form.control} timezones={timezones} />

        {/* Target Type */}
        <TargetTypeField control={form.control} />

        {/* Target Form */}
        <TargetForm 
          form={form}
          targetType={form.watch("targetType")}
        />

        {/* Group Fields */}
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
          <Button type="submit" className="w-full md:w-auto">
            {jobData ? "Update Cron Job" : "Create Cron Job"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CronJobForm;

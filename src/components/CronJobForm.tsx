
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
import { getAllTimezones } from 'timezone-support/lookup';

// Import schema definition
import { cronJobSchema } from '@/schemas/cronJobSchema';

interface CronJobFormProps {
  initialValues?: CronJob;
  groupId?: string;
  groupName?: string;
  onSuccess?: () => void;
}

const timezones = getAllTimezones();

const CronJobForm: React.FC<CronJobFormProps> = ({ initialValues, groupId, groupName, onSuccess }) => {
  const navigate = useNavigate();
  const { toast } = useToast();

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
      timezone: initialValues?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      tags: initialValues?.tags || [],
      flexibleTimeWindowMode: initialValues?.flexibleTimeWindowMode || 'OFF',
      flexibleWindowMinutes: initialValues?.flexibleWindowMinutes || null,
      targetType: initialValues?.targetType || 'LAMBDA',

      // Target-specific fields
      function_arn: initialValues?.function_arn || "",
      payload: initialValues?.payload || null,
      state_machine_arn: initialValues?.state_machine_arn || "",
      execution_role_arn: initialValues?.execution_role_arn || "",
      input_payload: initialValues?.input_payload || null,
      endpoint_url: initialValues?.endpoint_url || "",
      http_method: initialValues?.http_method || undefined,
      headers: initialValues?.headers || null,
      body: initialValues?.body || null,
      authorization_type: initialValues?.authorization_type || undefined,
      event_bus_arn: initialValues?.event_bus_arn || "",
      event_payload: initialValues?.event_payload || null,
      queue_url: initialValues?.queue_url || "",
      message_body: initialValues?.message_body || "",
      message_group_id: initialValues?.message_group_id || "",
      cluster_arn: initialValues?.cluster_arn || "",
      task_definition_arn: initialValues?.task_definition_arn || "",
      launch_type: initialValues?.launch_type || undefined,
      network_configuration: initialValues?.network_configuration || null,
      overrides: initialValues?.overrides || null,
      stream_arn: initialValues?.stream_arn || "",
      partition_key: initialValues?.partition_key || "",
      training_job_definition_arn: initialValues?.training_job_definition_arn || "",
      hyper_parameters: initialValues?.hyper_parameters || null,
      input_data_config: initialValues?.input_data_config || null,
    },
  });

  const onSubmit = async (values: z.infer<typeof cronJobSchema>) => {
    try {
      await submitCronJob(values, !!initialValues);
      
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

        {/* Submit Button */}
        <Button type="submit" className="w-full">
          {initialValues ? "Update Cron Job" : "Create Cron Job"}
        </Button>
      </form>
    </Form>
  );
};

export default CronJobForm;

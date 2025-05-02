
import React, { useEffect, useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from "react-router-dom";
import { CronJob } from "@/types/CronJob";
import * as z from "zod";
import GeneralFormFields from './cronJob/GeneralFormFields';
import SchedulingFields from './cronJob/SchedulingFields';
import TargetTypeField from './cronJob/TargetTypeField';
import GroupFields from './cronJob/GroupFields';
import { submitCronJob } from '@/services/cronJobFormService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQueryClient } from "@tanstack/react-query";
import TargetFormWrapper from './target/TargetFormWrapper';
import CronJobIacDialog from './CronJobIacDialog';
import AwsCliScriptDialog from './AwsCliScriptDialog';
import { AlertCircle, Code, Terminal } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from '@/integrations/supabase/client';

// Import schema definition
import { cronJobSchema } from '@/schemas/cronJobSchema';

interface CronJobFormProps {
  initialValues?: CronJob;
  job?: CronJob;
  groupId?: string;
  groupName?: string;
  onSuccess?: () => void;
  onSubmit?: (values: CronJob) => void;
  onCancel?: () => void;
}

const CronJobForm: React.FC<CronJobFormProps> = ({ 
  initialValues, 
  job, 
  groupId, 
  groupName, 
  onSuccess, 
  onSubmit: externalSubmit, 
  onCancel 
}) => {
  const jobData = job || initialValues;
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State for dialogs
  const [iacDialogOpen, setIacDialogOpen] = useState(false);
  const [awsCliDialogOpen, setAwsCliDialogOpen] = useState(false);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [generatedAwsScript, setGeneratedAwsScript] = useState('');

  // Debug logs
  useEffect(() => {
    console.log("CronJobForm rendering with job data:", jobData);
  }, [jobData]);

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
      timezone: jobData?.timezone || "Europe/Oslo",
      tags: jobData?.tags || [],
      flexibleTimeWindowMode: jobData?.flexibleTimeWindowMode || 'OFF',
      flexibleWindowMinutes: jobData?.flexibleWindowMinutes || null,
      targetType: jobData?.targetType || 'LAMBDA',
      targetConfig: jobData?.targetConfig || {},
    },
  });

  // Reset form when initialValues change
  useEffect(() => {
    if (jobData) {
      console.log("Resetting form with updated job data:", jobData);
      form.reset({
        id: jobData.id,
        name: jobData.name || "",
        description: jobData.description || "",
        scheduleExpression: jobData.scheduleExpression || "",
        startTime: jobData.startTime ? new Date(jobData.startTime) : undefined,
        endTime: jobData.endTime ? new Date(jobData.endTime) : undefined,
        status: jobData.status || "active",
        isApi: jobData.isApi || false,
        endpointName: jobData.endpointName || null,
        iacCode: jobData.iacCode || null,
        groupId: jobData.groupId || groupId,
        timezone: jobData.timezone || "Europe/Oslo",
        tags: jobData.tags || [],
        flexibleTimeWindowMode: jobData.flexibleTimeWindowMode || 'OFF',
        flexibleWindowMinutes: jobData.flexibleWindowMinutes || null,
        targetType: jobData.targetType || 'LAMBDA',
        targetConfig: jobData.targetConfig || {},
      });
      
      // Set the generated script from iacCode if it exists
      if (jobData.iacCode) {
        setGeneratedAwsScript(jobData.iacCode);
      }
    }
  }, [jobData, form, groupId]);

  // Watch targetType to detect changes
  const selectedTargetType = form.watch("targetType");

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
        targetConfig: values.targetConfig,
      };
      
      // If external submit handler is provided, use it
      externalSubmit(cronJobValues);
    } else {
      try {
        // Log the final form data being submitted
        console.log("Submitting form data:", values);
        
        // Otherwise, use the default submit handler
        await submitCronJob(values, !!jobData);
        
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['cronJobs'] });
        
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
  
  // Function to generate AWS CLI script
  const generateAwsCliScript = async () => {
    try {
      setIsGeneratingScript(true);
      
      // Get current form values
      const formValues = form.getValues();
      
      // Call the edge function to generate the script
      const { data, error } = await supabase.functions.invoke('generate-aws-cli', {
        body: {
          targetType: formValues.targetType,
          targetConfig: formValues.targetConfig,
          jobName: formValues.name
        },
      });
      
      if (error) {
        console.error("Error generating AWS CLI script:", error);
        toast({
          title: "Script Generation Failed",
          description: error.message || "Failed to generate AWS CLI script",
          variant: "destructive",
        });
        throw error;
      }
      
      // Update the generated script state
      setGeneratedAwsScript(data.script);
      
      // Set the script to the iacCode field
      form.setValue('iacCode', data.script);
      
      toast({
        title: "AWS CLI Script Generated",
        description: "The AWS CLI script has been generated successfully.",
      });
    } catch (error) {
      console.error("Error in AWS CLI script generation:", error);
      toast({
        title: "Script Generation Error",
        description: "An unexpected error occurred while generating the AWS CLI script.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingScript(false);
    }
  };

  // Function to save the script to the iacCode field
  const handleSaveScript = (script: string) => {
    form.setValue('iacCode', script);
    setAwsCliDialogOpen(false);
    
    toast({
      title: "Script Saved",
      description: "The AWS CLI script has been saved to the job configuration.",
    });
  };

  // Debug target config changes
  useEffect(() => {
    console.log("Current targetConfig:", form.watch("targetConfig"));
  }, [form.watch("targetConfig")]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitForm)} className="space-y-8">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="schedule" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="schedule">Job Schedule</TabsTrigger>
              <TabsTrigger value="target">AWS Target Configuration</TabsTrigger>
            </TabsList>

            <TabsContent value="schedule" className="space-y-6">
              <div className="space-y-6">
                <GeneralFormFields control={form.control} />
                <SchedulingFields control={form.control} />
              </div>
            </TabsContent>

            <TabsContent value="target" className="space-y-6">
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">AWS Configuration</h2>
                <TargetTypeField control={form.control} />
                
                {/* New Target Form using dynamic templates */}
                <TargetFormWrapper
                  targetType={selectedTargetType}
                  form={form}
                  initialValues={jobData?.targetConfig}
                />

                {/* AWS CLI Script Generation */}
                <div className="mt-6 border-t border-gray-200 pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-medium">AWS CLI Script</h3>
                      <p className="text-sm text-muted-foreground">
                        Generate AWS CLI commands based on your target configuration
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex items-center"
                        onClick={() => setAwsCliDialogOpen(true)}
                        disabled={!form.getValues().iacCode && !generatedAwsScript}
                      >
                        <Code className="h-4 w-4 mr-2" />
                        View Script
                      </Button>
                      
                      <Button
                        type="button"
                        variant="default"
                        className="flex items-center"
                        onClick={generateAwsCliScript}
                        disabled={isGeneratingScript}
                      >
                        <Terminal className="h-4 w-4 mr-2" />
                        {isGeneratingScript ? 'Generating...' : (form.getValues().iacCode ? 'Regenerate Script' : 'Generate Script')}
                      </Button>
                    </div>
                  </div>
                  
                  {form.getValues().iacCode && (
                    <Alert variant="default" className="bg-secondary/30 border-secondary">
                      <AlertCircle className="h-4 w-4 text-secondary" />
                      <AlertDescription>
                        AWS CLI script has been generated. Click "View Script" to see and manage it.
                      </AlertDescription>
                    </Alert>
                  )}
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
            </TabsContent>
          </Tabs>
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
      
      {/* IAC Dialog */}
      <CronJobIacDialog 
        open={iacDialogOpen}
        onOpenChange={setIacDialogOpen}
        job={{
          name: form.getValues().name,
          isApi: form.getValues().isApi,
          endpointName: form.getValues().endpointName,
          iacCode: form.getValues().iacCode,
          targetType: form.getValues().targetType,
          targetConfig: form.getValues().targetConfig
        }}
        onSave={(code) => {
          form.setValue('iacCode', code);
          setIacDialogOpen(false);
        }}
      />
      
      {/* AWS CLI Dialog */}
      <AwsCliScriptDialog 
        open={awsCliDialogOpen}
        onOpenChange={setAwsCliDialogOpen}
        job={{
          name: form.getValues().name,
          targetType: form.getValues().targetType,
          targetConfig: form.getValues().targetConfig
        }}
        scriptContent={generatedAwsScript || form.getValues().iacCode || ''}
        onSave={handleSaveScript}
        onGenerate={generateAwsCliScript}
        isGenerating={isGeneratingScript}
      />
    </Form>
  );
};

export default CronJobForm;

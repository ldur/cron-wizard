import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X } from "lucide-react";
import { convertToCron } from "@/utils/cronParser";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const cronJobSchema = z.object({
  name: z.string().min(3, {
    message: "Job name must be at least 3 characters.",
  }),
  command: z.string().min(3, {
    message: "Command must be at least 3 characters.",
  }),
  cronExpression: z.string().min(5, {
    message: "Cron expression must be at least 5 characters.",
  }),
  status: z.enum(['active', 'paused']),
  isApi: z.boolean().default(false),
  endpointName: z.string().nullable(),
  iacCode: z.string().nullable(),
  groupId: z.string().nullable(),
});

type CronJobFormValues = z.infer<typeof cronJobSchema>;

interface CronJobFormProps {
  job?: {
    id: string;
    name: string;
    command: string;
    cronExpression: string;
    status: 'active' | 'paused';
    nextRun: string;
    isApi: boolean;
    endpointName: string | null;
    iacCode: string | null;
    groupId?: string;
  };
  onSubmit: (data: CronJobFormValues) => void;
  onCancel: () => void;
}

const CronJobForm: React.FC<CronJobFormProps> = ({ job, onSubmit, onCancel }) => {
  const [schedulePreview, setSchedulePreview] = useState<string | null>(job?.cronExpression || null);
  const [isApi, setIsApi] = useState<boolean>(job?.isApi || false);
  const { toast } = useToast();

  const form = useForm<CronJobFormValues>({
    resolver: zodResolver(cronJobSchema),
    defaultValues: {
      name: job?.name || "",
      command: job?.command || "",
      cronExpression: job?.cronExpression || "0 0 * * *",
      status: job?.status || 'active',
      isApi: job?.isApi || false,
      endpointName: job?.endpointName || null,
      iacCode: job?.iacCode || null,
      groupId: job?.groupId || null,
    },
    mode: "onChange",
  });

  const { setValue, handleSubmit, watch } = form;

  const cronExpressionValue = watch("cronExpression");

  const handlePreview = () => {
    setSchedulePreview(cronExpressionValue);
  };

  const handleApiToggle = (value: boolean) => {
    setIsApi(value);
    setValue("isApi", value);
  };

  const handleNaturalLanguageConversion = (
    naturalLanguage: string, 
    form: any // Adjust type as needed
  ) => {
    try {
      // Convert natural language to cron expression
      const cronExpression = convertToCron(naturalLanguage.trim());
      form.setValue("cronExpression", cronExpression);

      // Update the schedule preview
      setSchedulePreview(cronExpression);

      // Toast notification
      toast({
        title: "Tidsplan oppdatert",
        description: `Naturlig språk "${naturalLanguage}" ble konvertert til cron-uttrykk`,
        variant: "default",
      });
    } catch (error) {
      console.error("Feil ved konvertering av naturlig språk til cron:", error);
      toast({
        title: "Konverteringsfeil",
        description: "Kunne ikke konvertere til cron-uttrykk",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Name</FormLabel>
                <FormControl>
                  <Input placeholder="My Awesome Job" {...field} />
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
                  <Input placeholder="node myscript.js" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cronExpression"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cron Expression</FormLabel>
                <FormControl>
                  <Input placeholder="0 0 * * *" {...field} onBlur={handlePreview} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="button" variant="secondary" size="sm" onClick={() => handleNaturalLanguageConversion("every day at 3pm", form)}>
            Convert "every day at 3pm" to Cron
          </Button>

          {schedulePreview && (
            <div className="rounded-md border px-4 py-3 text-sm">
              <span className="font-medium">Schedule Preview:</span> {schedulePreview}
            </div>
          )}

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

          <FormField
            control={form.control}
            name="isApi"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-md border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Is API Endpoint?</FormLabel>
                </div>
                <FormControl>
                  <Button variant="outline" size="sm" onClick={() => handleApiToggle(!isApi)}>
                    {isApi ? "Yes" : "No"}
                  </Button>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {isApi && (
            <FormField
              control={form.control}
              name="endpointName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Endpoint Name</FormLabel>
                  <FormControl>
                    <Input placeholder="My Awesome Endpoint" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {!isApi && (
            <FormField
              control={form.control}
              name="iacCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>IAC Code</FormLabel>
                  <FormControl>
                    <Input placeholder="My Awesome IAC Code" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="groupId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Group</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a group" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="null">Default</SelectItem>
                    <SelectItem value="group1">Group 1</SelectItem>
                    <SelectItem value="group2">Group 2</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button type="submit">
            <Plus className="h-4 w-4 mr-2" />
            {job ? "Update Job" : "Create Job"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CronJobForm;

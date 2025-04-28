
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import TimeZoneSelect from "@/components/TimeZoneSelect";

// Define a more specific type for targetTemplates to avoid circular references
type SimpleJsonValue = 
  | string
  | number
  | boolean
  | null
  | { [key: string]: SimpleJsonValue }
  | SimpleJsonValue[];

interface SettingsFormData {
  name: string;
  iacDescription: string;
  iacCode: string | null;
  timeZone: string;
  timeZoneDescription: string | null;
  targetTemplates: SimpleJsonValue | null;
}

interface TimeZoneOption {
  value: string;
  label: string;
}

const timeZones: TimeZoneOption[] = [
  { value: "Europe/London", label: "British Time (London)" },
  { value: "Europe/Paris", label: "Central European Time (Paris)" },
  { value: "Europe/Oslo", label: "Central European Time (Oslo)" },
  { value: "America/New_York", label: "Eastern Time (New York)" },
  { value: "America/Chicago", label: "Central Time (Chicago)" },
  { value: "America/Denver", label: "Mountain Time (Denver)" },
  { value: "America/Los_Angeles", label: "Pacific Time (Los Angeles)" },
  { value: "Asia/Tokyo", label: "Japan Time (Tokyo)" },
  { value: "Asia/Shanghai", label: "China Time (Shanghai)" },
  { value: "Australia/Sydney", label: "Australian Eastern Time (Sydney)" },
];

const SettingsForm = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const form = useForm<SettingsFormData>();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('*')
          .maybeSingle();

        if (error) throw error;

        if (data) {
          form.reset({
            name: data.name,
            iacDescription: data.iac_description,
            iacCode: data.iac_code,
            timeZone: data.time_zone,
            timeZoneDescription: data.time_zone_description,
            targetTemplates: data.target_templates,
          });
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        toast({
          title: "Error",
          description: "Failed to load settings",
          variant: "destructive",
        });
      }
    };

    fetchSettings();
  }, [form, toast]);

  const onSubmit = async (data: SettingsFormData) => {
    setLoading(true);
    try {
      // Find the selected timezone description
      const selectedTimeZone = timeZones.find(tz => tz.value === data.timeZone);
      const timeZoneDescription = selectedTimeZone ? selectedTimeZone.label : null;

      // Update the existing record using its ID
      const { data: existingSettings, error: fetchError } = await supabase
        .from('settings')
        .select('id')
        .single();

      if (fetchError) throw fetchError;

      const { error: updateError } = await supabase
        .from('settings')
        .update({
          name: data.name,
          iac_description: data.iacDescription,
          iac_code: data.iacCode,
          time_zone: data.timeZone,
          time_zone_description: timeZoneDescription,
          target_templates: data.targetTemplates,
        })
        .eq('id', existingSettings.id);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Settings updated successfully",
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="iacDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>IAC Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="iacCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>IAC Code</FormLabel>
              <FormControl>
                <Textarea {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <TimeZoneSelect control={form.control} name="timeZone" />

        <FormField
          control={form.control}
          name="targetTemplates"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Target Templates</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  value={field.value ? JSON.stringify(field.value, null, 2) : ''}
                  className="font-mono h-96"
                  readOnly
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Settings
        </Button>
      </form>
    </Form>
  );
};

export default SettingsForm;

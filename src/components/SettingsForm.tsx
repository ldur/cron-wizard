
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
import { Badge } from "@/components/ui/badge";
import { getTargetTypeIcon } from "@/utils/targetTypeIcons";

// Define a non-recursive type for JSON values
interface JsonObject {
  [key: string]: JsonValue;
}

interface JsonArray extends Array<JsonValue> {}

type JsonPrimitive = string | number | boolean | null;

type JsonValue = JsonPrimitive | JsonObject | JsonArray;

interface SettingsFormData {
  name: string;
  iacDescription: string;
  iacCode: string | null;
  timeZone: string;
  timeZoneDescription: string | null;
  targetTemplates: JsonValue | null;
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
  const [targetTypes, setTargetTypes] = useState<string[]>([]);
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

          // Extract target types from target_templates
          if (data.target_templates && typeof data.target_templates === 'object') {
            setTargetTypes(Object.keys(data.target_templates));
          }
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

  // Helper function to render target type badges
  const renderTargetTypeBadges = () => {
    return targetTypes.map(targetType => {
      const IconComponent = getTargetTypeIcon(targetType as any);
      return (
        <Badge key={targetType} variant="outline" className="flex items-center gap-2 px-3 py-1">
          <IconComponent className="h-4 w-4" />
          <span>{targetType}</span>
        </Badge>
      );
    });
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

        <div className="space-y-2">
          <div className="font-medium">Target Templates</div>
          <div className="flex flex-wrap gap-2">
            {targetTypes.length > 0 ? (
              renderTargetTypeBadges()
            ) : (
              <p className="text-sm text-muted-foreground">No target templates configured.</p>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            You can manage target templates from the "Edit Target Templates" button at the top of this page.
          </p>
        </div>

        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Settings
        </Button>
      </form>
    </Form>
  );
};

export default SettingsForm;

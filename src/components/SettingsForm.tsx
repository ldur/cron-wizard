
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface SettingsFormData {
  name: string;
  iacDescription: string;
  iacCode: string | null;
  timeZone: string;
  timeZoneDescription: string | null;
}

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
      // First get the existing record's ID
      const { data: existingSettings, error: fetchError } = await supabase
        .from('settings')
        .select('id')
        .single();

      if (fetchError) throw fetchError;

      // Update the existing record using its ID
      const { error: updateError } = await supabase
        .from('settings')
        .update({
          name: data.name,
          iac_description: data.iacDescription,
          iac_code: data.iacCode,
          time_zone: data.timeZone,
          time_zone_description: data.timeZoneDescription,
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

        <FormField
          control={form.control}
          name="timeZone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Time Zone</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="timeZoneDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Time Zone Description</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ''} />
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

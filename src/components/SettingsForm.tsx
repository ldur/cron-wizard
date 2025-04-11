
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Settings } from "@/types/Settings";

// Define form validation schema
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  iacDescription: z.string().min(10, "Description must be at least 10 characters."),
  iacCode: z.string().min(10, "Code must be at least 10 characters."),
});

interface SettingsFormProps {
  setting?: Settings;
  onSubmit: (data: z.infer<typeof formSchema>) => void;
  onCancel: () => void;
}

const SettingsForm = ({ setting, onSubmit, onCancel }: SettingsFormProps) => {
  // Initialize form with default values or existing setting data
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: setting?.name || "",
      iacDescription: setting?.iacDescription || "",
      iacCode: setting?.iacCode || "",
    },
  });

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    // Pass data directly, no need for special handling of iacCode
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="AWS EventBridge Scheduler" {...field} />
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
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Description of the IAC template..." 
                  className="min-h-[80px]"
                  {...field} 
                />
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
              <FormLabel>Infrastructure as Code</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter TypeScript IAC code here..." 
                  className="min-h-[200px] font-mono"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {setting ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default SettingsForm;


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
import type { ScheduleGroup } from "@/services/scheduleGroupService";

// Define form validation schema
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
});

interface ScheduleGroupFormProps {
  group?: ScheduleGroup;
  onSubmit: (data: z.infer<typeof formSchema>) => void;
  onCancel: () => void;
}

const ScheduleGroupForm = ({ group, onSubmit, onCancel }: ScheduleGroupFormProps) => {
  // Initialize form with default values or existing group data
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: group?.name || "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Group Name</FormLabel>
              <FormControl>
                <Input placeholder="Development Jobs" {...field} />
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
            {group ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ScheduleGroupForm;

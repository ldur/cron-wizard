import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { TemplateAttribute } from "@/pages/TargetTemplates";
import { useToast } from "@/hooks/use-toast";

interface AttributeFormProps {
  attribute?: TemplateAttribute;
  onSubmit: (attribute: TemplateAttribute) => void;
  onCancel: () => void;
}

const attributeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  data_type: z.enum(["string", "number", "boolean", "json"]),
  required: z.boolean(),
  default_value: z.string().optional()
});

export const AttributeForm = ({ attribute, onSubmit, onCancel }: AttributeFormProps) => {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof attributeSchema>>({
    resolver: zodResolver(attributeSchema),
    defaultValues: {
      name: attribute?.name || "",
      data_type: attribute?.data_type || "string",
      required: attribute?.required || false,
      default_value: attribute?.default_value !== undefined 
        ? (typeof attribute.default_value === 'object'
          ? JSON.stringify(attribute.default_value)
          : String(attribute.default_value))
        : undefined
    }
  });
  
  const handleSubmit = (values: z.infer<typeof attributeSchema>) => {
    try {
      let parsedDefaultValue: string | number | boolean | null | undefined = values.default_value;
      
      // Parse the default value based on the data type
      if (values.default_value !== undefined && values.default_value !== "") {
        if (values.data_type === "number") {
          const num = Number(values.default_value);
          if (isNaN(num)) {
            throw new Error("Default value must be a valid number");
          }
          parsedDefaultValue = num;
        } else if (values.data_type === "boolean") {
          if (values.default_value.toLowerCase() === "true") {
            parsedDefaultValue = true;
          } else if (values.default_value.toLowerCase() === "false") {
            parsedDefaultValue = false;
          } else {
            throw new Error("Default value must be 'true' or 'false'");
          }
        } else if (values.data_type === "json") {
          try {
            // For json type, parse but don't include in default_value directly
            // We'll store it as a string in the TemplateAttribute
            JSON.parse(values.default_value);
            parsedDefaultValue = values.default_value;
          } catch (e) {
            throw new Error("Default value must be a valid JSON");
          }
        }
      } else {
        parsedDefaultValue = undefined;
      }

      onSubmit({
        name: values.name,
        data_type: values.data_type,
        required: values.required,
        default_value: parsedDefaultValue
      });
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: "Validation Error",
          description: error.message,
          variant: "destructive"
        });
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g., function_name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="data_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data Type</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select data type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="string">String</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="boolean">Boolean</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="required"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Required</FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="default_value"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Default Value</FormLabel>
              <FormControl>
                {form.watch("data_type") === "json" ? (
                  <Textarea 
                    {...field} 
                    placeholder="{ }" 
                    className="font-mono"
                    rows={4}
                  />
                ) : (
                  <Input 
                    {...field} 
                    placeholder={
                      form.watch("data_type") === "number" ? "0" :
                      form.watch("data_type") === "boolean" ? "true or false" : ""
                    } 
                  />
                )}
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {attribute ? 'Update' : 'Add'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

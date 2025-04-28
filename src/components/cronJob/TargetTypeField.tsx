
import React from 'react';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Control } from "react-hook-form";

interface TargetTypeFieldProps {
  control: Control<any>;
}

const TargetTypeField: React.FC<TargetTypeFieldProps> = ({ control }) => {
  return (
    <FormField
      control={control}
      name="targetType"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Target Type</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select a target type" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="LAMBDA">Lambda Function</SelectItem>
              <SelectItem value="STEP_FUNCTION">Step Function</SelectItem>
              <SelectItem value="API_GATEWAY">API Gateway</SelectItem>
              <SelectItem value="EVENTBRIDGE">EventBridge</SelectItem>
              <SelectItem value="SQS">SQS</SelectItem>
              <SelectItem value="ECS">ECS</SelectItem>
              <SelectItem value="KINESIS">Kinesis</SelectItem>
              <SelectItem value="SAGEMAKER">SageMaker</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default TargetTypeField;


import { useState } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TargetFormProps {
  targetType: string;
  form: any;
}

const TargetForm = ({ targetType, form }: TargetFormProps) => {
  switch (targetType) {
    case 'LAMBDA':
      return (
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="function_arn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Function ARN</FormLabel>
                <FormControl>
                  <Input placeholder="arn:aws:lambda:region:account:function:name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="payload"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payload (Optional)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="{ }" 
                    {...field}
                    onChange={(e) => {
                      try {
                        const json = JSON.parse(e.target.value);
                        field.onChange(json);
                      } catch {
                        field.onChange(e.target.value);
                      }
                    }}
                    value={typeof field.value === 'object' ? JSON.stringify(field.value, null, 2) : field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      );

    case 'STEP_FUNCTION':
      return (
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="state_machine_arn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State Machine ARN</FormLabel>
                <FormControl>
                  <Input placeholder="arn:aws:states:region:account:stateMachine:name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="execution_role_arn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Execution Role ARN</FormLabel>
                <FormControl>
                  <Input placeholder="arn:aws:iam::account:role/name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="input_payload"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Input Payload (Optional)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="{ }" 
                    {...field}
                    onChange={(e) => {
                      try {
                        const json = JSON.parse(e.target.value);
                        field.onChange(json);
                      } catch {
                        field.onChange(e.target.value);
                      }
                    }}
                    value={typeof field.value === 'object' ? JSON.stringify(field.value, null, 2) : field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      );

    case 'API_GATEWAY':
      return (
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="endpoint_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Endpoint URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://api.example.com/path" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="http_method"
            render={({ field }) => (
              <FormItem>
                <FormLabel>HTTP Method</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select HTTP method" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                    <SelectItem value="PATCH">PATCH</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="authorization_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Authorization Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select authorization type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="NONE">None</SelectItem>
                    <SelectItem value="IAM">IAM</SelectItem>
                    <SelectItem value="COGNITO_USER_POOLS">Cognito User Pools</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      );

    case 'EVENTBRIDGE':
      return (
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="event_bus_arn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Event Bus ARN</FormLabel>
                <FormControl>
                  <Input placeholder="arn:aws:events:region:account:event-bus/name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="event_payload"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Event Payload</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="{ }" 
                    {...field}
                    onChange={(e) => {
                      try {
                        const json = JSON.parse(e.target.value);
                        field.onChange(json);
                      } catch {
                        field.onChange(e.target.value);
                      }
                    }}
                    value={typeof field.value === 'object' ? JSON.stringify(field.value, null, 2) : field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      );

    case 'SQS':
      return (
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="queue_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Queue URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://sqs.region.amazonaws.com/account/queue-name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="message_body"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Message Body</FormLabel>
                <FormControl>
                  <Textarea placeholder="Message content" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="message_group_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Message Group ID (Optional, for FIFO queues)</FormLabel>
                <FormControl>
                  <Input placeholder="group-id" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      );

    case 'ECS':
      return (
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="cluster_arn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cluster ARN</FormLabel>
                <FormControl>
                  <Input placeholder="arn:aws:ecs:region:account:cluster/name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="task_definition_arn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Task Definition ARN</FormLabel>
                <FormControl>
                  <Input placeholder="arn:aws:ecs:region:account:task-definition/family:revision" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="launch_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Launch Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select launch type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="FARGATE">Fargate</SelectItem>
                    <SelectItem value="EC2">EC2</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      );

    case 'KINESIS':
      return (
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="stream_arn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stream ARN</FormLabel>
                <FormControl>
                  <Input placeholder="arn:aws:kinesis:region:account:stream/name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="partition_key"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Partition Key</FormLabel>
                <FormControl>
                  <Input placeholder="partition-key" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="payload"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payload</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="{ }" 
                    {...field}
                    onChange={(e) => {
                      try {
                        const json = JSON.parse(e.target.value);
                        field.onChange(json);
                      } catch {
                        field.onChange(e.target.value);
                      }
                    }}
                    value={typeof field.value === 'object' ? JSON.stringify(field.value, null, 2) : field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      );

    case 'SAGEMAKER':
      return (
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="training_job_definition_arn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Training Job Definition ARN</FormLabel>
                <FormControl>
                  <Input placeholder="arn:aws:sagemaker:region:account:training-job-definition/name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="hyper_parameters"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hyperparameters (Optional)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="{ }" 
                    {...field}
                    onChange={(e) => {
                      try {
                        const json = JSON.parse(e.target.value);
                        field.onChange(json);
                      } catch {
                        field.onChange(e.target.value);
                      }
                    }}
                    value={typeof field.value === 'object' ? JSON.stringify(field.value, null, 2) : field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="input_data_config"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Input Data Configuration (Optional)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="{ }" 
                    {...field}
                    onChange={(e) => {
                      try {
                        const json = JSON.parse(e.target.value);
                        field.onChange(json);
                      } catch {
                        field.onChange(e.target.value);
                      }
                    }}
                    value={typeof field.value === 'object' ? JSON.stringify(field.value, null, 2) : field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      );

    default:
      return null;
  }
};

export default TargetForm;


import * as z from "zod";

export const cronJobSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, {
    message: "Name must be at least 3 characters.",
  }),
  description: z.string().optional(),
  scheduleExpression: z.string().min(1, {
    message: "Schedule expression is required.",
  }),
  startTime: z.date().optional(),
  endTime: z.date().optional(),
  status: z.enum(['active', 'paused']),
  isApi: z.boolean().default(false),
  endpointName: z.string().nullable().optional(),
  iacCode: z.string().nullable().optional(),
  groupId: z.string().optional(),
  timezone: z.string().optional(),
  tags: z.array(z.string()).default([]),
  flexibleTimeWindowMode: z.enum(['OFF', 'FLEXIBLE']).default('OFF'),
  flexibleWindowMinutes: z.number().nullable().optional(),
  targetType: z.enum(['LAMBDA', 'STEP_FUNCTION', 'API_GATEWAY', 'EVENTBRIDGE', 'SQS', 'ECS', 'KINESIS', 'SAGEMAKER']),
  
  // Primary field for target configuration
  targetConfig: z.record(z.string(), z.any()).optional(),
});

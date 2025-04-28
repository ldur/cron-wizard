
import { 
  Function, 
  ArrowRight, 
  Globe, 
  Calendar, 
  MessageSquare, 
  Box, 
  ArrowLeftRight,
  Wand2
} from "lucide-react";
import { CronJob } from "@/types/CronJob";

export const getTargetTypeIcon = (targetType: CronJob['targetType']) => {
  switch (targetType) {
    case 'LAMBDA':
      return Function;
    case 'STEP_FUNCTION':
      return ArrowRight;
    case 'API_GATEWAY':
      return Globe;
    case 'EVENTBRIDGE':
      return Calendar;
    case 'SQS':
      return MessageSquare;
    case 'ECS':
      return Box;
    case 'KINESIS':
      return ArrowLeftRight;
    case 'SAGEMAKER':
      return Wand2;
    default:
      return Function;
  }
};

export const targetTypeLabels: Record<CronJob['targetType'], string> = {
  'LAMBDA': 'Lambda Function',
  'STEP_FUNCTION': 'Step Function',
  'API_GATEWAY': 'API Gateway',
  'EVENTBRIDGE': 'EventBridge',
  'SQS': 'Simple Queue Service',
  'ECS': 'Elastic Container Service',
  'KINESIS': 'Kinesis',
  'SAGEMAKER': 'SageMaker'
};

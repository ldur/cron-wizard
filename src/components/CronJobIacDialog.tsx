
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Terminal, Globe, Code } from "lucide-react";

interface CronJobIacDialogProps {
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  job?: {
    name: string;
    isApi: boolean;
    endpointName: string | null;
    iacCode: string | null;
    targetType?: string;
    targetConfig?: Record<string, any>;
  } | null;
  iacCode?: string;
  onSave?: (code: string) => void;
  formData?: any;
  onGenerate?: (code: string) => void;
}

const CronJobIacDialog = ({ open, onOpenChange, job, iacCode, onSave, formData, onGenerate }: CronJobIacDialogProps) => {
  // Determine which iacCode to use (either from job or direct prop)
  const codeToShow = job?.iacCode || iacCode || '';
  const nameToShow = job?.name || (formData?.name || 'Unnamed Job');
  const isApi = job?.isApi || (formData?.isApi || false);
  const endpointName = job?.endpointName || (formData?.endpointName || 'unnamed resource');
  const targetType = job?.targetType || (formData?.targetType || 'LAMBDA');
  const targetConfig = job?.targetConfig || (formData?.targetConfig || {});

  // Function to apply syntax highlighting to bash/shell script
  const highlightShellCode = (code: string): string => {
    if (!code) return '';
    
    return code
      // Comments
      .replace(/(#.*$)/gm, '<span class="text-[#6a737d]">$1</span>')
      // AWS CLI specific commands
      .replace(/\b(aws|s3|lambda|iam|ec2|ecs|eb|sqs|sns|dynamodb|cloudformation|cloudwatch|scheduler|events)\b/g, '<span class="text-[#9b87f5]">$1</span>')
      // CLI options
      .replace(/\b(--\w+[-\w]*)\b/g, '<span class="text-[#86e1fc]">$1</span>')
      // Bash variables
      .replace(/(\$\w+|\$\{\w+\})/g, '<span class="text-[#0EA5E9]">$1</span>')
      // Strings
      .replace(/(["'`])(.*?)\1/g, '<span class="text-[#F97316]">$1$2$1</span>')
      // Numbers
      .replace(/\b(\d+)\b/g, '<span class="text-[#0EA5E9]">$1</span>')
      // Common bash commands
      .replace(/\b(echo|cat|mkdir|cd|cp|mv|rm|grep|sed|awk|curl|wget|sh|bash|source|export|set)\b/g, '<span class="text-[#ff79c6]">$1</span>');
  };

  // Handle code generation based on form data
  const handleGenerate = () => {
    if (onGenerate && formData) {
      // Generate a simple shell script template based on the form data
      const targetType = formData.targetType || 'LAMBDA';
      
      // Generate basic shell script based on target type
      let generatedCode = `#!/bin/bash\n\n`;
      generatedCode += `# AWS CLI script for ${formData.name || 'Unnamed Job'}\n`;
      generatedCode += `# Target Type: ${targetType}\n\n`;
      
      generatedCode += `# Set variables\n`;
      generatedCode += `JOB_NAME="${formData.name || 'UnnamedJob'}"\n`;
      generatedCode += `SCHEDULE_EXPRESSION="${formData.scheduleExpression || 'cron(0 12 * * ? *)'}"`;
      
      if (formData.timezone) {
        generatedCode += `\nTIMEZONE="${formData.timezone}"`;
      }
      
      generatedCode += `\n\n# Create scheduler\n`;
      
      // Add target-specific code
      switch (targetType) {
        case 'LAMBDA':
          generatedCode += `# Lambda target configuration\n`;
          const lambdaArn = formData.targetConfig?.functionArn || 'YOUR_LAMBDA_ARN';
          generatedCode += `LAMBDA_ARN="${lambdaArn}"\n\n`;
          generatedCode += `aws scheduler create-schedule \\\n`;
          generatedCode += `  --name "$JOB_NAME" \\\n`;
          generatedCode += `  --schedule-expression "$SCHEDULE_EXPRESSION" \\\n`;
          if (formData.timezone) {
            generatedCode += `  --schedule-expression-timezone "$TIMEZONE" \\\n`;
          }
          generatedCode += `  --target "'{\\\"Arn\\\": \\\"$LAMBDA_ARN\\\", \\\"RoleArn\\\": \\\"YOUR_ROLE_ARN\\\"}'" \\\n`;
          generatedCode += `  --flexible-time-window "'{\\\"Mode\\\": \\\"${formData.flexibleTimeWindowMode || 'OFF'}\\\"}'"`;
          break;
          
        case 'API_GATEWAY':
          generatedCode += `# API Gateway target configuration\n`;
          const apiEndpoint = formData.targetConfig?.endpointUrl || 'YOUR_API_ENDPOINT';
          generatedCode += `API_ENDPOINT="${apiEndpoint}"\n\n`;
          generatedCode += `aws scheduler create-schedule \\\n`;
          generatedCode += `  --name "$JOB_NAME" \\\n`;
          generatedCode += `  --schedule-expression "$SCHEDULE_EXPRESSION" \\\n`;
          if (formData.timezone) {
            generatedCode += `  --schedule-expression-timezone "$TIMEZONE" \\\n`;
          }
          generatedCode += `  --target "'{\\\"Arn\\\": \\\"$API_ENDPOINT\\\", \\\"RoleArn\\\": \\\"YOUR_ROLE_ARN\\\", \\\"HttpParameters\\\": {\\\"Method\\\": \\\"${formData.targetConfig?.httpMethod || 'GET'}\\\"}'" \\\n`;
          generatedCode += `  --flexible-time-window "'{\\\"Mode\\\": \\\"${formData.flexibleTimeWindowMode || 'OFF'}\\\"}'"`;
          break;
          
        default:
          generatedCode += `# ${targetType} target configuration\n`;
          generatedCode += `# TODO: Add specific parameters for ${targetType}\n\n`;
          generatedCode += `aws scheduler create-schedule \\\n`;
          generatedCode += `  --name "$JOB_NAME" \\\n`;
          generatedCode += `  --schedule-expression "$SCHEDULE_EXPRESSION" \\\n`;
          if (formData.timezone) {
            generatedCode += `  --schedule-expression-timezone "$TIMEZONE" \\\n`;
          }
          generatedCode += `  --target "'{\\\"Arn\\\": \\\"TARGET_ARN\\\", \\\"RoleArn\\\": \\\"YOUR_ROLE_ARN\\\"}'" \\\n`;
          generatedCode += `  --flexible-time-window "'{\\\"Mode\\\": \\\"${formData.flexibleTimeWindowMode || 'OFF'}\\\"}'"`;
      }
      
      onGenerate(generatedCode);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isApi ? (
              <Globe className="h-5 w-5 text-blue-500" />
            ) : (
              <Terminal className="h-5 w-5 text-amber-500" />
            )}
            <span>
              {isApi ? "API Endpoint" : "Lambda Function"}: {nameToShow}
            </span>
          </DialogTitle>
          <DialogDescription>
            AWS CLI Script for {endpointName}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
          <Code className="h-4 w-4" />
          <span>Shell Script</span>
        </div>
        
        <ScrollArea className="flex-1 border rounded-md bg-[#1A1F2C] text-[#C8C8C9]">
          {codeToShow ? (
            <pre className="p-4 text-sm overflow-visible whitespace-pre-wrap">
              <code 
                className="font-mono"
                dangerouslySetInnerHTML={{ __html: highlightShellCode(codeToShow) }}
              />
            </pre>
          ) : (
            <div className="p-4 text-sm text-muted-foreground italic">
              No AWS CLI Script provided for this job.
            </div>
          )}
        </ScrollArea>
        
        <div className="mt-4 flex justify-end space-x-2">
          {formData && onGenerate && (
            <button 
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90 px-4 py-2 rounded-md"
              onClick={handleGenerate}
            >
              Generate Code
            </button>
          )}
          
          {onSave && (
            <button 
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md"
              onClick={() => onSave(codeToShow)}
            >
              Save Code
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CronJobIacDialog;

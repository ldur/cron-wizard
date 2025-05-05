
import React from "react";
import AwsCliScriptDialog from "./AwsCliScriptDialog";

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
  sdkCode?: string;
  onSave?: (code: string, type?: 'cli' | 'sdk') => void;
  formData?: any;
  onGenerate?: (code: string) => void;
}

const CronJobIacDialog = ({ 
  open, 
  onOpenChange, 
  job, 
  iacCode, 
  sdkCode,
  onSave, 
  formData, 
  onGenerate 
}: CronJobIacDialogProps) => {
  // Determine which code to use (either from job or direct prop)
  const cliCodeToShow = job?.iacCode || iacCode || '';
  const sdkCodeToShow = sdkCode || '';
  
  // Handle code generation based on form data
  const handleGenerate = (type: 'cli' | 'sdk') => {
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

  // Handle saving code
  const handleSave = (code: string, type: 'cli' | 'sdk' = 'cli') => {
    if (onSave) {
      onSave(code, type);
    }
  };

  // Use the AwsCliScriptDialog component with our props
  return (
    <AwsCliScriptDialog
      open={open}
      onOpenChange={onOpenChange}
      job={{
        name: job?.name || (formData?.name || 'Unnamed Job'),
        targetType: job?.targetType || (formData?.targetType || 'LAMBDA')
      }}
      scriptContent={cliCodeToShow}
      sdkContent={sdkCodeToShow}
      onSave={handleSave}
      onGenerate={formData && onGenerate ? (type) => handleGenerate(type) : undefined}
    />
  );
};

export default CronJobIacDialog;

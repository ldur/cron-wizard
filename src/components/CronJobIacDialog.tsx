
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

  // Function to apply syntax highlighting to the code
  const highlightCode = (code: string): string => {
    if (!code) return '';
    
    return code
      // Keywords
      .replace(/\b(import|export|from|const|let|var|function|return|new|class|extends|interface|type|if|else|for|while|switch|case|break|continue|try|catch|throw|async|await|typeof|instanceof)\b/g, '<span class="text-[#9b87f5]">$1</span>')
      // Types
      .replace(/\b(string|number|boolean|null|undefined|any|void|object|Array|Promise|Record|Map|Set)\b/g, '<span class="text-[#86e1fc]">$1</span>')
      // Comments
      .replace(/(\/\/.*$|\/\*[\s\S]*?\*\/)/gm, '<span class="text-[#6a737d]">$1</span>')
      // Strings
      .replace(/(["'`])(.*?)\1/g, '<span class="text-[#F97316]">$1$2$1</span>')
      // Numbers
      .replace(/\b(\d+)\b/g, '<span class="text-[#0EA5E9]">$1</span>')
      // Boolean, null, undefined
      .replace(/\b(true|false|null|undefined)\b/g, '<span class="text-[#ff79c6]">$1</span>')
      // Methods and properties
      .replace(/(\.\s*[\w$]+)(?=\s*\()/g, '<span class="text-[#79B8FF]">$1</span>')
      // Brackets and punctuation
      .replace(/([(){}[\]<>])/g, '<span class="text-[#d8dee9]">$1</span>')
      // Special characters
      .replace(/([+\-*/%&|^!=<>?:;.,])/g, '<span class="text-[#89DDFF]">$1</span>');
  };

  // Handle code generation based on form data
  const handleGenerate = () => {
    if (onGenerate && formData) {
      // Generate a simple IAC code template based on the form data
      const targetType = formData.targetType || 'LAMBDA';
      
      // Generate basic IAC code based on target type
      let generatedCode = `// Infrastructure as Code for ${formData.name || 'Unnamed Job'}\n`;
      generatedCode += `// Target Type: ${targetType}\n\n`;
      
      generatedCode += `import { aws_events as events, aws_events_targets as targets, Duration } from 'aws-cdk-lib';\n`;
      generatedCode += `import { Construct } from 'constructs';\n\n`;
      
      generatedCode += `export function create${targetType.charAt(0).toUpperCase() + targetType.slice(1).toLowerCase()}Job(scope: Construct) {\n`;
      generatedCode += `  // Create the schedule rule\n`;
      generatedCode += `  const rule = new events.Rule(scope, '${formData.name || 'Job'}Rule', {\n`;
      generatedCode += `    schedule: events.Schedule.expression('${formData.scheduleExpression || 'cron(0 12 * * ? *)'}'),\n`;
      generatedCode += `    description: '${formData.description || 'No description provided'}',\n`;
      
      if (formData.timezone) {
        generatedCode += `    timezone: '${formData.timezone}',\n`;
      }
      
      generatedCode += `  });\n\n`;
      
      // Add target-specific code
      switch (targetType) {
        case 'LAMBDA':
          generatedCode += `  // Add Lambda target\n`;
          const lambdaArn = formData.targetConfig?.functionArn || 'YOUR_LAMBDA_ARN';
          generatedCode += `  const lambdaArn = '${lambdaArn}';\n`;
          generatedCode += `  rule.addTarget(new targets.LambdaFunction(lambdaFunction));\n`;
          break;
        case 'API_GATEWAY':
          generatedCode += `  // Add API Gateway target\n`;
          const apiEndpoint = formData.targetConfig?.endpointUrl || 'YOUR_API_ENDPOINT';
          generatedCode += `  const apiEndpoint = '${apiEndpoint}';\n`;
          generatedCode += `  rule.addTarget(new targets.ApiGateway({\n`;
          generatedCode += `    httpMethod: '${formData.targetConfig?.httpMethod || 'GET'}',\n`;
          generatedCode += `    path: '/path',\n`;
          generatedCode += `  }));\n`;
          break;
        default:
          generatedCode += `  // Add ${targetType} target\n`;
          generatedCode += `  // Configuration: ${JSON.stringify(targetConfig)}\n`;
          generatedCode += `  // TODO: Configure specific target properties\n`;
      }
      
      generatedCode += `\n  return rule;\n`;
      generatedCode += `}\n`;
      
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
            Infrastructure as Code for {endpointName}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
          <Code className="h-4 w-4" />
          <span>TypeScript IAC Code</span>
        </div>
        
        <ScrollArea className="flex-1 border rounded-md bg-[#1A1F2C] text-[#C8C8C9]">
          {codeToShow ? (
            <pre className="p-4 text-sm overflow-visible whitespace-pre-wrap">
              <code 
                className="font-mono"
                dangerouslySetInnerHTML={{ __html: highlightCode(codeToShow) }}
              />
            </pre>
          ) : (
            <div className="p-4 text-sm text-muted-foreground italic">
              No IAC code provided for this job.
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

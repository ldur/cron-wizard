
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Terminal, Code, RefreshCw, ClipboardCopy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface AwsCliScriptDialogProps {
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  job?: {
    name: string;
    targetType: string;
    targetConfig?: Record<string, any>;
  } | null;
  scriptContent: string;
  onSave?: (script: string) => void;
  onGenerate?: () => void;
  isGenerating?: boolean;
}

const AwsCliScriptDialog = ({ 
  open, 
  onOpenChange, 
  job, 
  scriptContent, 
  onSave, 
  onGenerate,
  isGenerating = false
}: AwsCliScriptDialogProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(scriptContent);
    setCopied(true);
    toast({
      title: "Copied to clipboard",
      description: "The AWS CLI script has been copied to your clipboard."
    });
    setTimeout(() => setCopied(false), 2000);
  };

  // Function to apply syntax highlighting to the code
  const highlightCode = (code: string): string => {
    if (!code) return '';
    
    return code
      // AWS CLI specific commands
      .replace(/\b(aws|s3|lambda|iam|ec2|ecs|eb|sqs|sns|dynamodb|cloudformation|cloudwatch)\b/g, '<span class="text-[#9b87f5]">$1</span>')
      // CLI options
      .replace(/\b(--\w+[-\w]*)\b/g, '<span class="text-[#86e1fc]">$1</span>')
      // Bash variables
      .replace(/(\$\w+|\$\{\w+\})/g, '<span class="text-[#0EA5E9]">$1</span>')
      // Comments
      .replace(/(#.*$)/gm, '<span class="text-[#6a737d]">$1</span>')
      // Strings
      .replace(/(["'`])(.*?)\1/g, '<span class="text-[#F97316]">$1$2$1</span>')
      // Numbers
      .replace(/\b(\d+)\b/g, '<span class="text-[#0EA5E9]">$1</span>');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-amber-500" />
            <span>
              AWS CLI Script: {job?.name || 'Unnamed Job'}
            </span>
          </DialogTitle>
          <DialogDescription>
            AWS CLI commands for {job?.targetType || 'Unknown'} resource
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
          <Code className="h-4 w-4" />
          <span>AWS CLI Script</span>
        </div>
        
        <ScrollArea className="flex-1 border rounded-md bg-[#1A1F2C] text-[#C8C8C9]">
          {scriptContent ? (
            <pre className="p-4 text-sm overflow-visible whitespace-pre-wrap">
              <code 
                className="font-mono"
                dangerouslySetInnerHTML={{ __html: highlightCode(scriptContent) }}
              />
            </pre>
          ) : (
            <div className="p-4 text-sm text-muted-foreground italic">
              {isGenerating 
                ? "Generating AWS CLI script..." 
                : "No AWS CLI script generated for this job yet."}
            </div>
          )}
        </ScrollArea>
        
        <div className="mt-4 flex justify-end space-x-2">
          <Button 
            className="bg-secondary text-secondary-foreground hover:bg-secondary/90 flex items-center"
            onClick={handleCopy}
            disabled={!scriptContent || isGenerating}
          >
            {copied ? (
              <><Check className="h-4 w-4 mr-2" /> Copied</>
            ) : (
              <><ClipboardCopy className="h-4 w-4 mr-2" /> Copy</>
            )}
          </Button>
          
          {onGenerate && (
            <Button 
              className={`bg-secondary text-secondary-foreground hover:bg-secondary/90 flex items-center
                ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={onGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Generating...</>
              ) : (
                <><RefreshCw className="h-4 w-4 mr-2" /> {scriptContent ? "Regenerate" : "Generate"}</>
              )}
            </Button>
          )}
          
          {onSave && (
            <Button 
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => onSave(scriptContent)}
              disabled={!scriptContent || isGenerating}
            >
              Save Script
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AwsCliScriptDialog;

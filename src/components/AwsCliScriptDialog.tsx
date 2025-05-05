
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Terminal, Code, RefreshCw, ClipboardCopy, Check, Laptop } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface AwsCliScriptDialogProps {
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  job?: {
    name: string;
    targetType: string;
    targetConfig?: Record<string, any>;
  } | null;
  scriptContent: string;
  sdkContent?: string;
  onSave?: (script: string, type: 'cli' | 'sdk') => void;
  onGenerate?: (type: 'cli' | 'sdk') => void;
  isGenerating?: boolean;
  isGeneratingSdk?: boolean;
}

const AwsCliScriptDialog = ({ 
  open, 
  onOpenChange, 
  job, 
  scriptContent, 
  sdkContent = '',
  onSave, 
  onGenerate,
  isGenerating = false,
  isGeneratingSdk = false
}: AwsCliScriptDialogProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [copiedSdk, setCopiedSdk] = useState(false);
  const [activeTab, setActiveTab] = useState<'cli' | 'sdk'>('cli');

  const handleCopy = (content: string, isSdk: boolean) => {
    navigator.clipboard.writeText(content);
    
    if (isSdk) {
      setCopiedSdk(true);
      setTimeout(() => setCopiedSdk(false), 2000);
    } else {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    
    toast({
      title: "Copied to clipboard",
      description: `The ${isSdk ? "AWS SDK Python" : "AWS CLI"} script has been copied to your clipboard.`
    });
  };

  // Function to apply syntax highlighting to the CLI code
  const highlightCliCode = (code: string): string => {
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
  
  // Function to apply syntax highlighting to Python code
  const highlightPythonCode = (code: string): string => {
    if (!code) return '';
    
    return code
      // Python keywords
      .replace(/\b(import|from|def|class|if|else|elif|try|except|finally|for|while|return|with|as|in|is|not|and|or)\b/g, '<span class="text-[#9b87f5]">$1</span>')
      // Built-in functions
      .replace(/\b(print|len|str|int|float|dict|list|set|tuple|isinstance|range)\b/g, '<span class="text-[#86e1fc]">$1</span>')
      // AWS boto3 specific
      .replace(/\b(boto3|client|resource|session)\b/g, '<span class="text-[#10B981]">$1</span>')
      // Python decorators
      .replace(/(@\w+)/g, '<span class="text-[#DC2626]">$1</span>')
      // Comments
      .replace(/(#.*$)/gm, '<span class="text-[#6a737d]">$1</span>')
      // Strings
      .replace(/(['"]{3})([\s\S]*?)(\1)|(['"]{1})(.*?)(\4)/g, '<span class="text-[#F97316]">$1$2$3$4$5$6</span>')
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
              AWS Script Generator: {job?.name || 'Unnamed Job'}
            </span>
          </DialogTitle>
          <DialogDescription>
            AWS scripts for {job?.targetType || 'Unknown'} resource
          </DialogDescription>
        </DialogHeader>
        
        <Tabs 
          defaultValue="cli" 
          className="w-full" 
          value={activeTab} 
          onValueChange={(value) => setActiveTab(value as 'cli' | 'sdk')}
        >
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="cli" className="flex items-center gap-1">
              <Terminal className="h-4 w-4" />
              <span>CLI Script</span>
            </TabsTrigger>
            <TabsTrigger value="sdk" className="flex items-center gap-1">
              <Laptop className="h-4 w-4" />
              <span>Python SDK</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="cli" className="mt-0">
            <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
              <Code className="h-4 w-4" />
              <span>AWS CLI Script</span>
            </div>
            
            <ScrollArea className="flex-1 max-h-[50vh] border rounded-md bg-[#1A1F2C] text-[#C8C8C9]">
              {scriptContent ? (
                <pre className="p-4 text-sm whitespace-pre-wrap">
                  <code 
                    className="font-mono"
                    dangerouslySetInnerHTML={{ __html: highlightCliCode(scriptContent) }}
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
                onClick={() => handleCopy(scriptContent, false)}
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
                  onClick={() => onGenerate('cli')}
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
                  onClick={() => onSave(scriptContent, 'cli')}
                  disabled={!scriptContent || isGenerating}
                >
                  Save CLI Script
                </Button>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="sdk" className="mt-0">
            <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
              <Laptop className="h-4 w-4" />
              <span>AWS SDK Python Script</span>
            </div>
            
            <ScrollArea className="flex-1 max-h-[50vh] border rounded-md bg-[#1A1F2C] text-[#C8C8C9]">
              {sdkContent ? (
                <pre className="p-4 text-sm whitespace-pre-wrap">
                  <code 
                    className="font-mono"
                    dangerouslySetInnerHTML={{ __html: highlightPythonCode(sdkContent) }}
                  />
                </pre>
              ) : (
                <div className="p-4 text-sm text-muted-foreground italic">
                  {isGeneratingSdk 
                    ? "Generating AWS SDK Python script..." 
                    : "No AWS SDK Python script generated for this job yet."}
                </div>
              )}
            </ScrollArea>
            
            <div className="mt-4 flex justify-end space-x-2">
              <Button 
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90 flex items-center"
                onClick={() => handleCopy(sdkContent, true)}
                disabled={!sdkContent || isGeneratingSdk}
              >
                {copiedSdk ? (
                  <><Check className="h-4 w-4 mr-2" /> Copied</>
                ) : (
                  <><ClipboardCopy className="h-4 w-4 mr-2" /> Copy</>
                )}
              </Button>
              
              {onGenerate && (
                <Button 
                  className={`bg-secondary text-secondary-foreground hover:bg-secondary/90 flex items-center
                    ${isGeneratingSdk ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => onGenerate('sdk')}
                  disabled={isGeneratingSdk}
                >
                  {isGeneratingSdk ? (
                    <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Generating...</>
                  ) : (
                    <><RefreshCw className="h-4 w-4 mr-2" /> {sdkContent ? "Regenerate" : "Generate"}</>
                  )}
                </Button>
              )}
              
              {onSave && (
                <Button 
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => onSave(sdkContent, 'sdk')}
                  disabled={!sdkContent || isGeneratingSdk}
                >
                  Save SDK Script
                </Button>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AwsCliScriptDialog;

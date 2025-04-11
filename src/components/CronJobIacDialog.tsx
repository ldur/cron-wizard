
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Terminal, Globe, Code } from "lucide-react";

interface CronJobIacDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  job: {
    name: string;
    isApi: boolean;
    endpointName: string | null;
    iacCode: string | null;
  } | null;
}

const CronJobIacDialog = ({ isOpen, onOpenChange, job }: CronJobIacDialogProps) => {
  if (!job) return null;

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

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {job.isApi ? (
              <Globe className="h-5 w-5 text-blue-500" />
            ) : (
              <Terminal className="h-5 w-5 text-amber-500" />
            )}
            <span>
              {job.isApi ? "API Endpoint" : "Lambda Function"}: {job.name}
            </span>
          </DialogTitle>
          <DialogDescription>
            Infrastructure as Code for {job.endpointName || "unnamed resource"}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
          <Code className="h-4 w-4" />
          <span>TypeScript IAC Code</span>
        </div>
        
        <ScrollArea className="flex-1 border rounded-md bg-[#1A1F2C] text-[#C8C8C9]">
          {job.iacCode ? (
            <pre className="p-4 text-sm overflow-visible whitespace-pre-wrap">
              <code 
                className="font-mono"
                dangerouslySetInnerHTML={{ __html: highlightCode(job.iacCode) }}
              />
            </pre>
          ) : (
            <div className="p-4 text-sm text-muted-foreground italic">
              No IAC code provided for this job.
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default CronJobIacDialog;

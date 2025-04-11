
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
            <pre className="p-4 text-sm overflow-visible">
              <code className="language-typescript font-mono">
                {job.iacCode.replace(/import\s/g, '<span class="text-[#9b87f5]">import </span>')
                  .replace(/export\s/g, '<span class="text-[#9b87f5]">export </span>')
                  .replace(/const\s/g, '<span class="text-[#9b87f5]">const </span>')
                  .replace(/let\s/g, '<span class="text-[#9b87f5]">let </span>')
                  .replace(/function\s/g, '<span class="text-[#9b87f5]">function </span>')
                  .replace(/return\s/g, '<span class="text-[#9b87f5]">return </span>')
                  .replace(/new\s/g, '<span class="text-[#9b87f5]">new </span>')
                  .replace(/if\s/g, '<span class="text-[#9b87f5]">if </span>')
                  .replace(/else\s/g, '<span class="text-[#9b87f5]">else </span>')
                  .replace(/(["'])(?:(?=(\\?))\2.)*?\1/g, '<span class="text-[#F97316]">$&</span>')
                  .replace(/\b(\d+)\b/g, '<span class="text-[#0EA5E9]">$&</span>')
                  .replace(/true|false|null|undefined/g, '<span class="text-[#0EA5E9]">$&</span>')}
              </code>
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

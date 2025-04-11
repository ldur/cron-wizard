
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Lambda, Globe, Code } from "lucide-react";

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
              <Lambda className="h-5 w-5 text-amber-500" />
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
        
        <ScrollArea className="flex-1 border rounded-md bg-slate-50 dark:bg-slate-950">
          {job.iacCode ? (
            <pre className="p-4 text-sm overflow-auto whitespace-pre-wrap">
              <code>{job.iacCode}</code>
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

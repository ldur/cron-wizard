import { useState } from "react";
import { Play, Pause, Edit, Trash, Clock, Calendar, ArrowDown, ArrowUp, Globe, Code, Terminal, FolderTree, Briefcase, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { CronJob } from "@/types/CronJob";
import CronJobIacDialog from "./CronJobIacDialog";
import { getTargetTypeIcon, targetTypeLabels } from "@/utils/targetTypeIcons";
import { getIconComponent } from "./groups/utils";

interface CronJobListProps {
  jobs: CronJob[];
  onEdit: (job: CronJob) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

const CronJobList = ({ jobs, onEdit, onDelete, onToggleStatus }: CronJobListProps) => {
  const { toast } = useToast();
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [sortBy, setSortBy] = useState<'name' | 'nextRun' | 'status'>('nextRun');
  const [selectedJob, setSelectedJob] = useState<CronJob | null>(null);
  const [isIacDialogOpen, setIsIacDialogOpen] = useState(false);

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this job?")) {
      onDelete(id);
    }
  };

  const handleSort = (field: 'name' | 'nextRun' | 'status') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleShowIacCode = (job: CronJob) => {
    setSelectedJob(job);
    setIsIacDialogOpen(true);
  };

  const getSortIcon = (field: 'name' | 'nextRun' | 'status') => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />;
  };

  // Updated getGroupIcon function to use the getIconComponent utility
  const getGroupIcon = (iconName: string | undefined) => {
    const IconComponent = getIconComponent(iconName || 'folder');
    return IconComponent ? <IconComponent className="h-4 w-4 text-blue-500 mr-2" /> : null;
  };

  const sortedJobs = [...jobs].sort((a, b) => {
    if (sortBy === 'name') {
      return sortOrder === 'asc' 
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    } else if (sortBy === 'nextRun') {
      // Changed to use scheduleExpression instead of nextRun
      return sortOrder === 'asc' 
        ? a.scheduleExpression.localeCompare(b.scheduleExpression)
        : b.scheduleExpression.localeCompare(a.scheduleExpression);
    } else {
      return sortOrder === 'asc'
        ? a.status.localeCompare(b.status)
        : b.status.localeCompare(a.status);
    }
  });

  if (jobs.length === 0) {
    return (
      <div className="p-10 text-center">
        <div className="mb-4 inline-flex rounded-full bg-muted p-3">
          <Clock className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="mb-2 text-xl font-semibold">No jobs scheduled</h3>
        <p className="text-muted-foreground mb-4">
          Your cron jobs will appear here once created.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center py-2 px-4 bg-muted/30 rounded-md text-sm font-medium">
        <button 
          onClick={() => handleSort('name')}
          className="flex items-center gap-1 w-2/6"
        >
          Name {getSortIcon('name')}
        </button>
        <div className="w-1/6">
          Group
        </div>
        <button 
          onClick={() => handleSort('nextRun')}
          className="flex items-center gap-1 w-1/6"
        >
          Next Run {getSortIcon('nextRun')}
        </button>
        <div className="w-1/6">Target</div>
        <button 
          onClick={() => handleSort('status')}
          className="flex items-center gap-1 w-1/6"
        >
          Status {getSortIcon('status')}
        </button>
        <div className="w-1/6 text-right">Actions</div>
      </div>

      {sortedJobs.map((job) => (
        <Card key={job.id} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="flex items-center justify-between p-4">
              <div className="w-2/6">
                <h3 className="font-medium line-clamp-1">{job.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {job.scheduleExpression}
                  <span className="ml-2 text-blue-500">
                    <Clock className="h-3 w-3 inline mr-1" />
                    {job.timezone || "UTC"}
                  </span>
                </p>
              </div>
              <div className="w-1/6">
                <div className="flex items-center">
                  {getGroupIcon(job.groupIcon)}
                  <span className="text-sm">{job.groupName || "Default"}</span>
                </div>
              </div>
              <div className="w-1/6 flex items-center">
                <Calendar className="h-4 w-4 text-blue-500 mr-2" />
                <span className="text-sm">Next Run TBD</span>
              </div>

              <div className="w-1/6">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-0 h-auto mr-2"
                          onClick={() => handleShowIacCode(job)}
                        >
                          {(() => {
                            const Icon = getTargetTypeIcon(job.targetType);
                            return <Icon className="h-4 w-4 text-blue-500" />;
                          })()}
                        </Button>
                        <span className="text-sm truncate max-w-[150px]">
                          {targetTypeLabels[job.targetType]}
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      {`View IAC code for ${targetTypeLabels[job.targetType]}`}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className="w-1/6">
                <Badge 
                  variant={job.status === 'active' ? 'default' : 'outline'}
                  className={job.status === 'active' ? 'bg-green-500 hover:bg-green-500/90' : ''}
                >
                  {job.status === 'active' ? 'Active' : 'Paused'}
                </Badge>
              </div>
              <div className="w-1/6 text-right space-x-1">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={() => onToggleStatus(job.id)}
                  title={job.status === 'active' ? 'Pause' : 'Resume'}
                  className="text-amber-500 hover:text-amber-600 hover:bg-amber-50"
                >
                  {job.status === 'active' ? 
                    <Pause className="h-4 w-4" /> : 
                    <Play className="h-4 w-4" />
                  }
                </Button>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={() => onEdit(job)}
                  title="Edit"
                  className="text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      title="Delete"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40 bg-white">
                    <DropdownMenuItem 
                      onClick={() => handleDelete(job.id)}
                      className="text-red-500 focus:text-red-600 focus:bg-red-50"
                    >
                      <Trash className="h-4 w-4 mr-2" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <CronJobIacDialog 
        open={isIacDialogOpen}
        onOpenChange={setIsIacDialogOpen}
        job={selectedJob}
      />
    </div>
  );
};

export default CronJobList;

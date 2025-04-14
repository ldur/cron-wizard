
import { useState, useEffect } from "react";
import { Plus, X, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/Header";
import CronJobList from "@/components/CronJobList";
import CronJobForm from "@/components/CronJobForm";
import EmptyState from "@/components/EmptyState";
import DashboardStats from "@/components/DashboardStats";
import { CronJob } from "@/types/CronJob";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  fetchCronJobs, 
  createCronJob, 
  updateCronJob, 
  deleteCronJob,
  toggleCronJobStatus,
  fetchCronJobsByGroup
} from "@/services/cronJobService";
import { fetchScheduleGroups } from "@/services/scheduleGroupService";

const Index = () => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingJob, setEditingJob] = useState<CronJob | undefined>(undefined);
  const [selectedGroupId, setSelectedGroupId] = useState<string | "all">("all");
  const [activeTab, setActiveTab] = useState<"all" | "active" | "paused">("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query to fetch all groups
  const { data: groups = [] } = useQuery({
    queryKey: ['scheduleGroups'],
    queryFn: fetchScheduleGroups,
  });

  // Query to fetch jobs based on selected group
  const { 
    data: jobs = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['cronJobs', selectedGroupId],
    queryFn: () => selectedGroupId === "all" 
      ? fetchCronJobs() 
      : fetchCronJobsByGroup(selectedGroupId),
  });

  // Filtered jobs based on both group and status filters
  const filteredJobs = activeTab === "all" 
    ? jobs 
    : jobs.filter(job => job.status === activeTab);

  // Mutations for CRUD operations
  const createJobMutation = useMutation({
    mutationFn: createCronJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cronJobs'] });
      setIsFormVisible(false);
      toast({
        title: "Job Created",
        description: "The cron job has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create job: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updateJobMutation = useMutation({
    mutationFn: ({ id, job }: { id: string; job: Partial<Omit<CronJob, 'id' | 'nextRun' | 'groupName'>> }) => 
      updateCronJob(id, job),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cronJobs'] });
      setEditingJob(undefined);
      setIsFormVisible(false);
      toast({
        title: "Job Updated",
        description: "The cron job has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update job: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deleteJobMutation = useMutation({
    mutationFn: deleteCronJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cronJobs'] });
      toast({
        title: "Job Deleted",
        description: "The cron job has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete job: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'paused' }) => 
      toggleCronJobStatus(id, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cronJobs'] });
      toast({
        title: data.status === "active" ? "Job Activated" : "Job Paused",
        description: `The job "${data.name}" has been ${data.status === "active" ? "activated" : "paused"}.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to toggle job status: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleAddJob = (newJob: Omit<CronJob, "id" | "nextRun" | "groupName">) => {
    createJobMutation.mutate(newJob);
  };

  const handleUpdateJob = (updatedJob: Omit<CronJob, "id" | "nextRun" | "groupName">) => {
    if (!editingJob) return;
    updateJobMutation.mutate({ id: editingJob.id, job: updatedJob });
  };

  const handleEdit = (job: CronJob) => {
    setEditingJob(job);
    setIsFormVisible(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this job?")) {
      deleteJobMutation.mutate(id);
    }
  };

  const handleToggleStatus = (id: string) => {
    const job = jobs.find(j => j.id === id);
    if (job) {
      toggleStatusMutation.mutate({ id, status: job.status });
    }
  };

  const handleFormCancel = () => {
    setIsFormVisible(false);
    setEditingJob(undefined);
  };

  const handleGroupChange = (value: string) => {
    setSelectedGroupId(value);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as "all" | "active" | "paused");
  };

  // Error handling for the main query
  useEffect(() => {
    if (error) {
      toast({
        title: "Error Loading Jobs",
        description: "There was a problem loading your cron jobs.",
        variant: "destructive",
      });
      console.error("Error fetching cron jobs:", error);
    }
  }, [error, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">Loading cron jobs...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold tracking-tight">Job Scheduler</h2>
          {!isFormVisible && (
            <Button onClick={() => setIsFormVisible(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Job
            </Button>
          )}
          {isFormVisible && (
            <Button variant="outline" onClick={handleFormCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          )}
        </div>

        {isFormVisible ? (
          <div className="mb-8">
            <CronJobForm
              job={editingJob}
              onSubmit={editingJob ? handleUpdateJob : handleAddJob}
              onCancel={handleFormCancel}
            />
          </div>
        ) : (
          <>
            {jobs.length > 0 ? (
              <>
                <div className="mb-6">
                  <DashboardStats jobs={jobs} />
                </div>
                <div className="flex items-center gap-4 mb-4">
                  <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange}>
                    <TabsList>
                      <TabsTrigger value="all">All Jobs</TabsTrigger>
                      <TabsTrigger value="active">Active</TabsTrigger>
                      <TabsTrigger value="paused">Paused</TabsTrigger>
                    </TabsList>
                  </Tabs>
                  
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <Select value={selectedGroupId} onValueChange={handleGroupChange}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by group" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Groups</SelectItem>
                        {groups.map((group) => (
                          <SelectItem key={group.id} value={group.id}>
                            {group.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <CronJobList
                  jobs={filteredJobs}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggleStatus={handleToggleStatus}
                />
              </>
            ) : (
              <EmptyState onCreateNew={() => setIsFormVisible(true)} />
            )}
          </>
        )}
      </main>
      
      <footer className="border-t border-border py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>CronWizard - The friendly cron job scheduler</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

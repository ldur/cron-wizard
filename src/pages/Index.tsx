import { useState, useEffect } from "react";
import { Plus, X, Search, Tags } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
  fetchGroups
} from "@/services/cronJobService";

const Index = () => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingJob, setEditingJob] = useState<CronJob | undefined>(undefined);
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [nameFilter, setNameFilter] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  // Fetch groups
  useEffect(() => {
    const loadGroups = async () => {
      try {
        const fetchedGroups = await fetchGroups();
        setGroups(fetchedGroups);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load job groups",
          variant: "destructive",
        });
      }
    };
    loadGroups();
  }, []);

  // Query to fetch jobs
  const { data: jobs = [], isLoading, error } = useQuery({
    queryKey: ['cronJobs'],
    queryFn: fetchCronJobs,
  });

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
    mutationFn: ({ id, job }: { id: string; job: Partial<Omit<CronJob, 'id' | 'nextRun'>> }) => 
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

  const handleAddJob = (newJob: Omit<CronJob, "id" | "nextRun">) => {
    createJobMutation.mutate(newJob);
  };

  const handleUpdateJob = (updatedJob: Omit<CronJob, "id" | "nextRun">) => {
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

  // Extract unique tags from all jobs
  useEffect(() => {
    if (jobs.length > 0) {
      const tags = Array.from(new Set(jobs.flatMap(job => job.tags)));
      setAvailableTags(tags);
    }
  }, [jobs]);

  // Update the filtering logic to include name filter and tag filter
  const filteredJobs = jobs.filter(job => 
    (!selectedGroup || job.groupId === selectedGroup) &&
    (!nameFilter || job.name.toLowerCase().includes(nameFilter.toLowerCase())) &&
    (selectedTags.length === 0 || selectedTags.some(tag => job.tags.includes(tag)))
  );

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const filterByStatus = (status: 'active' | 'paused') => 
    filteredJobs.filter(job => job.status === status);

  // Error handling
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

  // Render loading state
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
                <div className="mb-4 flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span>Group:</span>
                    <select 
                      value={selectedGroup || ''} 
                      onChange={(e) => setSelectedGroup(e.target.value || null)}
                      className="border rounded px-2 py-1"
                    >
                      <option value="">All Groups</option>
                      {groups.map(group => (
                        <option key={group.id} value={group.id}>
                          {group.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-1 max-w-sm">
                    <div className="relative flex-1">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Filter by name..."
                        value={nameFilter}
                        onChange={(e) => setNameFilter(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 items-center">
                    <Tags className="h-4 w-4 text-muted-foreground" />
                    {availableTags.map(tag => (
                      <Button
                        key={tag}
                        variant={selectedTags.includes(tag) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleTagToggle(tag)}
                        className="h-8"
                      >
                        {tag}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div className="mb-6">
                  <DashboardStats 
                    jobs={jobs} 
                    nameFilter={nameFilter} 
                    selectedGroup={selectedGroup} 
                  />
                </div>
                
                <Tabs defaultValue="all">
                  <TabsList className="mb-4">
                    <TabsTrigger value="all">All Jobs</TabsTrigger>
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="paused">Paused</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="all">
                    <CronJobList
                      jobs={filteredJobs}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onToggleStatus={handleToggleStatus}
                    />
                  </TabsContent>
                  
                  <TabsContent value="active">
                    <CronJobList
                      jobs={filterByStatus('active')}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onToggleStatus={handleToggleStatus}
                    />
                  </TabsContent>
                  
                  <TabsContent value="paused">
                    <CronJobList
                      jobs={filterByStatus('paused')}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onToggleStatus={handleToggleStatus}
                    />
                  </TabsContent>
                </Tabs>
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

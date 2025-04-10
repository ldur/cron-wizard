
import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Header from "@/components/Header";
import CronJobList from "@/components/CronJobList";
import CronJobForm from "@/components/CronJobForm";
import EmptyState from "@/components/EmptyState";
import DashboardStats from "@/components/DashboardStats";
import { CronJob } from "@/types/CronJob";
import { calculateNextRun } from "@/utils/cronCalculator";
import { useToast } from "@/hooks/use-toast";

const generateId = () => Math.random().toString(36).substring(2, 9);

// Sample initial data for the demo
const sampleJobs: CronJob[] = [
  {
    id: generateId(),
    name: "Daily Database Backup",
    command: "https://api.example.com/backup",
    cronExpression: "0 2 * * *",
    status: "active",
    nextRun: calculateNextRun("0 2 * * *"),
  },
  {
    id: generateId(),
    name: "Weekly Analytics Report",
    command: "https://api.example.com/analytics/weekly",
    cronExpression: "0 9 * * 1",
    status: "active",
    nextRun: calculateNextRun("0 9 * * 1"),
  },
  {
    id: generateId(),
    name: "Monthly Invoice Generation",
    command: "https://api.example.com/billing/generate-invoices",
    cronExpression: "0 0 1 * *",
    status: "paused",
    nextRun: calculateNextRun("0 0 1 * *"),
  },
];

const Index = () => {
  const [jobs, setJobs] = useState<CronJob[]>(sampleJobs);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingJob, setEditingJob] = useState<CronJob | undefined>(undefined);
  const { toast } = useToast();

  const handleAddJob = (newJob: Omit<CronJob, "id" | "nextRun">) => {
    const jobToAdd: CronJob = {
      id: generateId(),
      ...newJob,
      nextRun: calculateNextRun(newJob.cronExpression),
    };

    setJobs([...jobs, jobToAdd]);
    setIsFormVisible(false);
    toast({
      title: "Job Created",
      description: "The cron job has been created successfully.",
    });
  };

  const handleUpdateJob = (updatedJob: Omit<CronJob, "id" | "nextRun">) => {
    if (!editingJob) return;

    const updatedJobs = jobs.map((job) =>
      job.id === editingJob.id
        ? {
            ...job,
            ...updatedJob,
            nextRun: calculateNextRun(updatedJob.cronExpression),
          }
        : job
    );

    setJobs(updatedJobs);
    setEditingJob(undefined);
    setIsFormVisible(false);
    toast({
      title: "Job Updated",
      description: "The cron job has been updated successfully.",
    });
  };

  const handleEdit = (job: CronJob) => {
    setEditingJob(job);
    setIsFormVisible(true);
  };

  const handleDelete = (id: string) => {
    setJobs(jobs.filter((job) => job.id !== id));
  };

  const handleToggleStatus = (id: string) => {
    const updatedJobs = jobs.map((job) =>
      job.id === id
        ? {
            ...job,
            status: job.status === "active" ? "paused" : "active",
          }
        : job
    );
    setJobs(updatedJobs);
    
    const job = updatedJobs.find(j => j.id === id);
    toast({
      title: job?.status === "active" ? "Job Activated" : "Job Paused",
      description: `The job "${job?.name}" has been ${job?.status === "active" ? "activated" : "paused"}.`,
    });
  };

  const handleFormCancel = () => {
    setIsFormVisible(false);
    setEditingJob(undefined);
  };

  // Function to simulate real-time job executions
  useEffect(() => {
    const interval = setInterval(() => {
      // Update nextRun times for a more dynamic UI
      setJobs((prevJobs) =>
        prevJobs.map((job) => ({
          ...job,
          nextRun: job.status === "active" ? calculateNextRun(job.cronExpression) : job.nextRun,
        }))
      );
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

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
                <Tabs defaultValue="all">
                  <TabsList className="mb-4">
                    <TabsTrigger value="all">All Jobs</TabsTrigger>
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="paused">Paused</TabsTrigger>
                  </TabsList>
                  <TabsContent value="all">
                    <CronJobList
                      jobs={jobs}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onToggleStatus={handleToggleStatus}
                    />
                  </TabsContent>
                  <TabsContent value="active">
                    <CronJobList
                      jobs={jobs.filter((job) => job.status === "active")}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onToggleStatus={handleToggleStatus}
                    />
                  </TabsContent>
                  <TabsContent value="paused">
                    <CronJobList
                      jobs={jobs.filter((job) => job.status === "paused")}
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

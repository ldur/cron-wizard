
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { History, Filter, Calendar, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import JobHistoryTable from "@/components/JobHistoryTable";
import Header from "@/components/Header";
import { fetchJobHistory } from "@/services/jobHistoryService";
import { fetchCronJobs } from "@/services/cronJobService";

const JobHistory = () => {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<string>('last-week');

  // Create date range based on selected time range
  const getDateRange = () => {
    const now = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'yesterday':
        startDate.setDate(now.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'last-week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'last-month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'last-3-months':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'last-6-months':
        startDate.setMonth(now.getMonth() - 6);
        break;
      default:
        startDate.setDate(now.getDate() - 7);  // Default to last week
    }
    
    return { startDate, endDate: now };
  };
  
  // Query to fetch jobs for dropdown
  const { data: jobs = [] } = useQuery({
    queryKey: ['cronJobs'],
    queryFn: fetchCronJobs,
  });
  
  // Query to fetch job history with filters
  const { data: history = [], isLoading } = useQuery({
    queryKey: ['jobHistory', selectedJobId, selectedStatus, timeRange],
    queryFn: () => {
      const { startDate, endDate } = getDateRange();
      return fetchJobHistory({
        jobId: selectedJobId || undefined,
        status: selectedStatus || undefined,
        startDate, 
        endDate
      });
    },
  });

  // Count results by status
  const statusCounts = {
    all: history.length,
    running: history.filter(h => h.status === 'Running').length,
    finished: history.filter(h => h.status === 'Finished').length,
    failed: history.filter(h => h.status === 'Failed').length,
  };

  // Function to filter history by status for the tabs
  const filterByStatus = (status: string | null) => {
    if (!status) return history;
    return history.filter(entry => entry.status === status);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <History className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold tracking-tight">Job History</h2>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base font-medium">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {/* Job Filter */}
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <Select value={selectedJobId || ''} onValueChange={(value) => setSelectedJobId(value || null)}>
                  <SelectTrigger className="min-w-[200px]">
                    <SelectValue placeholder="All Jobs" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Jobs</SelectItem>
                    {jobs.map(job => (
                      <SelectItem key={job.id} value={job.id}>{job.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={selectedStatus || ''} onValueChange={(value) => setSelectedStatus(value || null)}>
                  <SelectTrigger className="min-w-[200px]">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    <SelectItem value="Running">Running</SelectItem>
                    <SelectItem value="Finished">Finished</SelectItem>
                    <SelectItem value="Failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Time Range Filter */}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Select value={timeRange} onValueChange={(value) => setTimeRange(value)}>
                  <SelectTrigger className="min-w-[200px]">
                    <SelectValue placeholder="Time Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="yesterday">Yesterday</SelectItem>
                    <SelectItem value="last-week">Last Week</SelectItem>
                    <SelectItem value="last-month">Last Month</SelectItem>
                    <SelectItem value="last-3-months">Last 3 Months</SelectItem>
                    <SelectItem value="last-6-months">Last 6 Months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All ({statusCounts.all})</TabsTrigger>
            <TabsTrigger value="running">Running ({statusCounts.running})</TabsTrigger>
            <TabsTrigger value="finished">Finished ({statusCounts.finished})</TabsTrigger>
            <TabsTrigger value="failed">Failed ({statusCounts.failed})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            <JobHistoryTable history={history} isLoading={isLoading} />
          </TabsContent>
          
          <TabsContent value="running">
            <JobHistoryTable history={filterByStatus('Running')} isLoading={isLoading} />
          </TabsContent>
          
          <TabsContent value="finished">
            <JobHistoryTable history={filterByStatus('Finished')} isLoading={isLoading} />
          </TabsContent>
          
          <TabsContent value="failed">
            <JobHistoryTable history={filterByStatus('Failed')} isLoading={isLoading} />
          </TabsContent>
        </Tabs>
      </main>
      
      <footer className="border-t border-border py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>CronWizard - The friendly cron job scheduler</p>
        </div>
      </footer>
    </div>
  );
};

export default JobHistory;


import { Clock, CalendarCheck, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { CronJob } from "@/types/CronJob";

interface DashboardStatsProps {
  jobs: CronJob[];
}

const DashboardStats = ({ jobs }: DashboardStatsProps) => {
  const totalJobs = jobs.length;
  const activeJobs = jobs.filter(job => job.status === 'active').length;
  const pausedJobs = jobs.filter(job => job.status === 'paused').length;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Jobs</p>
              <h4 className="text-2xl font-bold mt-1">{totalJobs}</h4>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Jobs</p>
              <h4 className="text-2xl font-bold mt-1">{activeJobs}</h4>
            </div>
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
              <CalendarCheck className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Paused Jobs</p>
              <h4 className="text-2xl font-bold mt-1">{pausedJobs}</h4>
            </div>
            <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-amber-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;

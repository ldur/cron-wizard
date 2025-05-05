
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CustomHeader from "@/components/CustomHeader";
import JobHistoryTable from "@/components/JobHistoryTable";
import { fetchAllJobHistory } from "@/services/jobHistoryService";
import { useQuery } from "@tanstack/react-query";

const JobHistoryPage = () => {
  const { data: jobHistory, isLoading } = useQuery({
    queryKey: ['jobHistory'],
    queryFn: fetchAllJobHistory
  });

  return (
    <div className="min-h-screen bg-background">
      <CustomHeader />
      <main className="container mx-auto p-4 space-y-4 pt-16">
        <Card>
          <CardHeader>
            <CardTitle>Job History</CardTitle>
          </CardHeader>
          <CardContent>
            <JobHistoryTable 
              jobHistory={jobHistory || []} 
              isLoading={isLoading} 
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default JobHistoryPage;

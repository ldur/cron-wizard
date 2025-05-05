
import { useState } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { JobHistoryWithJobDetails } from "@/types/JobHistory";
import { PlayCircle, CheckCircle, XCircle, Clock } from "lucide-react";

interface JobHistoryTableProps {
  jobHistory: JobHistoryWithJobDetails[];
  isLoading?: boolean;
}

const JobHistoryTable = ({ jobHistory, isLoading = false }: JobHistoryTableProps) => {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  
  const toggleRow = (id: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  const formatDuration = (seconds: number | null) => {
    if (seconds === null) return "N/A";
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Running':
        return <PlayCircle className="h-4 w-4 text-blue-500" />;
      case 'Finished':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'Failed':
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Running':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Running</Badge>;
      case 'Finished':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Finished</Badge>;
      case 'Failed':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Failed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  
  if (isLoading) {
    return (
      <div className="w-full p-8 flex items-center justify-center">
        <p className="text-muted-foreground">Loading job history...</p>
      </div>
    );
  }
  
  if (jobHistory.length === 0) {
    return (
      <div className="w-full p-8 flex items-center justify-center">
        <p className="text-muted-foreground">No job history available.</p>
      </div>
    );
  }
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Job Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Started</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead>Details</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {jobHistory.map((record) => (
          <>
            <TableRow key={record.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => toggleRow(record.id)}>
              <TableCell>{record.job_name}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {getStatusIcon(record.status)}
                  {getStatusBadge(record.status)}
                </div>
              </TableCell>
              <TableCell>{format(new Date(record.start_time), 'MMM d, yyyy HH:mm:ss')}</TableCell>
              <TableCell>{formatDuration(record.runtime_seconds)}</TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" onClick={(e) => {
                  e.stopPropagation();
                  toggleRow(record.id);
                }}>
                  {expandedRows[record.id] ? 'Hide Details' : 'Show Details'}
                </Button>
              </TableCell>
            </TableRow>
            {expandedRows[record.id] && (
              <TableRow>
                <TableCell colSpan={5} className="bg-muted/30 p-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-sm">Job Details</h4>
                        <p className="text-sm text-muted-foreground">ID: {record.job_id}</p>
                        <p className="text-sm text-muted-foreground">Type: {record.job_type}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">Time Details</h4>
                        <p className="text-sm text-muted-foreground">
                          Started: {format(new Date(record.start_time), 'MMM d, yyyy HH:mm:ss')}
                        </p>
                        {record.end_time && (
                          <p className="text-sm text-muted-foreground">
                            Finished: {format(new Date(record.end_time), 'MMM d, yyyy HH:mm:ss')}
                          </p>
                        )}
                        {record.runtime_seconds !== null && (
                          <p className="text-sm text-muted-foreground">
                            Total Duration: {formatDuration(record.runtime_seconds)}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {record.status_text && (
                      <div>
                        <h4 className="font-medium text-sm">Status Message</h4>
                        <div className="bg-muted p-3 rounded-md mt-1">
                          <p className="text-sm font-mono whitespace-pre-wrap">{record.status_text}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </>
        ))}
      </TableBody>
    </Table>
  );
};

export default JobHistoryTable;

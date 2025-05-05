
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { JobHistoryEntry } from "@/services/jobHistoryService";
import { Clock, CheckCircle, XCircle, Play } from "lucide-react";

interface JobHistoryTableProps {
  history: JobHistoryEntry[];
  isLoading: boolean;
}

const JobHistoryTable = ({ history, isLoading }: JobHistoryTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Calculate pagination
  const totalPages = Math.ceil(history.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, history.length);
  const currentItems = history.slice(startIndex, endIndex);
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Finished':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'Running':
        return <Play className="h-4 w-4 text-blue-500" />;
      case 'Failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Finished':
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case 'Running':
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case 'Failed':
        return "bg-red-100 text-red-800 hover:bg-red-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">Loading job history...</p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">No job history found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job Name</TableHead>
              <TableHead>Start Time</TableHead>
              <TableHead>End Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Runtime</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.map(entry => (
              <TableRow key={entry.id}>
                <TableCell className="font-medium">{entry.job_name}</TableCell>
                <TableCell>{entry.formatted_start_time}</TableCell>
                <TableCell>{entry.status === 'Running' ? '—' : entry.formatted_end_time}</TableCell>
                <TableCell>
                  <Badge className={`flex items-center gap-1 ${getStatusColor(entry.status)}`}>
                    {getStatusIcon(entry.status)}
                    {entry.status}
                  </Badge>
                </TableCell>
                <TableCell>{entry.formatted_runtime}</TableCell>
                <TableCell className="max-w-xs truncate" title={entry.status_text || ''}>
                  {entry.status_text}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <PaginationItem key={page}>
                <PaginationLink 
                  isActive={page === currentPage}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            
            <PaginationItem>
              <PaginationNext 
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default JobHistoryTable;

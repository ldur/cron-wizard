
import { CalendarClock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onCreateNew: () => void;
}

const EmptyState = ({ onCreateNew }: EmptyStateProps) => {
  return (
    <div className="text-center py-16 px-4">
      <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-6">
        <CalendarClock className="h-8 w-8 text-muted-foreground" />
      </div>
      <h2 className="text-2xl font-semibold tracking-tight mb-2">No cron jobs yet</h2>
      <p className="text-muted-foreground max-w-md mx-auto mb-6">
        Create your first job to schedule automated tasks using simple natural language or CRON expressions.
      </p>
      <Button onClick={onCreateNew}>
        <Plus className="h-4 w-4 mr-2" />
        Create Your First Job
      </Button>
    </div>
  );
};

export default EmptyState;

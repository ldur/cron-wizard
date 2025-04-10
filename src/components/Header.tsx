
import { CalendarClock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Header = () => {
  const { toast } = useToast();

  const handleNewFeature = () => {
    toast({
      title: "Coming Soon",
      description: "This feature is under development and will be available soon.",
    });
  };

  return (
    <header className="border-b border-border">
      <div className="container mx-auto py-4 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarClock className="h-7 w-7 text-wizard" />
          <h1 className="text-2xl font-bold tracking-tight">CronWizard</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleNewFeature}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Documentation
          </button>
          <button
            onClick={handleNewFeature}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors ml-4"
          >
            Settings
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;

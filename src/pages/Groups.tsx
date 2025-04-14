
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import GroupManagement from "@/components/GroupManagement";
import { fetchGroups } from "@/services/cronJobService";

const Groups = () => {
  const [groups, setGroups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadGroups = async () => {
    setIsLoading(true);
    try {
      const fetchedGroups = await fetchGroups();
      setGroups(fetchedGroups);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load job groups",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGroups();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold tracking-tight">Job Groups</h2>
          <p className="text-muted-foreground mt-2">
            Organize your cron jobs by creating and managing groups.
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading groups...</p>
          </div>
        ) : (
          <div className="bg-card rounded-lg shadow-sm border p-6">
            <GroupManagement groups={groups} onGroupsChanged={loadGroups} />
          </div>
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

export default Groups;


import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import ScheduleGroupList from "@/components/ScheduleGroupList";
import ScheduleGroupForm from "@/components/ScheduleGroupForm";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  fetchScheduleGroups, 
  createScheduleGroup, 
  updateScheduleGroup, 
  deleteScheduleGroup,
  type ScheduleGroup
} from "@/services/scheduleGroupService";

const ScheduleGroups = () => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingGroup, setEditingGroup] = useState<ScheduleGroup | undefined>(undefined);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query to fetch schedule groups
  const { data: groups = [], isLoading, error } = useQuery({
    queryKey: ['scheduleGroups'],
    queryFn: fetchScheduleGroups,
  });

  // Mutations for CRUD operations
  const createGroupMutation = useMutation({
    mutationFn: createScheduleGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduleGroups'] });
      setIsFormVisible(false);
      toast({
        title: "Group Created",
        description: "The schedule group has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create group: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updateGroupMutation = useMutation({
    mutationFn: ({ id, group }: { id: string; group: { name: string } }) => 
      updateScheduleGroup(id, group),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduleGroups'] });
      setEditingGroup(undefined);
      setIsFormVisible(false);
      toast({
        title: "Group Updated",
        description: "The schedule group has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update group: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deleteGroupMutation = useMutation({
    mutationFn: deleteScheduleGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduleGroups'] });
      toast({
        title: "Group Deleted",
        description: "The schedule group has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete group: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleAddGroup = (data: { name: string }) => {
    createGroupMutation.mutate(data);
  };

  const handleUpdateGroup = (data: { name: string }) => {
    if (!editingGroup) return;
    updateGroupMutation.mutate({ 
      id: editingGroup.id, 
      group: data
    });
  };

  const handleEdit = (group: ScheduleGroup) => {
    setEditingGroup(group);
    setIsFormVisible(true);
  };

  const handleDelete = (id: string) => {
    deleteGroupMutation.mutate(id);
  };

  const handleFormCancel = () => {
    setIsFormVisible(false);
    setEditingGroup(undefined);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">Loading schedule groups...</p>
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
          <h2 className="text-3xl font-bold tracking-tight">Schedule Groups</h2>
          {!isFormVisible && (
            <Button onClick={() => setIsFormVisible(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Group
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
            <ScheduleGroupForm
              group={editingGroup}
              onSubmit={editingGroup ? handleUpdateGroup : handleAddGroup}
              onCancel={handleFormCancel}
            />
          </div>
        ) : (
          <ScheduleGroupList
            groups={groups}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
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

export default ScheduleGroups;

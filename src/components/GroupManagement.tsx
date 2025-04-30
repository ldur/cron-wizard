
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { createGroup, updateGroup, deleteGroup } from "@/services/cronJobService";
import { GroupList } from "./groups/GroupList";
import { GroupDialog } from "./groups/GroupDialog";
import { Group } from "./groups/types";

interface GroupManagementProps {
  groups: any[];
  onGroupsChanged: () => void;
}

const GroupManagement = ({ groups, onGroupsChanged }: GroupManagementProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const { toast } = useToast();

  const handleOpenDialog = (group?: Group) => {
    if (group) {
      setEditingGroup(group);
    } else {
      setEditingGroup(null);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingGroup(null);
  };

  const handleSaveGroup = async (groupName: string, iconName: string) => {
    if (!groupName.trim()) {
      toast({
        title: "Error",
        description: "Group name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingGroup) {
        await updateGroup(editingGroup.id, groupName, iconName);
        toast({
          title: "Group Updated",
          description: "The group has been updated successfully.",
        });
      } else {
        await createGroup(groupName, iconName);
        toast({
          title: "Group Created",
          description: "The group has been created successfully.",
        });
      }
      setIsDialogOpen(false);
      onGroupsChanged();
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to ${editingGroup ? "update" : "create"} group: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleDeleteGroup = async (id: string) => {
    // Don't allow deletion of the Default group
    const group = groups.find(g => g.id === id);
    if (group && group.name === "Default") {
      toast({
        title: "Cannot Delete Default Group",
        description: "The Default group cannot be deleted.",
        variant: "destructive",
      });
      return;
    }

    if (!confirm("Are you sure you want to delete this group? All jobs in this group will be moved to the Default group.")) {
      return;
    }

    try {
      await deleteGroup(id);
      toast({
        title: "Group Deleted",
        description: "The group has been deleted successfully.",
      });
      onGroupsChanged();
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to delete group: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Job Groups</h3>
        <Button size="sm" onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          New Group
        </Button>
      </div>
      
      <GroupList 
        groups={groups} 
        onEditGroup={handleOpenDialog}
        onDeleteGroup={handleDeleteGroup}
      />

      <GroupDialog 
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        onSave={handleSaveGroup}
        group={editingGroup}
      />
    </div>
  );
};

export default GroupManagement;

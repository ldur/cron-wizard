
import { useState } from "react";
import { Plus, Edit, Trash2, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { createGroup, updateGroup, deleteGroup } from "@/services/cronJobService";
import { useToast } from "@/hooks/use-toast";

interface GroupManagementProps {
  groups: any[];
  onGroupsChanged: () => void;
}

const GroupManagement = ({ groups, onGroupsChanged }: GroupManagementProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<any | null>(null);
  const [groupName, setGroupName] = useState("");
  const { toast } = useToast();

  const handleOpenDialog = (group?: any) => {
    if (group) {
      setEditingGroup(group);
      setGroupName(group.name);
    } else {
      setEditingGroup(null);
      setGroupName("");
    }
    setIsDialogOpen(true);
  };

  const handleSaveGroup = async () => {
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
        await updateGroup(editingGroup.id, groupName);
        toast({
          title: "Group Updated",
          description: "The group has been updated successfully.",
        });
      } else {
        await createGroup(groupName);
        toast({
          title: "Group Created",
          description: "The group has been created successfully.",
        });
      }
      setIsDialogOpen(false);
      onGroupsChanged();
    } catch (error) {
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
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to delete group: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const isDefaultGroup = (name: string) => name === "Default";

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Job Groups</h3>
        <Button size="sm" onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          New Group
        </Button>
      </div>

      <div className="space-y-2">
        {groups.map(group => (
          <div
            key={group.id}
            className="flex justify-between items-center p-2 border rounded-md hover:bg-muted/50"
          >
            <span>{group.name}</span>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleOpenDialog(group)}
                disabled={isDefaultGroup(group.name)}
              >
                <Edit className="h-4 w-4" />
                <span className="sr-only">Edit</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteGroup(group.id)}
                disabled={isDefaultGroup(group.name)}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete</span>
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingGroup ? "Edit Group" : "Create Group"}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="groupName" className="text-sm font-medium">
                  Group Name
                </label>
                <Input
                  id="groupName"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Enter group name"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSaveGroup}>
              <Check className="h-4 w-4 mr-2" />
              {editingGroup ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GroupManagement;


import { useState } from "react";
import { 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  Check, 
  Briefcase, 
  Folder,
  Calendar,
  Clock,
  AlarmClock,
  Timer,
  CalendarClock,
  CalendarDays,
  CalendarCheck,
  Truck,
  Package,
  Box,
  Clipboard,
  ClipboardCheck,
  ClipboardList,
  List,
  ListTodo,
  CheckSquare,
  ListChecks,
  FileSpreadsheet,
  FileText,
  Database,
  HardDrive,
  Megaphone,
  Bell,
  Mail,
  MessageSquare,
  Users,
  FolderTree,
  Network,
  LayoutGrid,
  Activity,
  LineChart,
  BarChart,
  Gauge,
  TimerReset
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const [iconName, setIconName] = useState("folder");
  const { toast } = useToast();

  // Available icons for groups - expanded with many job scheduling and logistics related icons
  const availableIcons = [
    // Scheduling related icons
    { name: "calendar", icon: Calendar, category: "Scheduling" },
    { name: "clock", icon: Clock, category: "Scheduling" },
    { name: "alarm-clock", icon: AlarmClock, category: "Scheduling" },
    { name: "timer", icon: Timer, category: "Scheduling" },
    { name: "calendar-clock", icon: CalendarClock, category: "Scheduling" },
    { name: "calendar-days", icon: CalendarDays, category: "Scheduling" },
    { name: "calendar-check", icon: CalendarCheck, category: "Scheduling" },
    { name: "timer-reset", icon: TimerReset, category: "Scheduling" },
    
    // Logistics related icons
    { name: "truck", icon: Truck, category: "Logistics" },
    { name: "package", icon: Package, category: "Logistics" },
    { name: "box", icon: Box, category: "Logistics" },
    
    // Task management icons
    { name: "clipboard", icon: Clipboard, category: "Tasks" },
    { name: "clipboard-check", icon: ClipboardCheck, category: "Tasks" },
    { name: "clipboard-list", icon: ClipboardList, category: "Tasks" },
    { name: "list", icon: List, category: "Tasks" },
    { name: "list-todo", icon: ListTodo, category: "Tasks" },
    { name: "check-square", icon: CheckSquare, category: "Tasks" },
    { name: "list-checks", icon: ListChecks, category: "Tasks" },
    
    // Data related icons
    { name: "file-spreadsheet", icon: FileSpreadsheet, category: "Data" },
    { name: "file-text", icon: FileText, category: "Data" },
    { name: "database", icon: Database, category: "Data" },
    { name: "hard-drive", icon: HardDrive, category: "Data" },
    
    // Communication icons
    { name: "megaphone", icon: Megaphone, category: "Communication" },
    { name: "bell", icon: Bell, category: "Communication" },
    { name: "mail", icon: Mail, category: "Communication" },
    { name: "message-square", icon: MessageSquare, category: "Communication" },
    
    // Organizational icons
    { name: "users", icon: Users, category: "Organization" },
    { name: "folder-tree", icon: FolderTree, category: "Organization" },
    { name: "network", icon: Network, category: "Organization" },
    { name: "layout-grid", icon: LayoutGrid, category: "Organization" },
    { name: "folder", icon: Folder, category: "Organization" },
    { name: "briefcase", icon: Briefcase, category: "Organization" },
    
    // Status icons
    { name: "activity", icon: Activity, category: "Status" },
    { name: "line-chart", icon: LineChart, category: "Status" },
    { name: "bar-chart", icon: BarChart, category: "Status" },
    { name: "gauge", icon: Gauge, category: "Status" }
  ];

  // Helper function to get icon component by name
  const getIconComponent = (name: string) => {
    const iconObj = availableIcons.find(i => i.name === name);
    return iconObj ? iconObj.icon : Folder; // Default to Folder if not found
  };

  const handleOpenDialog = (group?: any) => {
    if (group) {
      setEditingGroup(group);
      setGroupName(group.name);
      setIconName(group.icon_name || "folder");
    } else {
      setEditingGroup(null);
      setGroupName("");
      setIconName("folder");
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

  // Group the icons by category for better organization in the dropdown
  const groupedIcons = availableIcons.reduce((acc, icon) => {
    if (!acc[icon.category]) {
      acc[icon.category] = [];
    }
    acc[icon.category].push(icon);
    return acc;
  }, {} as Record<string, typeof availableIcons>);

  const categories = Object.keys(groupedIcons).sort();

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
        {groups.map(group => {
          const IconComponent = getIconComponent(group.icon_name || "folder");
          return (
            <div
              key={group.id}
              className="flex justify-between items-center p-2 border rounded-md hover:bg-muted/50"
            >
              <div className="flex items-center gap-2">
                <IconComponent className="h-4 w-4 text-blue-500" />
                <span>{group.name}</span>
              </div>
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
          );
        })}
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
              <div className="space-y-2">
                <label htmlFor="iconName" className="text-sm font-medium">
                  Icon
                </label>
                <Select value={iconName} onValueChange={setIconName}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select an icon" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {categories.map(category => (
                      <div key={category}>
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                          {category}
                        </div>
                        {groupedIcons[category].map(icon => {
                          const IconComponent = icon.icon;
                          return (
                            <SelectItem key={icon.name} value={icon.name}>
                              <div className="flex items-center gap-2">
                                <IconComponent className="h-4 w-4" />
                                <span className="capitalize">{icon.name.replace(/-/g, " ")}</span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
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

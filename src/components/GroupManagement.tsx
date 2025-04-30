
import { useState } from "react";
import { 
  Plus, Edit, Trash2, X, Check, Briefcase, Folder, ChartBar,
  // Reports icons
  FileText, FileSpreadsheet, ClipboardList, Receipt, ChartBar as ChartBarIcon, ChartPie, BarChart4, LineChart, PieChart, Presentation,
  // Calendar icons
  Calendar, CalendarDays, CalendarClock, CalendarRange, Clock, Timer, Hourglass, AlarmClock, CalendarCheck, 
  // Cloud operation icons
  Cloud, CloudCog, Database, Server, ServerCog, CloudUpload, CloudDownload, CloudOff, Laptop, Globe,
  // Maintenance icons
  Wrench, Settings, Cog, Hammer, HardHat, ShieldAlert, Bell, BellRing
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { createGroup, updateGroup, deleteGroup } from "@/services/cronJobService";
import { useToast } from "@/hooks/use-toast";

interface GroupManagementProps {
  groups: any[];
  onGroupsChanged: () => void;
}

// Define the icon type for better type safety
interface IconItem {
  name: string;
  icon: React.ComponentType<any>;
  category: string;
}

// Type for the categorized icons
type IconCategories = [string, IconItem[]][];

const GroupManagement = ({ groups, onGroupsChanged }: GroupManagementProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<any | null>(null);
  const [groupName, setGroupName] = useState("");
  const [iconName, setIconName] = useState("folder");
  const [iconSearchOpen, setIconSearchOpen] = useState(false);
  const { toast } = useToast();

  // Available icons for groups - organized by category
  const availableIcons: IconItem[] = [
    // Reports category
    { name: "file-text", icon: FileText, category: "Reports" },
    { name: "file-spreadsheet", icon: FileSpreadsheet, category: "Reports" },
    { name: "clipboard-list", icon: ClipboardList, category: "Reports" },
    { name: "receipt", icon: Receipt, category: "Reports" },
    { name: "chart-bar", icon: ChartBarIcon, category: "Reports" },
    { name: "chart-pie", icon: ChartPie, category: "Reports" },
    { name: "bar-chart-4", icon: BarChart4, category: "Reports" },
    { name: "line-chart", icon: LineChart, category: "Reports" },
    { name: "pie-chart", icon: PieChart, category: "Reports" },
    { name: "presentation", icon: Presentation, category: "Reports" },
    
    // Calendar category
    { name: "calendar", icon: Calendar, category: "Calendar" },
    { name: "calendar-days", icon: CalendarDays, category: "Calendar" },
    { name: "calendar-clock", icon: CalendarClock, category: "Calendar" },
    { name: "calendar-range", icon: CalendarRange, category: "Calendar" },
    { name: "calendar-check", icon: CalendarCheck, category: "Calendar" },
    { name: "clock", icon: Clock, category: "Calendar" },
    { name: "timer", icon: Timer, category: "Calendar" },
    { name: "hourglass", icon: Hourglass, category: "Calendar" },
    { name: "alarm-clock", icon: AlarmClock, category: "Calendar" },
    
    // Cloud operations category
    { name: "cloud", icon: Cloud, category: "Cloud Operations" },
    { name: "cloud-cog", icon: CloudCog, category: "Cloud Operations" },
    { name: "cloud-upload", icon: CloudUpload, category: "Cloud Operations" },
    { name: "cloud-download", icon: CloudDownload, category: "Cloud Operations" },
    { name: "cloud-off", icon: CloudOff, category: "Cloud Operations" },
    { name: "database", icon: Database, category: "Cloud Operations" },
    { name: "server", icon: Server, category: "Cloud Operations" },
    { name: "server-cog", icon: ServerCog, category: "Cloud Operations" },
    { name: "laptop", icon: Laptop, category: "Cloud Operations" },
    { name: "globe", icon: Globe, category: "Cloud Operations" },
    
    // Maintenance category
    { name: "folder", icon: Folder, category: "Other" },
    { name: "briefcase", icon: Briefcase, category: "Other" },
    { name: "wrench", icon: Wrench, category: "Maintenance" },
    { name: "settings", icon: Settings, category: "Maintenance" },
    { name: "cog", icon: Cog, category: "Maintenance" },
    { name: "hammer", icon: Hammer, category: "Maintenance" },
    { name: "hard-hat", icon: HardHat, category: "Maintenance" },
    { name: "shield-alert", icon: ShieldAlert, category: "Maintenance" },
    { name: "bell", icon: Bell, category: "Maintenance" },
    { name: "bell-ring", icon: BellRing, category: "Maintenance" }
  ];

  // Helper function to get icon component by name
  const getIconComponent = (name: string) => {
    const iconObj = availableIcons.find(i => i.name === name);
    return iconObj ? iconObj.icon : Folder; // Default to Folder if not found
  };

  // Group icons by category - fixed to ensure we always have a valid iterable result
  const groupIconsByCategory = (): IconCategories => {
    // Initialize with an empty object
    const categorizedIcons: Record<string, IconItem[]> = {};
    
    // Group icons by their category
    availableIcons.forEach(icon => {
      if (!categorizedIcons[icon.category]) {
        categorizedIcons[icon.category] = [];
      }
      categorizedIcons[icon.category].push(icon);
    });
    
    // Convert to array of [category, icons[]] entries
    return Object.entries(categorizedIcons);
  };
  
  // Get categorized icons - explicitly cast to ensure correct typing
  const iconCategories: IconCategories = groupIconsByCategory();

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
                
                <Popover open={iconSearchOpen} onOpenChange={setIconSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={iconSearchOpen}
                      className="w-full justify-between"
                    >
                      <div className="flex items-center gap-2">
                        {(() => {
                          const IconComponent = getIconComponent(iconName);
                          return <IconComponent className="h-4 w-4" />;
                        })()}
                        <span className="capitalize">{iconName.replace(/-/g, ' ')}</span>
                      </div>
                      <ChartBar className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search icons..." />
                      <CommandEmpty>No icon found.</CommandEmpty>
                      <div className="max-h-[300px] overflow-y-auto">
                        {iconCategories.map(([category, icons]) => (
                          <CommandGroup key={category} heading={category}>
                            {icons.map((icon) => {
                              const IconComponent = icon.icon;
                              return (
                                <CommandItem
                                  key={icon.name}
                                  value={icon.name}
                                  onSelect={(currentValue) => {
                                    setIconName(currentValue);
                                    setIconSearchOpen(false);
                                  }}
                                >
                                  <div className="flex items-center gap-2">
                                    <IconComponent className="h-4 w-4" />
                                    <span className="capitalize">{icon.name.replace(/-/g, ' ')}</span>
                                  </div>
                                  {iconName === icon.name && <Check className="h-4 w-4 ml-auto" />}
                                </CommandItem>
                              );
                            })}
                          </CommandGroup>
                        ))}
                      </div>
                    </Command>
                  </PopoverContent>
                </Popover>
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

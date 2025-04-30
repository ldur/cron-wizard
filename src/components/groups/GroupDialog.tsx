
import { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Group } from "./types";
import { IconPicker } from "./IconPicker";
import { getDefaultIcon } from "./utils";

interface GroupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (groupName: string, iconName: string) => void;
  group?: Group | null;
}

export const GroupDialog = ({ isOpen, onClose, onSave, group }: GroupDialogProps) => {
  const [groupName, setGroupName] = useState("");
  const [iconName, setIconName] = useState(getDefaultIcon().name);
  
  useEffect(() => {
    if (group) {
      setGroupName(group.name);
      setIconName(group.icon_name || getDefaultIcon().name);
    } else {
      setGroupName("");
      setIconName(getDefaultIcon().name);
    }
  }, [group, isOpen]);

  const handleSave = () => {
    onSave(groupName, iconName);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{group ? "Edit Group" : "Create Group"}</DialogTitle>
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
              <IconPicker value={iconName} onChange={setIconName} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Check className="h-4 w-4 mr-2" />
            {group ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Group } from "./types";
import { getIconComponent } from "./utils";

interface GroupItemProps {
  group: Group;
  onEdit: (group: Group) => void;
  onDelete: (id: string) => void;
}

export const GroupItem = ({ group, onEdit, onDelete }: GroupItemProps) => {
  const IconComponent = getIconComponent(group.icon_name);
  const isDefaultGroup = group.name === "Default";

  return (
    <div className="flex justify-between items-center p-2 border rounded-md hover:bg-muted/50">
      <div className="flex items-center gap-2">
        {IconComponent && <IconComponent className="h-4 w-4 text-blue-500" />}
        <span>{group.name}</span>
      </div>
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(group)}
          disabled={isDefaultGroup}
        >
          <Edit className="h-4 w-4" />
          <span className="sr-only">Edit</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(group.id)}
          disabled={isDefaultGroup}
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete</span>
        </Button>
      </div>
    </div>
  );
};

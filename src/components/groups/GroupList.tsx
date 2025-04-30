
import { Group } from "./types";
import { GroupItem } from "./GroupItem";

interface GroupListProps {
  groups: Group[];
  onEditGroup: (group: Group) => void;
  onDeleteGroup: (id: string) => void;
}

export const GroupList = ({ groups, onEditGroup, onDeleteGroup }: GroupListProps) => {
  return (
    <div className="space-y-2">
      {groups.map(group => (
        <GroupItem 
          key={group.id}
          group={group}
          onEdit={onEditGroup}
          onDelete={onDeleteGroup}
        />
      ))}
    </div>
  );
};

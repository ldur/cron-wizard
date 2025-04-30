
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { availableIcons } from "./iconData";
import { getIconComponent } from "./utils";

interface IconPickerProps {
  value: string;
  onChange: (value: string) => void;
}

export const IconPicker = ({ value, onChange }: IconPickerProps) => {
  // Group icons by category
  const iconsByCategory: Record<string, typeof availableIcons> = {};
  
  availableIcons.forEach((icon) => {
    if (!iconsByCategory[icon.category]) {
      iconsByCategory[icon.category] = [];
    }
    iconsByCategory[icon.category].push(icon);
  });

  // Get the current icon component
  const IconComponent = getIconComponent(value);

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <div className="flex items-center gap-2">
          {IconComponent && <IconComponent className="h-4 w-4" />}
          <span>{value}</span>
        </div>
      </SelectTrigger>
      <SelectContent className="max-h-[300px]">
        <ScrollArea className="h-[300px]">
          {Object.entries(iconsByCategory).map(([category, icons]) => (
            <SelectGroup key={category}>
              <SelectLabel>{category}</SelectLabel>
              {icons.map((icon) => {
                const ItemIcon = icon.icon;
                return (
                  <SelectItem key={icon.name} value={icon.name}>
                    <div className="flex items-center gap-2">
                      <ItemIcon className="h-4 w-4" />
                      <span className="capitalize">{icon.name.replace(/-/g, ' ')}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectGroup>
          ))}
        </ScrollArea>
      </SelectContent>
    </Select>
  );
};

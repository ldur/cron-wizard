
import { useState } from "react";
import { Check, ChartBar } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { IconItem, IconCategories } from "./types";
import { availableIcons } from "./iconData";

interface IconPickerProps {
  value: string;
  onChange: (value: string) => void;
}

export const IconPicker = ({ value, onChange }: IconPickerProps) => {
  const [open, setOpen] = useState(false);

  // Helper function to get icon component by name
  const getIconComponent = (name: string) => {
    const iconObj = availableIcons.find(i => i.name === name);
    return iconObj ? iconObj.icon : null;
  };

  // Group icons by category
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

  // Get the current icon component
  const IconComponent = getIconComponent(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <div className="flex items-center gap-2">
            {IconComponent && <IconComponent className="h-4 w-4" />}
            <span className="capitalize">{value.replace(/-/g, ' ')}</span>
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
                        onChange(currentValue);
                        setOpen(false);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-4 w-4" />
                        <span className="capitalize">{icon.name.replace(/-/g, ' ')}</span>
                      </div>
                      {value === icon.name && <Check className="h-4 w-4 ml-auto" />}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            ))}
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

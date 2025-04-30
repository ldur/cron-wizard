
import { availableIcons } from "./iconData";
import { IconItem } from "./types";

// Helper function to get icon component by name
export const getIconComponent = (name: string) => {
  const iconObj = availableIcons.find(i => i.name === name);
  return iconObj ? iconObj.icon : availableIcons[0].icon; // Default to first icon if not found
};

// Check if a group is the default group
export const isDefaultGroup = (name: string) => name === "Default";

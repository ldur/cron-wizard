
import { availableIcons } from "./iconData";
import { IconItem } from "./types";

// Helper function to get icon component by name
export const getIconComponent = (name: string) => {
  // Default to folder icon if name is undefined or not found
  if (!name) {
    const defaultIcon = availableIcons.find(i => i.name === "folder");
    return defaultIcon ? defaultIcon.icon : null;
  }
  
  const iconObj = availableIcons.find(i => i.name === name);
  return iconObj ? iconObj.icon : getDefaultIcon().icon;
};

// Get a default icon (folder)
export const getDefaultIcon = (): IconItem => {
  return availableIcons.find(i => i.name === "folder") || availableIcons[0];
};

// Check if a group is the default group
export const isDefaultGroup = (name: string) => name === "Default";

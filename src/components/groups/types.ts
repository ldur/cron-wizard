
// Group and icon related types
export interface Group {
  id: string;
  name: string;
  icon_name: string; // Make this required, not optional
}

export interface IconItem {
  name: string;
  icon: React.ComponentType<any>;
  category: string;
}

// Type for the categorized icons
export type IconCategories = Record<string, IconItem[]>;


// Group and icon related types
export interface Group {
  id: string;
  name: string;
  icon_name?: string;
}

export interface IconItem {
  name: string;
  icon: React.ComponentType<any>;
  category: string;
}

// Type for the categorized icons
export type IconCategories = [string, IconItem[]][];

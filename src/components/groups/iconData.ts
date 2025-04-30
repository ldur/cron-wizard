
import { 
  // Reports icons
  FileText, FileSpreadsheet, ClipboardList, Receipt, ChartBar, ChartPie,
  BarChart4, LineChart, PieChart, Presentation,
  // Calendar icons
  Calendar, CalendarDays, CalendarClock, CalendarRange, Clock,
  Timer, Hourglass, AlarmClock, CalendarCheck,
  // Cloud operation icons
  Cloud, CloudCog, Database, Server, ServerCog, CloudUpload, CloudDownload,
  CloudOff, Laptop, Globe,
  // Maintenance icons
  Wrench, Settings, Cog, Hammer, HardHat, ShieldAlert, Bell, BellRing,
  // Default icons
  Folder, Briefcase
} from "lucide-react";
import { IconItem } from "./types";

// Available icons for groups - organized by category
export const availableIcons: IconItem[] = [
  // Reports category
  { name: "file-text", icon: FileText, category: "Reports" },
  { name: "file-spreadsheet", icon: FileSpreadsheet, category: "Reports" },
  { name: "clipboard-list", icon: ClipboardList, category: "Reports" },
  { name: "receipt", icon: Receipt, category: "Reports" },
  { name: "chart-bar", icon: ChartBar, category: "Reports" },
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

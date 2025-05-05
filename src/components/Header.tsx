
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, UsersRound, Settings, CalendarClock, Target, History } from "lucide-react";

const Header = () => {
  const location = useLocation();

  // Function to check if a path is active
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-background border-b">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-2">
          <CalendarClock className="h-6 w-6 text-accent" />
          <h1 className="text-2xl font-semibold font-mono">
            <Link to="/">Scheduler</Link>
          </h1>
        </div>
        <nav className="hidden md:flex space-x-4">
          <Button
            asChild
            variant={isActive("/") ? "default" : "ghost"}
          >
            <Link to="/" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
          </Button>

          <Button
            asChild
            variant={isActive("/job-history") ? "default" : "ghost"}
          >
            <Link to="/job-history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Job History
            </Link>
          </Button>

          <Button
            asChild
            variant={isActive("/groups") ? "default" : "ghost"}
          >
            <Link to="/groups" className="flex items-center gap-2">
              <UsersRound className="h-4 w-4" />
              Groups
            </Link>
          </Button>

          <Button
            asChild
            variant={isActive("/target-templates") ? "default" : "ghost"}
          >
            <Link to="/target-templates" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Target Templates
            </Link>
          </Button>

          <Button
            asChild
            variant={isActive("/settings") ? "default" : "ghost"}
          >
            <Link to="/settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Header;

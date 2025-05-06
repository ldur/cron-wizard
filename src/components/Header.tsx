
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, UsersRound, Settings, CalendarClock, Target, History } from "lucide-react";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Function to check if a path is active
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Function to force navigation even when in edit mode
  const forceNavigate = (path: string) => {
    // Using direct navigation instead of handling through click events
    navigate(path);
  };

  return (
    <header className="bg-background border-b">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-2">
          {/* Using a div with onClick instead of Link for more direct control */}
          <div 
            className="flex items-center gap-2 cursor-pointer z-50"
            onClick={() => forceNavigate("/")}
          >
            <CalendarClock className="h-6 w-6 text-accent" />
            <h1 className="text-2xl font-semibold font-mono">Scheduler</h1>
          </div>
        </div>
        <nav className="hidden md:flex space-x-4">
          <Button
            variant={isActive("/") ? "default" : "ghost"}
            onClick={() => forceNavigate("/")}
            className="flex items-center gap-2 z-50"
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
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


import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, UsersRound, Settings } from "lucide-react";

const Header = () => {
  const location = useLocation();

  // Function to check if a path is active
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-background border-b">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold">
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
            variant={isActive("/groups") ? "default" : "ghost"}
          >
            <Link to="/groups" className="flex items-center gap-2">
              <UsersRound className="h-4 w-4" />
              Groups
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

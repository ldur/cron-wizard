
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Calendar, Clock, Settings as SettingsIcon } from "lucide-react";

const Header = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center">
        <div className="flex items-center gap-2 font-bold">
          <Clock className="h-5 w-5" />
          <span>CronWizard</span>
        </div>
        
        <nav className="flex items-center space-x-4 ml-6 text-sm font-medium">
          <Link
            to="/"
            className={`flex items-center gap-1 px-3 py-2 rounded-md ${
              isActive("/") 
                ? "bg-primary/10 text-primary" 
                : "hover:bg-muted transition-colors"
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>Jobs</span>
          </Link>
          
          <Link
            to="/settings"
            className={`flex items-center gap-1 px-3 py-2 rounded-md ${
              isActive("/settings") 
                ? "bg-primary/10 text-primary" 
                : "hover:bg-muted transition-colors"
            }`}
          >
            <SettingsIcon className="h-4 w-4" />
            <span>Settings</span>
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;

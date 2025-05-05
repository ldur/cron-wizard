
import { Link } from "react-router-dom";
import Header from "./Header";
import { History } from "lucide-react";

const CustomHeader = () => {
  return (
    <div>
      <Header />
      <div className="fixed top-16 left-4 z-50">
        <Link 
          to="/job-history"
          className="flex items-center gap-2 px-3 py-2 bg-background border rounded-md hover:bg-accent shadow-sm"
        >
          <History className="h-4 w-4" />
          <span>Job History</span>
        </Link>
      </div>
    </div>
  );
};

export default CustomHeader;


import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { initializeDatabase } from "./lib/supabase";
import Index from "./pages/Index";
import Groups from "./pages/Groups";
import Settings from "./pages/Settings";
import TargetTemplates from "./pages/TargetTemplates";
import JobHistory from "./pages/JobHistory";
import NotFound from "./pages/NotFound";
import { toast } from "@/hooks/use-toast";

const queryClient = new QueryClient();

const App = () => {
  const [dbInitialized, setDbInitialized] = useState(false);
  const [dbError, setDbError] = useState(false);

  // Initialize database when app starts
  useEffect(() => {
    const init = async () => {
      try {
        const initialized = await initializeDatabase();
        setDbInitialized(initialized);
        if (!initialized) {
          toast({
            title: "Database Connection",
            description: "Please execute the SQL from the migration file in your Supabase SQL editor.",
            variant: "destructive",
          });
          setDbError(true);
        }
      } catch (error) {
        console.error("Failed to initialize database:", error);
        toast({
          title: "Database Error",
          description: "Failed to connect to Supabase. Check your connection.",
          variant: "destructive",
        });
        setDbError(true);
      }
    };
    init();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/groups" element={<Groups />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/target-templates" element={<TargetTemplates />} />
            <Route path="/job-history" element={<JobHistory />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

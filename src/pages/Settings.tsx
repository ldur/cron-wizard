
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SettingsForm from "@/components/SettingsForm";
import Header from "@/components/Header";
import { Link } from "react-router-dom";
import { Target } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { getTargetTypeIcon } from "@/utils/targetTypeIcons";
import { supabase } from "@/integrations/supabase/client";
import GlobalVariablesDisplay from "@/components/GlobalVariablesDisplay";
import { TargetType } from "@/pages/TargetTemplates";

const Settings = () => {
  const [targetTypes, setTargetTypes] = useState<TargetType[]>([]);

  useEffect(() => {
    const fetchTargetTemplates = async () => {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('target_templates')
          .maybeSingle();

        if (error) throw error;

        if (data?.target_templates && typeof data.target_templates === 'object') {
          // Filter out GLOBAL_VARIABLES from the display of target types
          const types = Object.keys(data.target_templates)
            .filter(key => key !== "GLOBAL_VARIABLES") as TargetType[];
          
          setTargetTypes(types);
        }
      } catch (error) {
        console.error('Error fetching target templates:', error);
      }
    };

    fetchTargetTemplates();
  }, []);

  // Helper function to render target type badges
  const renderTargetTypeBadges = () => {
    return targetTypes.map(targetType => {
      const IconComponent = getTargetTypeIcon(targetType);
      return (
        <Badge key={targetType} variant="outline" className="flex items-center gap-2 px-3 py-1">
          <IconComponent className="h-4 w-4" />
          <span>{targetType}</span>
        </Badge>
      );
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Settings</CardTitle>
                  <CardDescription>
                    Manage general application settings.
                  </CardDescription>
                </div>
                <Button asChild variant="outline" className="gap-2">
                  <Link to="/target-templates">
                    <Target className="h-4 w-4" />
                    Edit Target Templates
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-wrap gap-2">
                  {targetTypes.length > 0 ? (
                    renderTargetTypeBadges()
                  ) : (
                    <p className="text-sm text-muted-foreground">No target templates configured.</p>
                  )}
                </div>

                <SettingsForm />
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-1">
            <GlobalVariablesDisplay />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;

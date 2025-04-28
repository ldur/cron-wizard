
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SettingsForm from "@/components/SettingsForm";
import Header from "@/components/Header";
import { Link } from "react-router-dom";
import { Grid3X3 } from "lucide-react";

const Settings = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto p-4 space-y-4">
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
                <Grid3X3 className="h-4 w-4" />
                Edit Target Templates
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <SettingsForm />
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Settings;

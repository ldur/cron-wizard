
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SettingsForm from "@/components/SettingsForm";
import Header from "@/components/Header";
import { Link } from "react-router-dom";

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
            <Button asChild variant="outline">
              <Link to="/target-templates">
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

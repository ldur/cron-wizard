
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SettingsForm from "@/components/SettingsForm";
import Header from "@/components/Header";

const Settings = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto p-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
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

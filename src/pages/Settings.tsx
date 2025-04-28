
import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import SettingsList from "@/components/SettingsList";
import SettingsForm from "@/components/SettingsForm";
import type { Settings } from "@/types/Settings";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  fetchSettings, 
  createSetting, 
  updateSetting, 
  deleteSetting 
} from "@/services/settingsService";

const Settings = () => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingSetting, setEditingSetting] = useState<Settings | undefined>(undefined);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query to fetch settings
  const { data: settings = [], isLoading, error } = useQuery({
    queryKey: ['settings'],
    queryFn: fetchSettings,
  });

  // Mutations for CRUD operations
  const createSettingMutation = useMutation({
    mutationFn: createSetting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      setIsFormVisible(false);
      toast({
        title: "Setting Created",
        description: "The IAC setting has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create setting: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updateSettingMutation = useMutation({
    mutationFn: ({ id, setting }: { id: string; setting: Partial<Omit<Settings, 'id' | 'createdAt' | 'updatedAt'>> }) => 
      updateSetting(id, setting),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      setEditingSetting(undefined);
      setIsFormVisible(false);
      
      if (result.updated) {
        toast({
          title: "Setting Updated",
          description: "The IAC setting has been updated successfully.",
        });
      } else {
        toast({
          title: "Update Issue",
          description: "The setting was not updated, but your data has been preserved.",
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      console.error("Update error:", error);
      toast({
        title: "Error",
        description: `Failed to update setting: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deleteSettingMutation = useMutation({
    mutationFn: deleteSetting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast({
        title: "Setting Deleted",
        description: "The IAC setting has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete setting: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleAddSetting = (data: Omit<Settings, 'id' | 'createdAt' | 'updatedAt'>) => {
    console.log('Creating new setting with data:', data);
    createSettingMutation.mutate(data);
  };

  const handleUpdateSetting = (data: Omit<Settings, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingSetting) return;
    console.log('Updating setting with ID:', editingSetting.id);
    console.log('Update data:', data);
    
    updateSettingMutation.mutate({ 
      id: editingSetting.id, 
      setting: data
    });
  };

  const handleEdit = (setting: Settings) => {
    console.log('Editing setting:', setting);
    setEditingSetting(setting);
    setIsFormVisible(true);
  };

  const handleDelete = (id: string) => {
    deleteSettingMutation.mutate(id);
  };

  const handleFormCancel = () => {
    setIsFormVisible(false);
    setEditingSetting(undefined);
  };

  // Error handling for the main query
  useEffect(() => {
    if (error) {
      toast({
        title: "Error Loading Settings",
        description: "There was a problem loading your IAC settings.",
        variant: "destructive",
      });
      console.error("Error fetching settings:", error);
    }
  }, [error, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">Loading settings...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold tracking-tight">IAC Settings</h2>
          {!isFormVisible && (
            <Button onClick={() => setIsFormVisible(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Setting
            </Button>
          )}
          {isFormVisible && (
            <Button variant="outline" onClick={handleFormCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          )}
        </div>

        {isFormVisible ? (
          <div className="mb-8">
            <SettingsForm
              setting={editingSetting}
              onSubmit={editingSetting ? handleUpdateSetting : handleAddSetting}
              onCancel={handleFormCancel}
            />
          </div>
        ) : (
          <SettingsList
            settings={settings}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </main>
      
      <footer className="border-t border-border py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>CronWizard - The friendly cron job scheduler</p>
        </div>
      </footer>
    </div>
  );
};

export default Settings;

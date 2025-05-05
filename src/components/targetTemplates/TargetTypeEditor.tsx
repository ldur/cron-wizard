
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, AlertTriangle, Variable } from "lucide-react";
import AttributeForm from "@/components/targetTemplates/AttributeForm";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { TargetType } from "@/pages/TargetTemplates";

// Define the attribute interface according to your data structure
interface Attribute {
  name: string;
  data_type: "string" | "number" | "boolean" | "json";
  required: boolean;
  value: any;
}

interface TargetTemplateData {
  attributes: Attribute[];
}

interface TargetTemplates {
  [key: string]: TargetTemplateData;
}

interface TargetTypeEditorProps {
  targetType: TargetType;
  onUpdate: () => void;
}

export const TargetTypeEditor = ({ targetType, onUpdate }: TargetTypeEditorProps) => {
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const { toast } = useToast();
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const isGlobalVariables = targetType === "GLOBAL_VARIABLES";

  // Fetch template for the selected target type
  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('target_templates')
          .single();

        if (error) throw error;

        // Safely access the target_templates field
        const rawTemplates = data?.target_templates;
        if (rawTemplates && typeof rawTemplates === 'object' && !Array.isArray(rawTemplates)) {
          const templates = rawTemplates as Record<string, any>;
          
          if (templates[targetType] && 
              typeof templates[targetType] === 'object' && 
              Array.isArray(templates[targetType].attributes)) {
            setAttributes(templates[targetType].attributes || []);
          } else {
            // Initialize with empty array if template doesn't exist
            setAttributes([]);
          }
        } else {
          setAttributes([]);
        }
      } catch (error) {
        console.error('Error fetching template:', error);
        toast({
          title: "Error",
          description: "Failed to load template",
          variant: "destructive",
        });
      }
    };

    if (targetType) {
      fetchTemplate();
    }
  }, [targetType, toast]);

  // Add a new attribute to the template
  const addAttribute = () => {
    const newAttribute: Attribute = {
      name: "",
      data_type: "string",
      required: false,
      value: null
    };
    setAttributes([...attributes, newAttribute]);
  };

  // Update an attribute in the template
  const updateAttribute = (index: number, attribute: Attribute) => {
    const updatedAttributes = [...attributes];
    updatedAttributes[index] = attribute;
    setAttributes(updatedAttributes);
  };

  // Remove an attribute from the template
  const removeAttribute = (index: number) => {
    setAttributes(attributes.filter((_, i) => i !== index));
  };

  // Save template to database
  const saveTemplate = async () => {
    // Validate attributes before saving
    for (const attr of attributes) {
      if (!attr.name.trim()) {
        toast({
          title: "Validation Error",
          description: "Attribute name cannot be empty",
          variant: "destructive",
        });
        return;
      }
    }

    setLoading(true);
    try {
      // Get current templates
      const { data, error } = await supabase
        .from('settings')
        .select('target_templates, id')
        .single();

      if (error) throw error;

      // Prepare updated templates object with proper type casting
      let targetTemplates: Record<string, any> = {};
      if (data?.target_templates && typeof data.target_templates === 'object' && !Array.isArray(data.target_templates)) {
        targetTemplates = data.target_templates as Record<string, any>;
      }
      
      // Update with the new format
      targetTemplates[targetType] = { attributes: attributes };

      // Update database
      const { error: updateError } = await supabase
        .from('settings')
        .update({ target_templates: targetTemplates })
        .eq('id', data.id);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: isGlobalVariables ? "Global variables saved successfully" : "Template saved successfully",
      });
      setSaveSuccess(true);
      
      // Reset success message after a delay
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
      
      // Notify parent component of update
      onUpdate();
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: "Error",
        description: isGlobalVariables ? "Failed to save global variables" : "Failed to save template",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete template from database
  const deleteTemplate = async () => {
    setLoading(true);
    try {
      // Get current templates
      const { data, error } = await supabase
        .from('settings')
        .select('target_templates, id')
        .single();

      if (error) throw error;

      // Prepare updated templates object with the target type removed
      let targetTemplates: Record<string, any> = {};
      if (data?.target_templates && typeof data.target_templates === 'object' && !Array.isArray(data.target_templates)) {
        targetTemplates = data.target_templates as Record<string, any>;
        delete targetTemplates[targetType];
      }

      // Update database
      const { error: updateError } = await supabase
        .from('settings')
        .update({ target_templates: targetTemplates })
        .eq('id', data.id);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: isGlobalVariables ? "Global variables deleted successfully" : "Template deleted successfully",
      });
      
      // Reset attributes
      setAttributes([]);
      
      // Notify parent component of update
      onUpdate();
      setShowDeleteAlert(false);
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: "Error",
        description: isGlobalVariables ? "Failed to delete global variables" : "Failed to delete template",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">
          {isGlobalVariables ? (
            <span className="flex items-center">
              <Variable className="h-5 w-5 mr-2" />
              Global Variables
            </span>
          ) : (
            "Attributes"
          )}
        </h3>
        <div className="flex gap-2">
          <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                {isGlobalVariables ? "Delete All Variables" : "Delete Template"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {isGlobalVariables ? "Delete Global Variables" : "Delete Template"}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete {isGlobalVariables ? "all global variables" : "this template"}? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={deleteTemplate} 
                  className="bg-destructive text-destructive-foreground"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          <Button 
            onClick={addAttribute} 
            variant="outline" 
            size="sm"
            className="flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> Add {isGlobalVariables ? "Variable" : "Attribute"}
          </Button>
        </div>
      </div>

      {attributes.length === 0 ? (
        <div className="p-4 border rounded-md bg-muted/50 flex items-center justify-center">
          <p className="text-muted-foreground text-sm">
            {isGlobalVariables 
              ? "No global variables defined. Click \"Add Variable\" to start." 
              : "No attributes defined. Click \"Add Attribute\" to start."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {attributes.map((attribute, index) => (
            <div key={index} className="p-4 border rounded-md bg-card">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium">
                  {isGlobalVariables ? (
                    attribute.name ? `$${attribute.name}` : "New Variable"
                  ) : (
                    attribute.name || "New Attribute"
                  )}
                </h4>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => removeAttribute(index)}
                  className="h-6 w-6 p-0"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              <AttributeForm 
                attribute={attribute}
                onChange={(updatedAttribute) => updateAttribute(index, updatedAttribute)}
                isGlobalVariable={isGlobalVariables}
              />
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end">
        <Button 
          onClick={saveTemplate} 
          disabled={loading}
          className={saveSuccess ? "bg-green-500 hover:bg-green-600" : ""}
        >
          {loading ? "Saving..." : saveSuccess ? "Saved!" : isGlobalVariables ? "Save Variables" : "Save Template"}
        </Button>
      </div>

      {isGlobalVariables && (
        <div className="mt-4 p-4 border border-blue-100 rounded-md bg-blue-50">
          <h4 className="font-medium text-blue-800 mb-2">How to use global variables</h4>
          <p className="text-sm text-blue-700">
            Use <code className="bg-blue-100 px-1 py-0.5 rounded">$&#123;variable_name&#125;</code> in any target configuration field. 
            Variables will be automatically replaced with their values.
          </p>
        </div>
      )}
    </div>
  );
};

export default TargetTypeEditor;


import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Save, Trash2, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TargetType, TemplateAttribute } from "@/pages/TargetTemplates";
import { AttributeForm } from "./AttributeForm";

interface TargetTypeEditorProps {
  targetType: TargetType;
}

export const TargetTypeEditor = ({ targetType }: TargetTypeEditorProps) => {
  const [attributes, setAttributes] = useState<TemplateAttribute[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAddingAttribute, setIsAddingAttribute] = useState(false);
  const [editingAttributeIndex, setEditingAttributeIndex] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTargetTemplate = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('settings')
          .select('target_templates')
          .single();

        if (error) throw error;

        // Initialize with empty array
        let templateAttributes: TemplateAttribute[] = [];
        
        // Process the templates if they exist
        if (data?.target_templates && 
            typeof data.target_templates === 'object' && 
            !Array.isArray(data.target_templates)) {
          
          const targetTypeData = data.target_templates[targetType];
          
          // Check if this target type has attributes and they're in array format
          if (Array.isArray(targetTypeData)) {
            // Map and validate each attribute
            templateAttributes = targetTypeData.map(attr => ({
              name: String(attr.name || ''),
              data_type: (attr.data_type as "string" | "number" | "boolean" | "json") || "string",
              required: Boolean(attr.required),
              default_value: attr.default_value
            }));
          }
        }
        
        setAttributes(templateAttributes);
      } catch (error) {
        console.error('Error fetching template:', error);
        toast({
          title: "Error",
          description: "Failed to load target template",
          variant: "destructive",
        });
        setAttributes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTargetTemplate();
  }, [targetType, toast]);

  const saveTemplate = async () => {
    try {
      setSaving(true);
      
      // Get current templates
      const { data, error: fetchError } = await supabase
        .from('settings')
        .select('target_templates, id')
        .single();
      
      if (fetchError) throw fetchError;
      
      // Initialize templates as an empty object if not found
      const currentTemplates: Record<string, any> = {};
      
      // If data exists and is an object, copy its properties
      if (data?.target_templates && 
          typeof data.target_templates === 'object' && 
          !Array.isArray(data.target_templates)) {
        Object.assign(currentTemplates, data.target_templates);
      }
      
      // Update templates for this target type
      currentTemplates[targetType] = attributes;
      
      // Save to database
      const { error: updateError } = await supabase
        .from('settings')
        .update({
          target_templates: currentTemplates
        })
        .eq('id', data.id);
      
      if (updateError) throw updateError;
      
      toast({
        title: "Success",
        description: `${targetType} template updated successfully`,
      });
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: "Error",
        description: "Failed to save template",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddAttribute = (newAttribute: TemplateAttribute) => {
    // Check for duplicate name
    if (attributes.some(attr => attr.name === newAttribute.name)) {
      toast({
        title: "Error",
        description: "Attribute name must be unique",
        variant: "destructive",
      });
      return;
    }
    
    setAttributes([...attributes, newAttribute]);
    setIsAddingAttribute(false);
  };

  const handleUpdateAttribute = (updatedAttribute: TemplateAttribute, index: number) => {
    // Check for duplicate name with other attributes
    if (attributes.some((attr, i) => i !== index && attr.name === updatedAttribute.name)) {
      toast({
        title: "Error",
        description: "Attribute name must be unique",
        variant: "destructive",
      });
      return;
    }
    
    const newAttributes = [...attributes];
    newAttributes[index] = updatedAttribute;
    setAttributes(newAttributes);
    setEditingAttributeIndex(null);
  };

  const handleDeleteAttribute = (index: number) => {
    const newAttributes = [...attributes];
    newAttributes.splice(index, 1);
    setAttributes(newAttributes);
  };

  if (loading) {
    return <div>Loading template...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Attributes</h3>
        <Button 
          onClick={() => setIsAddingAttribute(true)} 
          disabled={isAddingAttribute}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Attribute
        </Button>
      </div>
      
      {isAddingAttribute && (
        <div className="border p-4 rounded-md mb-4 bg-muted/30">
          <h4 className="font-medium mb-4">Add New Attribute</h4>
          <AttributeForm 
            onSubmit={handleAddAttribute}
            onCancel={() => setIsAddingAttribute(false)}
          />
        </div>
      )}

      {editingAttributeIndex !== null && (
        <div className="border p-4 rounded-md mb-4 bg-muted/30">
          <h4 className="font-medium mb-4">Edit Attribute</h4>
          <AttributeForm 
            attribute={attributes[editingAttributeIndex]}
            onSubmit={(attr) => handleUpdateAttribute(attr, editingAttributeIndex)}
            onCancel={() => setEditingAttributeIndex(null)}
          />
        </div>
      )}

      {attributes.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Data Type</TableHead>
              <TableHead>Required</TableHead>
              <TableHead>Default Value</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attributes.map((attribute, index) => (
              <TableRow key={attribute.name}>
                <TableCell>{attribute.name}</TableCell>
                <TableCell>{attribute.data_type}</TableCell>
                <TableCell>
                  {attribute.required ? "Yes" : "No"}
                </TableCell>
                <TableCell>
                  {attribute.default_value !== undefined 
                    ? (typeof attribute.default_value === 'object' 
                      ? JSON.stringify(attribute.default_value) 
                      : String(attribute.default_value))
                    : ""}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => setEditingAttributeIndex(index)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Attribute</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete the "{attribute.name}" attribute? 
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteAttribute(index)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center p-4 border rounded-md">
          <p className="text-muted-foreground">No attributes defined for this target type.</p>
          <p className="text-sm text-muted-foreground mt-1">
            Click "Add Attribute" to define the first attribute.
          </p>
        </div>
      )}

      <div className="flex justify-end">
        <Button 
          onClick={saveTemplate}
          disabled={saving}
          className="mt-4"
        >
          {saving && <Save className="h-4 w-4 mr-2 animate-spin" />}
          Save Template
        </Button>
      </div>
    </div>
  );
};

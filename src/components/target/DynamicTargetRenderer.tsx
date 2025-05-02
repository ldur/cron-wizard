
import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { CronJob } from '@/types/CronJob';
import { Button } from '@/components/ui/button';
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from '@/components/ui/form';

interface TemplateAttribute {
  name: string;
  data_type: "string" | "number" | "boolean" | "json";
  required: boolean;
  value: any;
}

interface TargetTemplateData {
  attributes: TemplateAttribute[];
}

interface TargetTemplates {
  [key: string]: TargetTemplateData;
}

interface GlobalVariable {
  name: string;
  value: string;
}

interface DynamicTargetRendererProps {
  targetType: CronJob['targetType'];
  form: any;
  initialValues?: Record<string, any>;
}

const DynamicTargetRenderer: React.FC<DynamicTargetRendererProps> = ({
  targetType,
  form,
  initialValues
}) => {
  const { toast } = useToast();
  const [targetConfig, setTargetConfig] = useState<Record<string, any>>(
    initialValues || {}
  );
  const [globalVariables, setGlobalVariables] = useState<Record<string, string>>({});

  // Fetch target templates from settings
  const { data: templates, isLoading, error } = useQuery({
    queryKey: ['targetTemplates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('settings')
        .select('target_templates')
        .single();
        
      if (error) throw error;
      
      // Add explicit type checking and conversion
      const rawTemplates = data?.target_templates;
      if (rawTemplates && typeof rawTemplates === 'object' && !Array.isArray(rawTemplates)) {
        // Extract global variables if available
        const globalVarsObject = rawTemplates["GLOBAL_VARIABLES"];
        
        if (globalVarsObject && 
            typeof globalVarsObject === 'object' && 
            !Array.isArray(globalVarsObject) && 
            'attributes' in globalVarsObject && 
            Array.isArray(globalVarsObject.attributes)) {
          
          const globalVars: Record<string, string> = {};
          globalVarsObject.attributes.forEach((attr: any) => {
            if (attr.name && attr.value !== undefined) {
              globalVars[attr.name] = String(attr.value);
            }
          });
          setGlobalVariables(globalVars);
        }
        
        return rawTemplates as unknown as TargetTemplates;
      }
      return {} as TargetTemplates;
    },
  });

  // Update form values when target type changes
  useEffect(() => {
    if (templates && targetType && templates[targetType]) {
      // Initialize form values for the selected target type
      const defaultValues: Record<string, any> = {};
      
      // Get attributes array from the new template structure
      const attributes = templates[targetType]?.attributes;
      
      if (Array.isArray(attributes)) {
        attributes.forEach(attr => {
          // If we have an initial value, use it, otherwise use the default from template
          const initialValue = initialValues && initialValues[attr.name] !== undefined 
            ? initialValues[attr.name] 
            : attr.value;
            
          defaultValues[attr.name] = initialValue;
        });
      }
      
      // Update the target_config field in the form
      form.setValue('targetConfig', defaultValues);
      setTargetConfig(defaultValues);
    }
  }, [targetType, templates, form, initialValues]);

  // Apply variable substitution to a string value using global variables
  const substituteVariables = (value: string): string => {
    if (typeof value !== 'string') return value;
    
    // Look for ${variableName} patterns and replace with global variable values
    return value.replace(/\${([^}]+)}/g, (match, variableName) => {
      return globalVariables[variableName] || match;
    });
  };

  // Handle field value changes
  const handleFieldChange = (name: string, value: any, dataType: string) => {
    let processedValue = value;
    
    // Convert value based on data type
    if (dataType === 'number' && value !== '') {
      processedValue = Number(value);
    } else if (dataType === 'boolean') {
      processedValue = Boolean(value);
    } else if (dataType === 'string' && typeof value === 'string') {
      // Apply variable substitution to string values
      processedValue = substituteVariables(value);
    } else if (dataType === 'json' && typeof value === 'string') {
      try {
        // First substitute variables in the JSON string
        const substitutedJsonStr = substituteVariables(value);
        processedValue = JSON.parse(substitutedJsonStr);
      } catch (e) {
        // Keep as string if not valid JSON
        console.error('Invalid JSON:', e);
      }
    }
    
    const updatedConfig = {
      ...targetConfig,
      [name]: processedValue
    };
    
    setTargetConfig(updatedConfig);
    form.setValue('targetConfig', updatedConfig);
  };
  
  // Function to replace all variables in all fields without submitting the form
  const handleReplaceAllVariables = () => {
    if (!templates || !targetType || !templates[targetType]) return;
    
    const attributes = templates[targetType]?.attributes;
    if (!Array.isArray(attributes) || attributes.length === 0) return;
    
    const updatedConfig = { ...targetConfig };
    let hasChanges = false;
    
    // Process each field
    attributes.forEach(attr => {
      const currentValue = updatedConfig[attr.name];
      
      if (attr.data_type === 'string' && typeof currentValue === 'string') {
        const substituted = substituteVariables(currentValue);
        if (substituted !== currentValue) {
          updatedConfig[attr.name] = substituted;
          hasChanges = true;
        }
      } else if (attr.data_type === 'json' && typeof currentValue === 'string') {
        try {
          const substituted = substituteVariables(currentValue);
          if (substituted !== currentValue) {
            try {
              updatedConfig[attr.name] = JSON.parse(substituted);
              hasChanges = true;
            } catch (e) {
              updatedConfig[attr.name] = substituted;
              hasChanges = true;
            }
          }
        } catch (e) {
          console.error('Error processing JSON field:', e);
        }
      }
    });
    
    if (hasChanges) {
      setTargetConfig(updatedConfig);
      form.setValue('targetConfig', updatedConfig);
      
      toast({
        title: "Variables Replaced",
        description: "All variables have been replaced with their global values.",
      });
    } else {
      toast({
        title: "No Changes",
        description: "No variables found to replace in the current configuration.",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading template...</span>
      </div>
    );
  }

  if (error) {
    toast({
      title: "Error loading templates",
      description: "Could not load target templates. Please try again.",
      variant: "destructive",
    });
    
    return (
      <div className="p-4 border border-red-300 rounded bg-red-50 text-red-800">
        Error loading templates. Please try refreshing the page.
      </div>
    );
  }

  // Check if the template exists and has attributes array
  if (!templates || !templates[targetType] || !Array.isArray(templates[targetType]?.attributes) || templates[targetType]?.attributes.length === 0) {
    return (
      <div className="p-4 border border-yellow-300 rounded bg-yellow-50">
        <p className="text-yellow-800">
          No template configured for {targetType}. Please set up a template in the Target Templates section.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Object.keys(globalVariables).length > 0 && (
        <div className="p-4 border border-blue-100 rounded bg-blue-50 mb-4">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm text-blue-800">
              <strong>Available Global Variables:</strong> {Object.keys(globalVariables).map(key => `\${${key}}`).join(', ')}
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
              onClick={handleReplaceAllVariables}
              type="button" // Explicitly set to button to avoid form submission
            >
              <RefreshCw className="h-4 w-4 mr-1" /> Replace Variables
            </Button>
          </div>
          <p className="text-xs text-blue-700 mt-1">
            You can use these variables in string fields and they will be automatically replaced with their values.
          </p>
        </div>
      )}
      
      {Array.isArray(templates[targetType]?.attributes) && templates[targetType]?.attributes.map((attribute) => (
        <div key={attribute.name} className="space-y-2">
          {attribute.data_type === "boolean" ? (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  {attribute.name}
                  {attribute.required && <span className="text-red-500">*</span>}
                </FormLabel>
              </div>
              <FormControl>
                <Switch
                  checked={targetConfig[attribute.name] || false}
                  onCheckedChange={(checked) => 
                    handleFieldChange(attribute.name, checked, attribute.data_type)
                  }
                />
              </FormControl>
            </FormItem>
          ) : attribute.data_type === "json" ? (
            <FormItem>
              <FormLabel>
                {attribute.name}
                {attribute.required && <span className="text-red-500">*</span>}
              </FormLabel>
              <FormControl>
                <Textarea
                  className="font-mono"
                  value={
                    targetConfig[attribute.name] !== undefined
                      ? typeof targetConfig[attribute.name] === 'object'
                        ? JSON.stringify(targetConfig[attribute.name], null, 2)
                        : String(targetConfig[attribute.name])
                      : ''
                  }
                  onChange={(e) => handleFieldChange(attribute.name, e.target.value, attribute.data_type)}
                  placeholder={`Enter JSON for ${attribute.name}`}
                  rows={5}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          ) : (
            <FormItem>
              <FormLabel>
                {attribute.name}
                {attribute.required && <span className="text-red-500">*</span>}
              </FormLabel>
              <FormControl>
                <Input
                  type={attribute.data_type === "number" ? "number" : "text"}
                  value={targetConfig[attribute.name] !== undefined ? String(targetConfig[attribute.name]) : ''}
                  onChange={(e) => handleFieldChange(attribute.name, e.target.value, attribute.data_type)}
                  placeholder={`Enter ${attribute.name}`}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        </div>
      ))}
    </div>
  );
};

export default DynamicTargetRenderer;

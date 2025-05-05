
import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Variable } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TargetType, TargetTemplateData } from "@/pages/TargetTemplates";

interface TargetTemplatesTableProps {
  selectedTargetType: TargetType | "GLOBAL_VARIABLES" | null;
  onSelectTargetType: (targetType: TargetType | "GLOBAL_VARIABLES") => void;
}

export const TargetTemplatesTable = ({ 
  selectedTargetType,
  onSelectTargetType 
}: TargetTemplatesTableProps) => {
  const [targetTypes, setTargetTypes] = useState<(TargetType | "GLOBAL_VARIABLES")[]>([]);
  const [loading, setLoading] = useState(true);
  const [targetTemplates, setTargetTemplates] = useState<Record<string, TargetTemplateData> | null>(null);
  const { toast } = useToast();

  const allTargetTypes: (TargetType | "GLOBAL_VARIABLES")[] = [
    "GLOBAL_VARIABLES", // Add this first to show at the top
    "LAMBDA", "STEP_FUNCTION", "API_GATEWAY", "EVENTBRIDGE", 
    "SQS", "ECS", "KINESIS", "SAGEMAKER"
  ];

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('settings')
          .select('target_templates')
          .single();

        if (error) throw error;

        // Get existing target templates or initialize empty object
        const templates: Record<string, TargetTemplateData> = {};
        
        if (data?.target_templates && 
            typeof data.target_templates === 'object' && 
            !Array.isArray(data.target_templates)) {
          
          // Process each key in the target_templates object
          const rawTemplates = data.target_templates as Record<string, any>;
          
          Object.keys(rawTemplates).forEach(key => {
            const targetType = key as TargetType | "GLOBAL_VARIABLES";
            const templateData = rawTemplates[key];
            
            // Safely check if the templateData has the expected structure
            if (templateData && 
                typeof templateData === 'object' && 
                !Array.isArray(templateData) && 
                'attributes' in templateData && 
                Array.isArray(templateData.attributes)) {
              
              templates[targetType] = {
                attributes: templateData.attributes.map((attr: any) => ({
                  name: String(attr.name || ''),
                  data_type: (attr.data_type as "string" | "number" | "boolean" | "json") || "string",
                  required: Boolean(attr.required),
                  value: attr.value
                }))
              };
            }
          });
        }
          
        setTargetTemplates(templates);
        
        // Get the list of target types that have templates defined
        const existingTypes = Object.keys(templates) as (TargetType | "GLOBAL_VARIABLES")[];
        
        // Ensure GLOBAL_VARIABLES is always first if it exists
        const sortedTypes = [...allTargetTypes];
        if (existingTypes.includes("GLOBAL_VARIABLES")) {
          sortedTypes.unshift("GLOBAL_VARIABLES");
        }
        
        setTargetTypes(existingTypes.length > 0 ? existingTypes : allTargetTypes);

      } catch (error) {
        console.error('Error fetching settings:', error);
        toast({
          title: "Error",
          description: "Failed to load target templates",
          variant: "destructive",
        });
        setTargetTypes(allTargetTypes);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [toast]);

  const getAttributeCount = (targetType: TargetType | "GLOBAL_VARIABLES"): number => {
    if (!targetTemplates || !targetTemplates[targetType] || !targetTemplates[targetType].attributes) return 0;
    return targetTemplates[targetType].attributes.length;
  };

  const getTypeLabel = (type: TargetType | "GLOBAL_VARIABLES"): string => {
    if (type === "GLOBAL_VARIABLES") return "Global Variables";
    return type;
  };

  const getTypeIcon = (type: TargetType | "GLOBAL_VARIABLES") => {
    if (type === "GLOBAL_VARIABLES") {
      return <Variable className="h-4 w-4 mr-2" />;
    }
    return null;
  };

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Target Type</TableHead>
            <TableHead>Attributes</TableHead>
            <TableHead className="w-[80px]">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center">
                Loading...
              </TableCell>
            </TableRow>
          ) : (
            targetTypes.map((type) => (
              <TableRow key={type} className={selectedTargetType === type ? "bg-muted" : ""}>
                <TableCell className="font-medium">
                  <div className="flex items-center">
                    {getTypeIcon(type)}
                    {getTypeLabel(type)}
                  </div>
                </TableCell>
                <TableCell>
                  {type === "GLOBAL_VARIABLES" ? "Variables" : "Attributes"}: {getAttributeCount(type)}
                </TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => onSelectTargetType(type)}
                    aria-label={`Edit ${type}`}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

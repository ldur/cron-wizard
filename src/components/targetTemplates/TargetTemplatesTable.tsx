import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TargetType, TargetTemplates } from "@/pages/TargetTemplates";

interface TargetTemplatesTableProps {
  selectedTargetType: TargetType | null;
  onSelectTargetType: (targetType: TargetType) => void;
}

export const TargetTemplatesTable = ({ 
  selectedTargetType,
  onSelectTargetType 
}: TargetTemplatesTableProps) => {
  const [targetTypes, setTargetTypes] = useState<TargetType[]>([]);
  const [loading, setLoading] = useState(true);
  const [targetTemplates, setTargetTemplates] = useState<TargetTemplates | null>(null);
  const { toast } = useToast();

  const allTargetTypes: TargetType[] = [
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
        const rawTemplates = data?.target_templates;
        const templates = (rawTemplates && typeof rawTemplates === 'object' && !Array.isArray(rawTemplates))
          ? rawTemplates as TargetTemplates
          : {} as TargetTemplates;
          
        setTargetTemplates(templates);
        
        // Get the list of target types that have templates defined
        const existingTypes = Object.keys(templates) as TargetType[];
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

  const getAttributeCount = (targetType: TargetType): number => {
    if (!targetTemplates || !targetTemplates[targetType]) return 0;
    return targetTemplates[targetType].length;
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
                <TableCell className="font-medium">{type}</TableCell>
                <TableCell>{getAttributeCount(type)}</TableCell>
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

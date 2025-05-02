
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface GlobalVariable {
  name: string;
  value: string;
}

const GlobalVariablesDisplay = () => {
  const [globalVariables, setGlobalVariables] = useState<GlobalVariable[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGlobalVariables = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('settings')
          .select('target_templates')
          .maybeSingle();

        if (error) throw error;

        const variables: GlobalVariable[] = [];

        // Extract global variables from target_templates
        if (data?.target_templates && 
            typeof data.target_templates === 'object' && 
            !Array.isArray(data.target_templates)) {
          
          const templates = data.target_templates as Record<string, any>;
          if (templates["GLOBAL_VARIABLES"] && 
              typeof templates["GLOBAL_VARIABLES"] === 'object' && 
              templates["GLOBAL_VARIABLES"].attributes && 
              Array.isArray(templates["GLOBAL_VARIABLES"].attributes)) {
            
            // Process each attribute in the GLOBAL_VARIABLES section
            templates["GLOBAL_VARIABLES"].attributes.forEach((attr: any) => {
              if (attr.name && attr.value !== undefined) {
                variables.push({
                  name: attr.name,
                  value: String(attr.value)
                });
              }
            });
          }
        }

        setGlobalVariables(variables);
      } catch (error) {
        console.error('Error fetching global variables:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGlobalVariables();
  }, []);

  if (loading) {
    return <div className="p-4">Loading global variables...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Global Variables
          </CardTitle>
          <CardDescription>
            System-wide configuration variables
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {globalVariables.length > 0 ? (
          <div className="space-y-4">
            {globalVariables.map((variable) => (
              <div key={variable.name} className="flex items-center justify-between">
                <span className="font-medium">{variable.name}</span>
                <Badge variant="outline" className="px-3 py-1">
                  {variable.value}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No global variables configured. Add them in Target Templates under "GLOBAL_VARIABLES".
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default GlobalVariablesDisplay;

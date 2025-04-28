
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import { TargetTemplatesTable } from "@/components/targetTemplates/TargetTemplatesTable";
import { TargetTypeEditor } from "@/components/targetTemplates/TargetTypeEditor";
import { Database } from "@/integrations/supabase/types";

// Define a type for target type
export type TargetType = "LAMBDA" | "STEP_FUNCTION" | "API_GATEWAY" | "EVENTBRIDGE" | "SQS" | "ECS" | "KINESIS" | "SAGEMAKER";

// Define types for target template attributes
export interface TemplateAttribute {
  name: string;
  data_type: "string" | "number" | "boolean" | "json";
  required: boolean;
  default_value?: string | number | boolean | null;
}

// Define shape of target templates structure
export interface TargetTemplates {
  [key: string]: TemplateAttribute[];
}

const TargetTemplatesPage = () => {
  const [selectedTargetType, setSelectedTargetType] = useState<TargetType | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Target Types</CardTitle>
              </CardHeader>
              <CardContent>
                <TargetTemplatesTable 
                  selectedTargetType={selectedTargetType}
                  onSelectTargetType={setSelectedTargetType}
                />
              </CardContent>
            </Card>
          </div>
          <div className="md:col-span-2">
            {selectedTargetType ? (
              <Card>
                <CardHeader>
                  <CardTitle>Edit {selectedTargetType} Template</CardTitle>
                </CardHeader>
                <CardContent>
                  <TargetTypeEditor targetType={selectedTargetType} />
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Target Template Editor</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Select a target type from the list to edit its template.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default TargetTemplatesPage;

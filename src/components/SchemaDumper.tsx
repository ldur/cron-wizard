
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Download, Database } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const SchemaDumper = () => {
  const [loading, setLoading] = useState(false);
  const [schema, setSchema] = useState<any>(null);
  const { toast } = useToast();

  const fetchSchema = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('dump-schema');
      
      if (error) {
        throw error;
      }
      
      setSchema(data.schema);
      toast({
        title: 'Schema loaded successfully',
        description: 'The database schema has been retrieved.',
      });
    } catch (error) {
      console.error('Error fetching schema:', error);
      toast({
        title: 'Failed to load schema',
        description: error.message || 'An unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadSchema = () => {
    if (!schema) return;
    
    const blob = new Blob([JSON.stringify(schema, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'supabase-schema.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Schema downloaded',
      description: 'The schema has been downloaded as JSON.',
    });
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Supabase Schema Dumper
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="flex space-x-2">
            <Button 
              onClick={fetchSchema} 
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? 'Loading Schema...' : 'Load Schema'}
            </Button>
            
            {schema && (
              <Button 
                onClick={downloadSchema} 
                variant="outline" 
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download JSON
              </Button>
            )}
          </div>

          {schema && (
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">Schema Preview</h3>
              <div className="bg-muted rounded-md p-4 overflow-auto max-h-[500px]">
                <pre className="text-xs">
                  {JSON.stringify(schema, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SchemaDumper;

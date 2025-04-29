
import React from 'react';
import { CronJob } from '@/types/CronJob';
import { FormLabel } from '@/components/ui/form';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import DynamicTargetRenderer from './DynamicTargetRenderer';

interface TargetFormWrapperProps {
  form: any;
  targetType: CronJob['targetType'];
  initialValues?: Record<string, any>;
  showLegacy?: boolean;
}

const TargetFormWrapper: React.FC<TargetFormWrapperProps> = ({
  form,
  targetType,
  initialValues,
  showLegacy = false
}) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-foreground mb-4">Target Configuration</h2>
      
      <DynamicTargetRenderer 
        targetType={targetType}
        form={form}
        initialValues={initialValues}
      />
      
      {showLegacy && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <Alert variant="warning" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Legacy Configuration</AlertTitle>
            <AlertDescription>
              These fields are kept for backward compatibility and will be deprecated in future versions.
              We recommend using the template-based configuration above instead.
            </AlertDescription>
          </Alert>
          <FormLabel className="text-lg font-medium mb-4 block">Legacy Fields</FormLabel>
          <p className="text-sm text-muted-foreground mb-4">
            Legacy target-specific fields have been removed from the form.
            All target configuration should now use the template-based approach.
          </p>
        </div>
      )}
    </div>
  );
};

export default TargetFormWrapper;

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";

interface Attribute {
  name: string;
  data_type: "string" | "number" | "boolean" | "json";
  required: boolean;
  value: any;
}

interface AttributeFormProps {
  attribute: Attribute;
  onChange: (attribute: Attribute) => void;
}

const AttributeForm = ({ attribute, onChange }: AttributeFormProps) => {
  const [localAttribute, setLocalAttribute] = useState<Attribute>(attribute);

  // Update local state when prop changes
  useEffect(() => {
    setLocalAttribute(attribute);
  }, [attribute]);

  // Handle attribute changes and propagate to parent
  const handleChange = (field: keyof Attribute, value: any) => {
    const updatedAttribute = { ...localAttribute, [field]: value };
    
    // Special case for data_type changes - update default value accordingly
    if (field === 'data_type') {
      switch(value) {
        case 'string':
          updatedAttribute.value = updatedAttribute.value === null ? '' : String(updatedAttribute.value);
          break;
        case 'number':
          updatedAttribute.value = updatedAttribute.value === null ? null : 
            isNaN(Number(updatedAttribute.value)) ? null : Number(updatedAttribute.value);
          break;
        case 'boolean':
          updatedAttribute.value = Boolean(updatedAttribute.value);
          break;
        case 'json':
          if (typeof updatedAttribute.value !== 'object') {
            try {
              updatedAttribute.value = updatedAttribute.value ? JSON.parse(String(updatedAttribute.value)) : {};
            } catch (e) {
              updatedAttribute.value = {};
            }
          }
          break;
      }
    }
    
    setLocalAttribute(updatedAttribute);
    onChange(updatedAttribute);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={localAttribute.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Enter attribute name"
        />
      </div>
      
      <div>
        <Label htmlFor="data-type">Data Type</Label>
        <Select
          value={localAttribute.data_type}
          onValueChange={(value) => 
            handleChange('data_type', value as "string" | "number" | "boolean" | "json")
          }
        >
          <SelectTrigger id="data-type">
            <SelectValue placeholder="Select data type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="string">String</SelectItem>
            <SelectItem value="number">Number</SelectItem>
            <SelectItem value="boolean">Boolean</SelectItem>
            <SelectItem value="json">JSON</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch
          id="required"
          checked={localAttribute.required}
          onCheckedChange={(checked) => handleChange('required', checked)}
        />
        <Label htmlFor="required">Required</Label>
      </div>
      
      <div>
        <Label htmlFor="default-value">Default Value</Label>
        {localAttribute.data_type === 'boolean' ? (
          <div className="flex items-center space-x-2 mt-2">
            <Switch
              id="default-value"
              checked={Boolean(localAttribute.value)}
              onCheckedChange={(checked) => handleChange('value', checked)}
            />
            <Label htmlFor="default-value">Enabled</Label>
          </div>
        ) : localAttribute.data_type === 'json' ? (
          <Textarea
            id="default-value"
            className="font-mono"
            value={
              localAttribute.value !== null
                ? typeof localAttribute.value === 'object'
                  ? JSON.stringify(localAttribute.value, null, 2)
                  : String(localAttribute.value)
                : ''
            }
            onChange={(e) => {
              try {
                const value = e.target.value ? JSON.parse(e.target.value) : {};
                handleChange('value', value);
              } catch (err) {
                // Keep the string value if it's not valid JSON yet
                handleChange('value', e.target.value);
              }
            }}
            placeholder="Enter JSON value"
            rows={5}
          />
        ) : (
          <Input
            id="default-value"
            type={localAttribute.data_type === 'number' ? 'number' : 'text'}
            value={localAttribute.value !== null ? String(localAttribute.value) : ''}
            onChange={(e) => 
              handleChange(
                'value', 
                localAttribute.data_type === 'number' && e.target.value
                  ? Number(e.target.value)
                  : e.target.value
              )
            }
            placeholder={`Enter default ${localAttribute.data_type} value`}
          />
        )}
      </div>
    </div>
  );
};

export default AttributeForm;


import React from 'react';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control } from "react-hook-form";

interface GroupFieldsProps {
  control: Control<any>;
  groupId?: string;
  groupName?: string;
}

const GroupFields: React.FC<GroupFieldsProps> = ({ control, groupId, groupName }) => {
  if (!groupId && !groupName) return null;
  
  return (
    <>
      {/* Group ID */}
      {groupId && (
        <FormField
          control={control}
          name="groupId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Group ID</FormLabel>
              <FormControl>
                <Input placeholder="Group ID" {...field} disabled />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Group Name */}
      {groupName && (
        <FormField
          control={control}
          name="groupName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Group Name</FormLabel>
              <FormControl>
                <Input placeholder="Group Name" value={groupName} disabled />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </>
  );
};

export default GroupFields;


import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Control } from "react-hook-form";

const timeZones = [
  { value: "Europe/London", label: "British Time (London)" },
  { value: "Europe/Paris", label: "Central European Time (Paris)" },
  { value: "Europe/Oslo", label: "Central European Time (Oslo)" },
  { value: "America/New_York", label: "Eastern Time (New York)" },
  { value: "America/Chicago", label: "Central Time (Chicago)" },
  { value: "America/Denver", label: "Mountain Time (Denver)" },
  { value: "America/Los_Angeles", label: "Pacific Time (Los Angeles)" },
  { value: "Asia/Tokyo", label: "Japan Time (Tokyo)" },
  { value: "Asia/Shanghai", label: "China Time (Shanghai)" },
  { value: "Australia/Sydney", label: "Australian Eastern Time (Sydney)" },
];

interface TimeZoneSelectProps {
  control: Control<any>;
  name: string;
}

const TimeZoneSelect = ({ control, name }: TimeZoneSelectProps) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Time Zone</FormLabel>
          <Select onValueChange={field.onChange} value={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select a timezone" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {timeZones.map((tz) => (
                <SelectItem key={tz.value} value={tz.value}>
                  {tz.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default TimeZoneSelect;

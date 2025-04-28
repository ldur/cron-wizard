
import React, { useState, KeyboardEvent } from 'react';
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface TagInputProps {
  tags: string[];
  onChange?: (tags: string[]) => void;
  setTags?: (tags: string[]) => void; // Added this property
}

const TagInput = ({ tags, onChange, setTags }: TagInputProps) => {
  const [input, setInput] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault();
      if (!tags.includes(input.trim())) {
        const newTags = [...tags, input.trim()];
        // Use either onChange or setTags, depending on which is provided
        if (onChange) onChange(newTags);
        if (setTags) setTags(newTags);
      }
      setInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    // Use either onChange or setTags, depending on which is provided
    if (onChange) onChange(newTags);
    if (setTags) setTags(newTags);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 min-h-[2.5rem] p-2 border rounded-md bg-background">
        {tags.map(tag => (
          <Badge key={tag} variant="secondary" className="flex items-center gap-1">
            {tag}
            <X
              className="h-3 w-3 cursor-pointer hover:text-destructive"
              onClick={() => removeTag(tag)}
            />
          </Badge>
        ))}
        <Input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-6 min-w-[100px]"
          placeholder={tags.length === 0 ? "Add tags..." : ""}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Press enter to add a tag
      </p>
    </div>
  );
};

export default TagInput;

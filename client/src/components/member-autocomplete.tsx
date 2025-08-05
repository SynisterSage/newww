import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface Member {
  id: string;
  name: string;
  memberNumber: string;
  membershipType: string;
}

interface MemberAutocompleteProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function MemberAutocomplete({ 
  value, 
  onValueChange, 
  placeholder = "Search members...", 
  disabled = false,
  className 
}: MemberAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Only search when query has at least 2 characters
  const { data: members = [], isLoading } = useQuery<Member[]>({
    queryKey: ['/api/members/search', searchQuery],
    enabled: searchQuery.length >= 2,
    staleTime: 30000, // Cache for 30 seconds
  });

  const selectedMember = members.find(member => member.name === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between h-8 text-sm", className)}
          disabled={disabled}
        >
          {value ? (
            <span className="flex items-center gap-2">
              <User className="w-3 h-3" />
              <span className="truncate">{value}</span>
              {selectedMember && (
                <span className="text-xs text-gray-500">#{selectedMember.memberNumber}</span>
              )}
            </span>
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput 
            placeholder="Type member name..." 
            value={searchQuery}
            onValueChange={setSearchQuery}
            className="h-8"
          />
          <CommandList>
            <CommandEmpty>
              {searchQuery.length < 2 
                ? "Type at least 2 characters to search..." 
                : isLoading 
                  ? "Searching members..." 
                  : "No members found."
              }
            </CommandEmpty>
            {members.length > 0 && (
              <CommandGroup>
                {members.map((member) => (
                  <CommandItem
                    key={member.id}
                    value={member.name}
                    onSelect={(currentValue) => {
                      onValueChange(currentValue === value ? "" : currentValue);
                      setOpen(false);
                      setSearchQuery("");
                    }}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <User className="w-3 h-3" />
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-xs text-gray-500">
                          #{member.memberNumber} • {member.membershipType}
                        </div>
                      </div>
                    </div>
                    <Check
                      className={cn(
                        "ml-auto h-3 w-3",
                        value === member.name ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { TeeTime, User } from "@shared/schema";
import { Users, Car, MapPin, Clock, Plus, Minus, UserPlus, Check, ChevronDown } from "lucide-react";

interface TeeTimeBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teeTime: TeeTime;
  userData: User;
}

interface Player {
  name: string;
  type: "member" | "guest";
  transportMode: "riding" | "walking";
  holesPlaying: "9" | "18";
}

export function TeeTimeBookingDialog({ open, onOpenChange, teeTime, userData }: TeeTimeBookingDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [players, setPlayers] = useState<Player[]>(() => [{
    name: `${userData.firstName} ${userData.lastName}`.trim() || userData.username,
    type: "member",
    transportMode: "riding",
    holesPlaying: "18"
  }]);

  // State for autocomplete dropdowns
  const [openAutocomplete, setOpenAutocomplete] = useState<{ [key: number]: boolean }>({});

  // Fetch all members for autocomplete
  const { data: allMembers = [] } = useQuery<User[]>({
    queryKey: ['/api/admin/members'],
    enabled: open, // Only fetch when dialog is open
    staleTime: 30000, // Cache for 30 seconds
  });

  // Reset players when dialog opens to prevent state corruption
  useEffect(() => {
    if (open) {
      setPlayers([{
        name: `${userData.firstName} ${userData.lastName}`.trim() || userData.username,
        type: "member",
        transportMode: "riding",
        holesPlaying: "18"
      }]);
      setOpenAutocomplete({}); // Reset autocomplete states
    }
  }, [open, userData]);

  const addPlayer = () => {
    if (players.length < 4) {
      setPlayers([...players, {
        name: "",
        type: "member",
        transportMode: "riding",
        holesPlaying: "18"
      }]);
    }
  };

  const removePlayer = (index: number) => {
    if (players.length > 1 && index > 0) { // Can't remove the booking member
      setPlayers(players.filter((_, i) => i !== index));
    }
  };

  const updatePlayer = (index: number, field: keyof Player, value: string) => {
    const updated = [...players];
    updated[index] = { ...updated[index], [field]: value };
    setPlayers(updated);
  };

  // Helper function to get member suggestions
  const getMemberSuggestions = (searchTerm: string) => {
    if (!searchTerm || searchTerm.length < 2) return [];
    
    return allMembers
      .filter(member => {
        const fullName = `${member.firstName || ''} ${member.lastName || ''}`.trim();
        const searchLower = searchTerm.toLowerCase();
        return (
          fullName.toLowerCase().includes(searchLower) ||
          (member.firstName && member.firstName.toLowerCase().includes(searchLower)) ||
          (member.lastName && member.lastName.toLowerCase().includes(searchLower))
        );
      })
      .slice(0, 8) // Limit to 8 suggestions
      .map(member => ({
        id: member.id,
        name: `${member.firstName || ''} ${member.lastName || ''}`.trim(),
        membershipClass: member.membershipClass,
        username: member.username
      }));
  };

  // Handle member selection from autocomplete
  const selectMember = (index: number, memberName: string) => {
    updatePlayer(index, 'name', memberName);
    updatePlayer(index, 'type', 'member'); // Auto-set to member when selecting from database
    setOpenAutocomplete(prev => ({ ...prev, [index]: false }));
  };

  const bookingMutation = useMutation({
    mutationFn: async () => {
      // Debug logging for production troubleshooting
      console.log('Booking mutation starting:', {
        userId: userData.id,
        playersCount: players.length,
        players: players
      });
      
      // Comprehensive validation to ensure arrays are never empty
      if (!Array.isArray(players) || players.length === 0) {
        throw new Error('No players to book - this should not happen');
      }
      
      // Validate each player object
      const validatedPlayers = players.map((player, index) => {
        if (!player || typeof player !== 'object') {
          throw new Error(`Invalid player object at index ${index}`);
        }
        return {
          name: player.name || `Player ${index + 1}`,
          type: player.type || 'member',
          transportMode: player.transportMode || 'riding',
          holesPlaying: player.holesPlaying || '18'
        };
      });
      
      const response = await apiRequest('PATCH', `/api/teetimes/${teeTime.id}/book`, {
        userId: userData.id,
        players: validatedPlayers
      });
      return response.json();
    },
    onSuccess: () => {
      // Comprehensive cache invalidation for real-time updates across all pages (member + admin)
      queryClient.invalidateQueries({ queryKey: ['/api/teetimes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/teetimes/user', userData.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/members'] });
      
      // Get today's date for admin dashboard invalidation (use same format as admin dashboard)
      const today = new Date().toISOString().split('T')[0]; // format: yyyy-mm-dd
      queryClient.invalidateQueries({ queryKey: ['/api/teetimes', today] });
      
      // Invalidate ALL tee time queries (includes all date-specific queries for admin dashboard & admin tee-times)
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const key = query.queryKey;
          return (
            key[0] === '/api/teetimes' ||
            key[0] === '/api/admin/members' ||
            (Array.isArray(key) && key.length >= 1 && key[0] === '/api/teetimes')
          );
        }
      });
      toast({
        title: "Booking Confirmed",
        description: `Successfully booked tee time for ${players.length} player${players.length > 1 ? 's' : ''}!`,
      });
      onOpenChange(false);
      // Reset form
      setPlayers([{
        name: `${userData.firstName} ${userData.lastName}`.trim() || userData.username,
        type: "member",
        transportMode: "riding",
        holesPlaying: "18"
      }]);
    },
    onError: (error: any) => {
      toast({
        title: "Booking Failed",
        description: error.message || "Unable to book this tee time. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleBooking = () => {
    bookingMutation.mutate();
  };

  const currentPlayers = teeTime.bookedBy?.length || 0;
  const maxPlayers = teeTime.maxPlayers || 4;
  const isUserBooked = teeTime.bookedBy?.includes(userData.id);

  if (isUserBooked) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col" data-testid="dialog-tee-time-booking">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <Clock className="w-5 h-5 text-golf-green" />
            Join Tee Time
          </DialogTitle>
          <DialogDescription>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span className="font-medium">{teeTime.date}</span>
                <span>at</span>
                <span className="font-medium">{teeTime.time}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Users className="w-4 h-4" />
                <span>{currentPlayers}/{maxPlayers} players</span>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto space-y-4 min-h-0">
          {/* Players Table Header */}
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4" />
              Players ({players.length}/4)
            </Label>
            {players.length < 4 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addPlayer}
                className="flex items-center gap-1"
                data-testid="button-add-player"
              >
                <Plus className="w-3 h-3" />
                Add Player
              </Button>
            )}
          </div>

          {/* Players Table */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-3 py-2 border-b">
              <div className="grid grid-cols-12 gap-3 text-xs font-medium text-gray-600">
                <div className="col-span-4">Name</div>
                <div className="col-span-2">Type</div>
                <div className="col-span-2">Transport</div>
                <div className="col-span-2">Holes</div>
                <div className="col-span-2 text-center">Action</div>
              </div>
            </div>
            
            <div className="divide-y">
              {players.map((player, index) => (
                <div key={index} className="px-3 py-3 hover:bg-gray-50/50">
                  <div className="grid grid-cols-12 gap-3 items-start">
                    {/* Name */}
                    <div className="col-span-4 space-y-1">
                      {index === 0 ? (
                        // First player (booking member) - no autocomplete
                        <Input
                          value={player.name}
                          onChange={(e) => updatePlayer(index, 'name', e.target.value)}
                          placeholder="Your name"
                          disabled={true}
                          className="h-8 text-sm"
                          data-testid={`input-player-name-${index}`}
                        />
                      ) : (
                        // Additional players - with member autocomplete
                        <div className="relative">
                          <Input
                            value={player.name}
                            onChange={(e) => {
                              updatePlayer(index, 'name', e.target.value);
                              const shouldShow = e.target.value.length >= 2 && getMemberSuggestions(e.target.value).length > 0;
                              setOpenAutocomplete(prev => ({ ...prev, [index]: shouldShow }));
                            }}
                            onFocus={() => {
                              const shouldShow = player.name.length >= 2 && getMemberSuggestions(player.name).length > 0;
                              setOpenAutocomplete(prev => ({ ...prev, [index]: shouldShow }));
                            }}
                            onBlur={() => {
                              // Delay closing to allow for clicks on dropdown items
                              setTimeout(() => {
                                setOpenAutocomplete(prev => ({ ...prev, [index]: false }));
                              }, 200);
                            }}
                            placeholder="Search member name or type guest name"
                            className="h-8 text-sm pr-8"
                            data-testid={`input-player-name-${index}`}
                          />
                          {player.name.length >= 2 && getMemberSuggestions(player.name).length > 0 && (
                            <ChevronDown className="absolute right-2 top-2 h-4 w-4 text-gray-400" />
                          )}
                          
                          {/* Dropdown suggestions - positioned above input to avoid cutoff */}
                          {openAutocomplete[index] && getMemberSuggestions(player.name).length > 0 && (
                            <div className="absolute z-50 w-full max-w-xs bottom-full mb-1 bg-white border border-gray-200 rounded-md shadow-lg">
                              <div className="px-3 py-2 text-xs font-medium text-gray-600 border-b">
                                Members ({getMemberSuggestions(player.name).length})
                              </div>
                              <div className="max-h-32 overflow-y-auto">
                                {getMemberSuggestions(player.name).map((member) => (
                                  <div
                                    key={member.id}
                                    onClick={() => selectMember(index, member.name)}
                                    className="flex items-center gap-2 px-3 py-1.5 cursor-pointer hover:bg-gray-50"
                                  >
                                    <Users className="w-3 h-3 text-golf-green" />
                                    <div className="flex-1 min-w-0">
                                      <div className="text-sm font-medium truncate">{member.name}</div>
                                      <div className="text-xs text-gray-500 truncate">
                                        {member.membershipClass ? `${member.membershipClass} Member` : 'Member'}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      {index === 0 && (
                        <div className="text-xs text-golf-green">Booking Member</div>
                      )}
                    </div>

                    {/* Type */}
                    <div className="col-span-2">
                      <Select
                        value={player.type}
                        onValueChange={(value) => updatePlayer(index, 'type', value)}
                        disabled={index === 0}
                      >
                        <SelectTrigger className="h-8 text-sm" data-testid={`select-player-type-${index}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="member">Member</SelectItem>
                          <SelectItem value="guest">Guest</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Transport */}
                    <div className="col-span-2">
                      <Select
                        value={player.transportMode}
                        onValueChange={(value) => updatePlayer(index, 'transportMode', value)}
                      >
                        <SelectTrigger className="h-8 text-sm" data-testid={`select-transport-${index}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="riding">Riding</SelectItem>
                          <SelectItem value="walking">Walking</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Holes */}
                    <div className="col-span-2">
                      <Select
                        value={player.holesPlaying}
                        onValueChange={(value) => updatePlayer(index, 'holesPlaying', value)}
                      >
                        <SelectTrigger className="h-8 text-sm" data-testid={`select-holes-${index}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="9">9 Holes</SelectItem>
                          <SelectItem value="18">18 Holes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Action */}
                    <div className="col-span-2 flex justify-center">
                      {index > 0 ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removePlayer(index)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          data-testid={`button-remove-player-${index}`}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                      ) : (
                        <div className="text-xs text-gray-400 mt-2">Primary</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fixed footer */}
        <div className="flex-shrink-0 space-y-4 pt-4 border-t">
          {/* Booking Summary */}
          <div className="bg-golf-green/5 rounded-lg p-3">
            <div className="flex justify-between items-center text-sm">
              <div className="space-y-1">
                <div className="flex items-center gap-4">
                  <span className="text-gray-600">Total Players: <span className="font-medium">{players.length}</span></span>
                  <span className="text-gray-600">Available: <span className="font-medium">{maxPlayers - currentPlayers - players.length}</span></span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-golf-green">${teeTime.price}</div>
                <div className="text-xs text-gray-500">Green Fee</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              data-testid="button-cancel-booking"
            >
              Cancel
            </Button>
            <Button
              onClick={handleBooking}
              disabled={bookingMutation.isPending}
              className="flex-1 bg-golf-green hover:bg-golf-green/90 text-white"
              data-testid="button-confirm-booking"
            >
              {bookingMutation.isPending ? "Booking..." : "Confirm Booking"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
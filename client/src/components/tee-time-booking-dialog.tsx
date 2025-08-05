import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { TeeTime, User } from "@shared/schema";
import { Users, Car, MapPin, Clock, Plus, Minus, UserPlus } from "lucide-react";

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

  // Reset players when dialog opens to prevent state corruption
  useEffect(() => {
    if (open) {
      setPlayers([{
        name: `${userData.firstName} ${userData.lastName}`.trim() || userData.username,
        type: "member",
        transportMode: "riding",
        holesPlaying: "18"
      }]);
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
            <div className="bg-gray-50 px-4 py-2 border-b">
              <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-600">
                <div className="col-span-4">Name</div>
                <div className="col-span-2">Type</div>
                <div className="col-span-2">Transport</div>
                <div className="col-span-2">Holes</div>
                <div className="col-span-2">Action</div>
              </div>
            </div>
            
            <div className="divide-y">
              {players.map((player, index) => (
                <div key={index} className="px-4 py-3 hover:bg-gray-50/50">
                  <div className="grid grid-cols-12 gap-2 items-center">
                    {/* Name */}
                    <div className="col-span-4">
                      <Input
                        value={player.name}
                        onChange={(e) => updatePlayer(index, 'name', e.target.value)}
                        placeholder={index === 0 ? "Your name" : "Player name"}
                        disabled={index === 0}
                        className="h-8 text-sm"
                        data-testid={`input-player-name-${index}`}
                      />
                      {index === 0 && (
                        <div className="text-xs text-golf-green mt-1">Booking Member</div>
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
                    <div className="col-span-2">
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
                        <div className="text-xs text-gray-400">Primary</div>
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
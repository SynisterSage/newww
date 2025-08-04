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
      
      if (players.length === 0) {
        throw new Error('No players to book - this should not happen');
      }
      
      const response = await apiRequest('PATCH', `/api/teetimes/${teeTime.id}/book`, {
        userId: userData.id,
        players: players
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teetimes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/teetimes/user', userData.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
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
      <DialogContent className="sm:max-w-md" data-testid="dialog-tee-time-booking">
        <DialogHeader>
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

        <div className="space-y-6 pt-4">
          {/* Players List */}
          <div className="space-y-4">
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

            {players.map((player, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3 bg-gray-50">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    {index === 0 ? 'Booking Member' : `Player ${index + 1}`}
                  </span>
                  {index > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removePlayer(index)}
                      className="text-red-600 hover:text-red-700"
                      data-testid={`button-remove-player-${index}`}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <Label className="text-xs text-gray-500">Name</Label>
                    <Input
                      value={player.name}
                      onChange={(e) => updatePlayer(index, 'name', e.target.value)}
                      placeholder={index === 0 ? "Your name" : "Player name"}
                      disabled={index === 0}
                      className="mt-1"
                      data-testid={`input-player-name-${index}`}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-xs text-gray-500">Type</Label>
                      <Select
                        value={player.type}
                        onValueChange={(value) => updatePlayer(index, 'type', value)}
                        disabled={index === 0}
                      >
                        <SelectTrigger className="mt-1" data-testid={`select-player-type-${index}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="member">Member</SelectItem>
                          <SelectItem value="guest">Guest</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-xs text-gray-500">Transport</Label>
                      <Select
                        value={player.transportMode}
                        onValueChange={(value) => updatePlayer(index, 'transportMode', value)}
                      >
                        <SelectTrigger className="mt-1" data-testid={`select-transport-${index}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="riding">Riding</SelectItem>
                          <SelectItem value="walking">Walking</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-xs text-gray-500">Holes</Label>
                      <Select
                        value={player.holesPlaying}
                        onValueChange={(value) => updatePlayer(index, 'holesPlaying', value)}
                      >
                        <SelectTrigger className="mt-1" data-testid={`select-holes-${index}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="9">9 Holes</SelectItem>
                          <SelectItem value="18">18 Holes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Booking Summary */}
          <div className="bg-golf-green/5 rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-sm text-golf-green">Booking Summary</h4>
            <div className="text-xs space-y-1 text-gray-600">
              <div className="flex justify-between">
                <span>Total Players:</span>
                <span>{players.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Available Spots:</span>
                <span>{maxPlayers - currentPlayers - players.length} remaining</span>
              </div>
              <div className="flex justify-between font-medium pt-2 border-t">
                <span>Green Fee:</span>
                <span>${teeTime.price}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
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
      </DialogContent>
    </Dialog>
  );
}
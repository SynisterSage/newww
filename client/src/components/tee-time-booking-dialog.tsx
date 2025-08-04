import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { TeeTime, User } from "@shared/schema";
import { Users, Car, MapPin, Clock } from "lucide-react";

interface TeeTimeBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teeTime: TeeTime;
  userData: User;
}

export function TeeTimeBookingDialog({ open, onOpenChange, teeTime, userData }: TeeTimeBookingDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [playerType, setPlayerType] = useState<"member" | "guest">("member");
  const [transportMode, setTransportMode] = useState<"riding" | "walking">("riding");
  const [holesPlaying, setHolesPlaying] = useState<"9" | "18">("18");

  const bookingMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('PATCH', `/api/teetimes/${teeTime.id}/book`, {
        userId: userData.id,
        playerName: `${userData.firstName} ${userData.lastName}`.trim() || userData.username,
        playerType,
        transportMode,
        holesPlaying
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teetimes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/teetimes/user', userData.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      toast({
        title: "Booking Confirmed",
        description: "You've successfully joined this tee time!",
      });
      onOpenChange(false);
      // Reset form
      setPlayerType("member");
      setTransportMode("riding");
      setHolesPlaying("18");
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
          {/* Player Type Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4" />
              Player Type
            </Label>
            <RadioGroup
              value={playerType}
              onValueChange={(value: "member" | "guest") => setPlayerType(value)}
              className="flex gap-4"
              data-testid="radio-group-player-type"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="member" id="member" data-testid="radio-member" />
                <Label htmlFor="member" className="cursor-pointer">Member</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="guest" id="guest" data-testid="radio-guest" />
                <Label htmlFor="guest" className="cursor-pointer">Guest</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Transport Mode Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Car className="w-4 h-4" />
              Transportation
            </Label>
            <RadioGroup
              value={transportMode}
              onValueChange={(value: "riding" | "walking") => setTransportMode(value)}
              className="flex gap-4"
              data-testid="radio-group-transport-mode"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="riding" id="riding" data-testid="radio-riding" />
                <Label htmlFor="riding" className="cursor-pointer">Cart (Riding)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="walking" id="walking" data-testid="radio-walking" />
                <Label htmlFor="walking" className="cursor-pointer">Walking</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Holes Playing Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Holes Playing
            </Label>
            <RadioGroup
              value={holesPlaying}
              onValueChange={(value: "9" | "18") => setHolesPlaying(value)}
              className="flex gap-4"
              data-testid="radio-group-holes-playing"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="18" id="eighteen" data-testid="radio-eighteen-holes" />
                <Label htmlFor="eighteen" className="cursor-pointer">18 Holes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="9" id="nine" data-testid="radio-nine-holes" />
                <Label htmlFor="nine" className="cursor-pointer">9 Holes</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Booking Summary */}
          <div className="bg-golf-green/5 rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-sm text-golf-green">Booking Summary</h4>
            <div className="text-xs space-y-1 text-gray-600">
              <div className="flex justify-between">
                <span>Player:</span>
                <span className="capitalize">{playerType}</span>
              </div>
              <div className="flex justify-between">
                <span>Transport:</span>
                <span className="capitalize">{transportMode}</span>
              </div>
              <div className="flex justify-between">
                <span>Holes:</span>
                <span>{holesPlaying} holes</span>
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
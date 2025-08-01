import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { TeeTime } from "@shared/schema";

interface TeeTimeCardProps {
  teetime: TeeTime;
  onBook: () => void;
  isBooking: boolean;
}

export default function TeeTimeCard({ teetime, onBook, isBooking }: TeeTimeCardProps) {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'available':
        return 'default';
      case 'booked':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'booked':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isBooked = teetime.status === 'booked' || teetime.spotsAvailable === 0;

  return (
    <Card className={`transition-colors cursor-pointer ${
      teetime.isPremium 
        ? 'border-golf-gold bg-golf-gold/5 hover:border-golf-gold' 
        : isBooked 
          ? 'opacity-50' 
          : 'border-gray-200 hover:border-golf-gold'
    }`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-lg font-semibold text-golf-green">{teetime.time}</span>
          <Badge className={`text-xs px-2 py-1 ${
            teetime.isPremium 
              ? 'bg-golf-gold text-white' 
              : getStatusColor(teetime.status)
          }`}>
            {teetime.isPremium ? 'Premium' : 
             isBooked ? 'Booked' : 'Available'}
          </Badge>
        </div>
        
        <p className="text-sm text-gray-600 mb-3">
          {teetime.spotsAvailable} spot{teetime.spotsAvailable !== 1 ? 's' : ''} available
        </p>
        
        <Button
          onClick={onBook}
          disabled={isBooked || isBooking}
          className={`w-full text-sm font-medium transition-colors ${
            isBooked
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-golf-gold hover:bg-golf-gold/90 text-white'
          }`}
        >
          {isBooked 
            ? 'Fully Booked' 
            : isBooking 
              ? 'Booking...' 
              : `Book Now - $${teetime.price}`}
        </Button>
      </CardContent>
    </Card>
  );
}

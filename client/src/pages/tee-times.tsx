import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import TeeTimeCard from "@/components/tee-time-card";
import { useState } from "react";
import type { TeeTime } from "@shared/schema";

export default function TeeTimes() {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [selectedCourse, setSelectedCourse] = useState("Championship Course");

  const { data: teetimes = [], isLoading } = useQuery<TeeTime[]>({
    queryKey: ['/api/teetimes', selectedDate],
  });

  const bookingMutation = useMutation({
    mutationFn: async (teetimeId: string) => {
      const response = await apiRequest('PATCH', `/api/teetimes/${teetimeId}/book`, {
        userId: 'user-1'
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teetimes'] });
      toast({
        title: "Booking Confirmed",
        description: "Your tee time has been successfully booked!",
      });
    },
    onError: () => {
      toast({
        title: "Booking Failed",
        description: "Unable to book this tee time. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="p-4 lg:p-8">
        <div className="animate-pulse space-y-8">
          <div className="h-32 bg-gray-300 rounded-2xl"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-48 bg-gray-300 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-8">
      <Card>
        <CardContent className="p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-golf-green mb-2">Tee Time Reservations</h1>
              <p className="text-gray-600">Book your preferred time on our championship course</p>
            </div>
            <div className="mt-4 lg:mt-0 flex flex-col sm:flex-row gap-4">
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Championship Course">Championship Course</SelectItem>
                  <SelectItem value="Executive Course">Executive Course</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full sm:w-48"
              />
            </div>
          </div>

          {/* Time Slots Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
            {teetimes.map((teetime) => (
              <TeeTimeCard
                key={teetime.id}
                teetime={teetime}
                onBook={() => bookingMutation.mutate(teetime.id)}
                isBooking={bookingMutation.isPending}
              />
            ))}
          </div>

          {/* Booking Information */}
          <div className="p-6 bg-gray-50 rounded-xl">
            <h3 className="text-lg font-semibold text-golf-green mb-4">Booking Information</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-golf-green mb-2">Course Details</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Championship 18-hole course</li>
                  <li>• Par 72, 7,248 yards</li>
                  <li>• Cart included in green fee</li>
                  <li>• Practice range access included</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-golf-green mb-2">Policies</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 24-hour cancellation policy</li>
                  <li>• Proper golf attire required</li>
                  <li>• Maximum 4 players per group</li>
                  <li>• Check-in 30 minutes prior</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

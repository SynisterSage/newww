import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useState, useEffect } from "react";
import { Calendar, Clock, Users, UserCheck } from "lucide-react";
import { format } from "date-fns";
import type { TeeTime, User } from "@shared/schema";

interface TeeTimesProps {
  userData?: User;
}

export default function TeeTimes({ userData }: TeeTimesProps) {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  // Auto-refresh every 30 seconds to update times
  useEffect(() => {
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['/api/teetimes', selectedDate] });
    }, 30000);
    return () => clearInterval(interval);
  }, [selectedDate]);

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const isToday = selectedDate === getTodayDate();
  const isTomorrow = selectedDate === getTomorrowDate();

  const { data: teetimes = [], isLoading } = useQuery<TeeTime[]>({
    queryKey: ['/api/teetimes', selectedDate],
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
    gcTime: 0,
  });

  const { data: userTeetimes = [] } = useQuery<TeeTime[]>({
    queryKey: ['/api/teetimes/user', userData?.id],
    enabled: !!userData?.id,
  });

  // Filter tee times based on current time
  const getFilteredTeetimes = () => {
    if (!isToday) {
      return teetimes; // Show all times for future dates
    }

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTotalMinutes = currentHour * 60 + currentMinute;

    return teetimes.filter(teetime => {
      // Parse time format "7:00 AM", "1:30 PM", etc.
      const match = teetime.time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
      if (!match) return false;

      let hour = parseInt(match[1]);
      const minute = parseInt(match[2]);
      const ampm = match[3].toUpperCase();

      // Convert to 24-hour
      if (ampm === 'PM' && hour !== 12) hour += 12;
      if (ampm === 'AM' && hour === 12) hour = 0;

      const teetimeMinutes = hour * 60 + minute;
      return teetimeMinutes > currentTotalMinutes;
    });
  };

  const filteredTeetimes = getFilteredTeetimes();

  const bookingMutation = useMutation({
    mutationFn: async (teetimeId: string) => {
      if (!userData?.id) throw new Error("User not logged in");
      
      const response = await apiRequest('PATCH', `/api/teetimes/${teetimeId}/book`, {
        userId: userData.id,
        playerName: `${userData.firstName} ${userData.lastName}`.trim() || userData.username
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teetimes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/teetimes/user', userData?.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      toast({
        title: "Booking Confirmed",
        description: "You've joined this tee time!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Booking Failed",
        description: error.message || "Unable to book this tee time. Please try again.",
        variant: "destructive",
      });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (teetimeId: string) => {
      if (!userData?.id) throw new Error("User not logged in");
      
      const response = await apiRequest('PATCH', `/api/teetimes/${teetimeId}/cancel`, {
        userId: userData.id
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teetimes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/teetimes/user', userData?.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      toast({
        title: "Booking Cancelled",
        description: "You've left this tee time.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Cancellation Failed",
        description: error.message || "Unable to cancel. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getStatusInfo = (teetime: TeeTime) => {
    const currentPlayers = teetime.bookedBy?.length || 0;
    const maxPlayers = teetime.maxPlayers || 4;
    const isUserBooked = teetime.bookedBy?.includes(userData?.id || "");
    
    if (currentPlayers === 0) {
      return { 
        status: "available", 
        color: "bg-green-100 text-green-700 border-green-200", 
        text: "Available",
        canJoin: true
      };
    } else if (currentPlayers < maxPlayers) {
      return { 
        status: "partial", 
        color: "bg-blue-100 text-blue-700 border-blue-200", 
        text: `${currentPlayers}/${maxPlayers} Players`,
        canJoin: !isUserBooked
      };
    } else {
      return { 
        status: "full", 
        color: "bg-red-100 text-red-700 border-red-200", 
        text: "Full",
        canJoin: false
      };
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F6F0]">
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8 max-w-7xl mx-auto pb-20 lg:pb-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4 w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="h-32 bg-muted rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F6F0]">
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8 max-w-7xl mx-auto pb-20 lg:pb-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#08452e] mb-2">Tee Time Schedule</h1>
            <p className="text-sm sm:text-base text-muted-foreground">View and join available tee times • 16-minute intervals from 7 AM to 7 PM</p>
          </div>
        </div>

        {/* Date Selector */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-golf-green" />
                <span className="text-sm font-medium text-foreground">Select Date</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button
                  variant={isToday ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedDate(getTodayDate())}
                  className={isToday ? "bg-golf-green hover:bg-golf-green-light text-white" : ""}
                >
                  Today
                  <span className="ml-2 text-xs opacity-75">
                    {format(new Date(), 'M/d')}
                  </span>
                </Button>
                
                <Button
                  variant={isTomorrow ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedDate(getTomorrowDate())}
                  className={isTomorrow ? "bg-golf-green hover:bg-golf-green-light text-white" : ""}
                >
                  Tomorrow
                  <span className="ml-2 text-xs opacity-75">
                    {(() => {
                      const tomorrow = new Date();
                      tomorrow.setDate(tomorrow.getDate() + 1);
                      return format(tomorrow, 'M/d');
                    })()}
                  </span>
                </Button>
              </div>
              
              <div className="text-sm text-muted-foreground">
                {formatDate(selectedDate)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Legend */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-green-100 border border-green-200"></div>
                <span>Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-blue-100 border border-blue-200"></div>
                <span>Partially Booked</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-red-100 border border-red-200"></div>
                <span>Full</span>
              </div>
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-golf-green" />
                <span>Your Bookings</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tee Time Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTeetimes
            .sort((a, b) => a.time.localeCompare(b.time))
            .map((teetime) => {
            const statusInfo = getStatusInfo(teetime);
            const isUserBooked = teetime.bookedBy?.includes(userData?.id || "");
            
            return (
              <Card 
                key={teetime.id} 
                className="border border-gray-200 transition-all duration-200 hover:shadow-md hover:border-golf-green/30 h-full flex flex-col"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-golf-green" />
                      <CardTitle className="text-lg font-semibold text-golf-green">
                        {teetime.time}
                      </CardTitle>
                    </div>
                    {isUserBooked && (
                      <UserCheck className="w-4 h-4 text-golf-green" />
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4 flex-1 flex flex-col">
                  {/* Status Badge */}
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}>
                    <Users className="w-3 h-3 mr-1" />
                    {statusInfo.text}
                  </div>

                  {/* Course Info */}
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div className="flex items-center gap-1">
                      <span>18 Holes</span>
                      <span>•</span>
                      <span>${teetime.price}</span>
                    </div>
                    <div>{teetime.course}</div>
                  </div>

                  {/* Action Button */}
                  <div className="mt-auto">
                    {isUserBooked ? (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full border-red-200 text-red-700 hover:bg-red-50"
                        onClick={() => cancelMutation.mutate(teetime.id)}
                        disabled={cancelMutation.isPending}
                      >
                        Leave Tee Time
                      </Button>
                    ) : statusInfo.canJoin ? (
                      <Button 
                        size="sm" 
                        className="w-full bg-golf-green hover:bg-golf-green-light text-white"
                        onClick={() => bookingMutation.mutate(teetime.id)}
                        disabled={bookingMutation.isPending}
                      >
                        + Join Tee Time
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full" 
                        disabled
                      >
                        {statusInfo.status === "full" ? "Full" : "Already Joined"}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredTeetimes.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {isToday ? "No More Tee Times Today" : "No Tee Times Available"}
            </h3>
            <p className="text-muted-foreground">
              {isToday 
                ? "All tee times for today have passed. Check tomorrow's schedule!" 
                : "Tee times will be available closer to the date."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
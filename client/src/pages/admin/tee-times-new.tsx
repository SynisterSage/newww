import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User as UserIcon, Users, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import type { TeeTime, User } from "@shared/schema";

export default function AdminTeeTimesPage() {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['/api/teetimes', selectedDate] });
    }, 30000);
    return () => clearInterval(interval);
  }, [selectedDate, queryClient]);

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
  });

  const { data: members = [] } = useQuery<User[]>({
    queryKey: ['/api/admin/members'],
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

  const getMemberDetails = (userId: string | null) => {
    if (!userId) return null;
    return members.find(member => member.id === userId);
  };

  const getStatusInfo = (teetime: TeeTime) => {
    const currentPlayers = teetime.bookedBy?.length || 0;
    const maxPlayers = teetime.maxPlayers || 4;
    
    if (currentPlayers === 0) {
      return { 
        status: "available", 
        color: "bg-green-100 text-green-700 border-green-200", 
        text: "Available",
        players: `0/${maxPlayers}`
      };
    } else if (currentPlayers < maxPlayers) {
      return { 
        status: "partial", 
        color: "bg-blue-100 text-blue-700 border-blue-200", 
        text: `${currentPlayers}/${maxPlayers} Players`,
        players: `${currentPlayers}/${maxPlayers}`
      };
    } else {
      return { 
        status: "full", 
        color: "bg-red-100 text-red-700 border-red-200", 
        text: "Full",
        players: `${currentPlayers}/${maxPlayers}`
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

  // Calculate statistics
  const availableTeetimes = filteredTeetimes.filter(tt => (tt.bookedBy?.length || 0) === 0);
  const partialTeetimes = filteredTeetimes.filter(tt => {
    const players = tt.bookedBy?.length || 0;
    return players > 0 && players < (tt.maxPlayers || 4);
  });
  const fullTeetimes = filteredTeetimes.filter(tt => (tt.bookedBy?.length || 0) >= (tt.maxPlayers || 4));
  const totalBookedPlayers = filteredTeetimes.reduce((sum, tt) => sum + (tt.bookedBy?.length || 0), 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F6F0] p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4 w-1/3"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F6F0]">
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-800 mb-2">Tee Time Management</h1>
          <p className="text-muted-foreground">View and manage member tee time bookings • 16-minute intervals from 7 AM to 7 PM</p>
        </div>

        {/* Date Selector */}
        <Card className="border-0 shadow-sm mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-blue-600" />
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

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-foreground">{availableTeetimes.length}</p>
              <p className="text-sm text-muted-foreground">Available Slots</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-foreground">{partialTeetimes.length}</p>
              <p className="text-sm text-muted-foreground">Partially Booked</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <MapPin className="h-6 w-6 text-red-600" />
              </div>
              <p className="text-2xl font-bold text-foreground">{fullTeetimes.length}</p>
              <p className="text-sm text-muted-foreground">Full Slots</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-golf-green rounded-full flex items-center justify-center mx-auto mb-3">
                <UserIcon className="h-6 w-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-foreground">{totalBookedPlayers}</p>
              <p className="text-sm text-muted-foreground">Total Players</p>
            </CardContent>
          </Card>
        </div>

        {/* Tee Time Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTeetimes
            .sort((a, b) => a.time.localeCompare(b.time))
            .map((teetime) => {
            const statusInfo = getStatusInfo(teetime);
            const bookedMembers = teetime.bookedBy?.map(userId => getMemberDetails(userId)).filter(Boolean) || [];

            return (
              <Card key={teetime.id} className="border-0 shadow-sm bg-white">
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <div className="w-12 h-12 bg-golf-green rounded-full flex items-center justify-center mx-auto mb-3">
                      <Clock className="h-6 w-6 text-white" />
                    </div>
                    <p className="font-bold text-xl text-foreground mb-2">{teetime.time}</p>
                    <Badge className={`${statusInfo.color} border`}>
                      {statusInfo.text}
                    </Badge>
                  </div>

                  {/* Player Details */}
                  <div className="space-y-3">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">
                        Players: {statusInfo.players}
                      </p>
                    </div>

                    {bookedMembers.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Booked Members:
                        </p>
                        {bookedMembers.map((member, index) => (
                          <div key={index} className="flex items-center space-x-2 text-sm">
                            <UserIcon className="w-4 h-4 text-golf-green" />
                            <span className="text-foreground">
                              {member?.firstName} {member?.lastName}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {statusInfo.status === "available" && (
                      <div className="text-center text-sm text-muted-foreground italic">
                        No bookings yet
                      </div>
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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User as UserIcon, Users, MapPin, Car, Grid3X3, List, UserCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import type { TeeTime, User } from "@shared/schema";

export default function AdminTeeTimesPage() {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Auto-refresh every 30 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['/api/teetimes', selectedDate] });
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/members'] });
      queryClient.invalidateQueries({ queryKey: ['/api/conditions'] });
    }, 30000); // Refresh every 30 seconds for real-time updates

    return () => clearInterval(interval);
  }, [selectedDate, queryClient]);

  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const day = String(tomorrow.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isToday = selectedDate === getTodayDate();
  const isTomorrow = selectedDate === getTomorrowDate();

  // Function to check if a tee time is in the past
  const isPastTime = (time: string, date: string) => {
    if (!isToday) return false; // Only filter for today's date
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Parse time string (e.g., "7:00 AM" or "1:30 PM")
    const timeMatch = time.match(/(\d+):(\d+)\s*(AM|PM)/);
    if (!timeMatch) return false;
    
    let hour = parseInt(timeMatch[1]);
    const minute = parseInt(timeMatch[2]);
    const ampm = timeMatch[3];
    
    // Convert to 24-hour format
    if (ampm === 'PM' && hour !== 12) hour += 12;
    if (ampm === 'AM' && hour === 12) hour = 0;
    
    // Check if time has passed
    if (hour < currentHour) return true;
    if (hour === currentHour && minute <= currentMinute) return true;
    
    return false;
  };

  // Fetch all tee times for the selected date - AUTO-REFRESH
  const { data: teetimes = [], isLoading } = useQuery<TeeTime[]>({
    queryKey: ['/api/teetimes', selectedDate],
    refetchInterval: 3000, // Auto-refresh every 3 seconds like orders
    refetchIntervalInBackground: true, // Continue polling when tab inactive
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0, // Always fetch fresh data
  });

  // Filter out past times
  const availableTeetimes = teetimes.filter(teetime => !isPastTime(teetime.time, teetime.date));

  // Fetch all members to get user details
  const { data: members = [] } = useQuery<User[]>({
    queryKey: ['/api/admin/members'],
  });

  // Get member details by user ID
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

  const formatTime = (time: string) => {
    // If time already has AM/PM, return as is
    if (time.includes('AM') || time.includes('PM')) {
      return time;
    }
    
    // Convert 24-hour format to 12-hour format
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Helper function to sort times properly (7 AM to 7 PM)
  const sortTimesProperly = (teetimes: TeeTime[]) => {
    return teetimes.sort((a, b) => {
      // Convert time strings to 24-hour format for proper sorting
      const timeToMinutes = (timeStr: string) => {
        const [time, period] = timeStr.split(' ');
        const [hours, minutes] = time.split(':').map(Number);
        let totalMinutes = hours * 60 + minutes;
        if (period === 'PM' && hours !== 12) totalMinutes += 12 * 60;
        if (period === 'AM' && hours === 12) totalMinutes = minutes;
        return totalMinutes;
      };
      return timeToMinutes(a.time) - timeToMinutes(b.time);
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00'); // Add time to avoid timezone issues
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Calculate statistics
  const openSlots = teetimes.filter(tt => (tt.bookedBy?.length || 0) === 0);
  const partialSlots = teetimes.filter(tt => {
    const players = tt.bookedBy?.length || 0;
    return players > 0 && players < (tt.maxPlayers || 4);
  });
  const fullSlots = teetimes.filter(tt => (tt.bookedBy?.length || 0) >= (tt.maxPlayers || 4));
  const totalBookedPlayers = teetimes.reduce((sum, tt) => sum + (tt.bookedBy?.length || 0), 0);

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
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-blue-800 mb-2">Tee Time Management</h1>
            <p className="text-muted-foreground">View and manage member tee time bookings • 16-minute intervals from 7 AM to 7 PM</p>
          </div>
          
          {/* View Toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className={viewMode === 'grid' ? 'bg-blue-600 hover:bg-blue-700' : ''}
            >
              <Grid3X3 className="w-4 h-4 mr-2" />
              Grid
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'bg-blue-600 hover:bg-blue-700' : ''}
            >
              <List className="w-4 h-4 mr-2" />
              List
            </Button>
          </div>
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

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{openSlots.length}</p>
              <p className="text-sm text-muted-foreground">Available Slots</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{partialSlots.length}</p>
              <p className="text-sm text-muted-foreground">Partially Booked</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <MapPin className="h-6 w-6 text-red-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{fullSlots.length}</p>
              <p className="text-sm text-muted-foreground">Full Slots</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <UserIcon className="h-6 w-6 text-gray-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{totalBookedPlayers}</p>
              <p className="text-sm text-muted-foreground">Total Players</p>
            </CardContent>
          </Card>
        </div>

        {/* Tee Time Display */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {sortTimesProperly(availableTeetimes)
              .map((teetime) => {
              const statusInfo = getStatusInfo(teetime);
              const bookedMembers = teetime.bookedBy?.map(userId => getMemberDetails(userId)).filter(Boolean) || [];

              return (
                <Card key={teetime.id} className="border-0 shadow-sm bg-white">
                  <CardContent className="p-4">
                    <div className="text-center mb-3">
                      <div className="w-10 h-10 bg-golf-green rounded-full flex items-center justify-center mx-auto mb-2">
                        <Clock className="h-5 w-5 text-white" />
                      </div>
                      <p className="font-bold text-lg text-foreground mb-2">{formatTime(teetime.time)}</p>
                      <Badge className={`${statusInfo.color} border text-xs`}>
                        {statusInfo.text}
                      </Badge>
                    </div>

                    {/* Player Details */}
                    <div className="space-y-2">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-2">
                          Players: {statusInfo.players}
                        </p>
                      </div>

                      {bookedMembers.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide text-center">
                            Booked Players:
                          </p>
                          {bookedMembers.map((member, index) => {
                            const playerType = teetime.playerTypes?.[index] || 'member';
                            const transportMode = teetime.transportModes?.[index] || 'riding';
                            const holesPlaying = teetime.holesPlaying?.[index] || '18';
                            
                            return (
                              <div key={index} className="space-y-1 text-center">
                                <div className="flex items-center justify-center space-x-1 text-xs">
                                  <UserIcon className="w-3 h-3 text-golf-green" />
                                  <span className="text-foreground font-medium">
                                    {member?.firstName} {member?.lastName}
                                  </span>
                                  <span className="text-xs text-muted-foreground capitalize px-1 py-0.5 bg-gray-100 rounded">
                                    {playerType}
                                  </span>
                                </div>
                                <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Car className="w-3 h-3" />
                                    <span className="capitalize">{transportMode}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    <span>{holesPlaying} holes</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
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
        ) : (
          /* List View */
          <div className="space-y-3">
            {sortTimesProperly(availableTeetimes)
              .map((teetime) => {
              const statusInfo = getStatusInfo(teetime);
              const bookedMembers = teetime.bookedBy?.map(userId => getMemberDetails(userId)).filter(Boolean) || [];

              return (
                <Card key={teetime.id} className="border-0 shadow-sm bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      {/* Left side - Time and Status */}
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-golf-green rounded-full flex items-center justify-center">
                            <Clock className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <p className="font-bold text-xl text-foreground">{formatTime(teetime.time)}</p>
                            <p className="text-sm text-muted-foreground">Tee Time Slot</p>
                          </div>
                        </div>
                        
                        <Badge className={`${statusInfo.color} border text-sm px-3 py-1`}>
                          {statusInfo.text}
                        </Badge>
                      </div>
                      
                      {/* Middle - Player Details */}
                      <div className="flex-1 mx-8">
                        {bookedMembers.length > 0 ? (
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">Booked Players:</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {bookedMembers.map((member, index) => {
                                const playerType = teetime.playerTypes?.[index] || 'member';
                                const transportMode = teetime.transportModes?.[index] || 'riding';
                                const holesPlaying = teetime.holesPlaying?.[index] || '18';
                                
                                return (
                                  <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                                    <UserCheck className="w-4 h-4 text-golf-green" />
                                    <div className="flex-1">
                                      <p className="text-sm font-medium text-foreground">
                                        {member?.firstName} {member?.lastName}
                                      </p>
                                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                        <span className="capitalize bg-gray-200 px-2 py-0.5 rounded">
                                          {playerType}
                                        </span>
                                        <div className="flex items-center gap-1">
                                          <Car className="w-3 h-3" />
                                          <span className="capitalize">{transportMode}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <MapPin className="w-3 h-3" />
                                          <span>{holesPlaying} holes</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center text-muted-foreground italic">
                            <p>No bookings yet</p>
                            <p className="text-xs">Available for booking</p>
                          </div>
                        )}
                      </div>
                      
                      {/* Right side - Course Info and Stats */}
                      <div className="text-right">
                        <div className="space-y-2">
                          <p className="text-lg font-semibold text-blue-600">
                            {statusInfo.players} Players
                          </p>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>{teetime.holes} Holes • ${teetime.price}</p>
                            <p>Packanack Golf Course</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {teetimes.length === 0 && (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-12 text-center">
              <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Tee Times Available</h3>
              <p className="text-muted-foreground">There are no tee times scheduled for this date.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
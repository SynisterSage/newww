import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Users, MapPin, DollarSign, Clock, Trophy, Check, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { Event, User } from "@shared/schema";

interface EventWithRegistration extends Event {
  isRegistered?: boolean;
  registrationCount?: number;
}

interface EventsProps {
  userData?: User;
}

export default function Events({ userData }: EventsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [filter, setFilter] = useState<string>("all");

  // Get current user from props
  const currentUserId = userData?.id;
  const isAuthenticated = !!userData;

  // Fetch events with user registration status
  const { data: events = [], isLoading } = useQuery({
    queryKey: ["/api/events", currentUserId],
    queryFn: async () => {
      const url = currentUserId ? `/api/events?userId=${currentUserId}` : "/api/events";
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch events");
      return response.json();
    }
  }) as { data: EventWithRegistration[], isLoading: boolean };

  // Register for event mutation
  const registerMutation = useMutation({
    mutationFn: async ({ eventId, notes }: { eventId: string; notes?: string }) => {
      return await apiRequest("POST", `/api/events/${eventId}/register`, { userId: currentUserId, notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events", currentUserId] });
      setIsRegisterDialogOpen(false);
      setSelectedEvent(null);
      toast({
        title: "Registration Successful",
        description: "You have been registered for the event",
      });
    },
    onError: (error) => {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Unregister from event mutation
  const unregisterMutation = useMutation({
    mutationFn: async (eventId: string) => {
      return await apiRequest("DELETE", `/api/events/${eventId}/register/${currentUserId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events", currentUserId] });
      toast({
        title: "Unregistered Successfully",
        description: "You have been removed from the event",
      });
    },
    onError: (error) => {
      toast({
        title: "Unregistration Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleRegister = (event: Event) => {
    if (!isAuthenticated || !currentUserId) {
      toast({
        title: "Authentication Required", 
        description: "Please log in to register for events",
        variant: "destructive",
      });
      return;
    }
    setSelectedEvent(event);
    setIsRegisterDialogOpen(true);
  };

  const handleUnregister = (eventId: string) => {
    if (confirm("Are you sure you want to unregister from this event?")) {
      unregisterMutation.mutate(eventId);
    }
  };

  const submitRegistration = (formData: FormData) => {
    if (!selectedEvent) return;
    
    const notes = formData.get("notes") as string;
    registerMutation.mutate({
      eventId: selectedEvent.id,
      notes: notes || undefined,
    });
  };

  const formatDate = (dateStr: string) => {
    // Parse date as local date to avoid timezone issues
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString(navigator.language || 'en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      tournament: "bg-red-100 text-red-700 border-red-200",
      social: "bg-blue-100 text-blue-700 border-blue-200",
      lesson: "bg-green-100 text-green-700 border-green-200",
      special: "bg-purple-100 text-purple-700 border-purple-200",
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const isEventFull = (event: EventWithRegistration) => {
    return (event.registrationCount || 0) >= event.maxSignups;
  };

  const isEventPast = (event: Event) => {
    const eventDate = new Date(`${event.date}T${event.time}`);
    return eventDate < new Date();
  };

  const filteredEvents = events.filter(event => {
    if (filter === "all") return true;
    if (filter === "upcoming") return !isEventPast(event);
    if (filter === "registered") return event.isRegistered;
    if (filter === "available") return !isEventFull(event) && !isEventPast(event);
    return event.category === filter;
  });

  const categories = ["all", "upcoming", "registered", "available", "tournament", "social", "lesson"];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F6F0] p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-muted rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F6F0] p-6 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-[#08452e]">Club Events</h1>
          <p className="text-muted-foreground">Discover and register for upcoming club events and activities</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                filter === cat
                  ? "bg-[#08452e] text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              {cat === "all" ? "All Events" : cat.replace(/([A-Z])/g, ' $1').trim()}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => {
          const isFull = isEventFull(event);
          const isPast = isEventPast(event);
          const canRegister = !isFull && !isPast && !event.isRegistered;
          
          return (
            <Card key={event.id} className="border border-gray-200 hover:shadow-md transition-shadow relative">
              {event.isRegistered && (
                <div className="absolute top-3 right-3 z-10">
                  <Badge className="bg-green-100 text-green-700 border-green-200">
                    <Check className="w-3 h-3 mr-1" />
                    Registered
                  </Badge>
                </div>
              )}
              
              {isFull && !event.isRegistered && (
                <div className="absolute top-3 right-3 z-10">
                  <Badge className="bg-red-100 text-red-700 border-red-200">
                    <X className="w-3 h-3 mr-1" />
                    Full
                  </Badge>
                </div>
              )}

              <CardHeader className="pb-3">
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg font-semibold text-[#08452e] line-clamp-2 pr-16">
                      {event.title}
                    </CardTitle>
                  </div>
                  <Badge className={`${getCategoryColor(event.category)} text-xs w-fit`}>
                    {event.category}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {event.description}
                </p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#08452e]" />
                    <span>{formatDate(event.date)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#08452e]" />
                    <span>{formatTime(event.time)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#08452e]" />
                    <span className="line-clamp-1">{event.location}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#08452e]" />
                    <span>{(event as EventWithRegistration).registrationCount || 0}/{event.maxSignups} registered</span>
                  </div>
                  
                  {event.price && parseFloat(event.price) > 0 && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-[#08452e]" />
                      <span className="font-semibold">${event.price}</span>
                    </div>
                  )}
                </div>
                
                <div className="pt-2 flex gap-2">
                  {event.isRegistered ? (
                    <Button
                      variant="outline"
                      onClick={() => handleUnregister(event.id)}
                      className="flex-1 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                      disabled={unregisterMutation.isPending}
                    >
                      {unregisterMutation.isPending ? "Unregistering..." : "Unregister"}
                    </Button>
                  ) : canRegister ? (
                    <Button
                      onClick={() => handleRegister(event)}
                      className="flex-1 bg-[#08452e] hover:bg-[#08452e]/90"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? "Registering..." : "Register"}
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      disabled
                      className="flex-1"
                    >
                      {isFull ? "Event Full" : isPast ? "Event Ended" : "Unavailable"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">No Events Found</h3>
          <p className="text-muted-foreground">
            {filter === "all" 
              ? "No events are currently available" 
              : `No events match the "${filter}" filter`}
          </p>
        </div>
      )}

      {/* Registration Dialog */}
      <Dialog open={isRegisterDialogOpen} onOpenChange={setIsRegisterDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Register for Event</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-[#08452e]">{selectedEvent.title}</h4>
                <p className="text-sm text-muted-foreground">
                  {formatDate(selectedEvent.date)} at {formatTime(selectedEvent.time)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedEvent.location}
                </p>
                {selectedEvent.price && parseFloat(selectedEvent.price) > 0 && (
                  <p className="text-sm font-semibold">
                    Price: ${selectedEvent.price}
                  </p>
                )}
              </div>
              
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  submitRegistration(formData);
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="notes">Special Notes (Optional)</Label>
                  <Textarea 
                    id="notes" 
                    name="notes" 
                    placeholder="Any dietary restrictions, accessibility needs, or other notes..."
                    rows={3}
                  />
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsRegisterDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={registerMutation.isPending}
                    className="bg-[#08452e] hover:bg-[#08452e]/90"
                  >
                    {registerMutation.isPending ? "Registering..." : "Confirm Registration"}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
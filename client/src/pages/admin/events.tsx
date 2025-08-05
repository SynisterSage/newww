import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Users, Plus, Edit, Trash2, Eye, DollarSign, MapPin, Clock } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { Event, InsertEvent } from "@shared/schema";

interface EventWithRegistrations extends Event {
  registrationCount?: number;
}

interface EventRegistration {
  id: string;
  eventId: string;
  userId: string;
  registeredAt: string;
  notes?: string;
  status: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    memberNumber: string;
  };
}

export default function AdminEvents() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isRegistrationsDialogOpen, setIsRegistrationsDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedEventRegistrations, setSelectedEventRegistrations] = useState<EventRegistration[]>([]);

  // No automatic refresh - only refresh on mutations

  // Fetch events - NO auto-refresh to avoid closing dialog popups
  const { data: allEvents = [], isLoading } = useQuery({
    queryKey: ["/api/events/all"],
    queryFn: async () => {
      const response = await fetch("/api/events/all");
      if (!response.ok) throw new Error("Failed to fetch events");
      return response.json();
    },
    // Only refresh on mount and focus - no intervals to avoid closing dialogs
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 30000, // Cache for 30 seconds
  }) as { data: EventWithRegistrations[], isLoading: boolean };

  // Filter out ended events from display
  const events = allEvents.filter(event => {
    const eventDateTime = new Date(`${event.date}T${event.time}`);
    return eventDateTime >= new Date();
  });

  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: async (eventData: InsertEvent) => {
      return await apiRequest("POST", "/api/events", eventData);
    },
    onSuccess: async () => {
      // Comprehensive cache invalidation for real-time updates across all pages
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["/api/events"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/events/all"] }),
        queryClient.refetchQueries({ queryKey: ["/api/events"] }),
        queryClient.refetchQueries({ queryKey: ["/api/events/all"] }),
        // Also invalidate member queries to ensure immediate sync
        queryClient.invalidateQueries({ predicate: (query) => 
          Array.isArray(query.queryKey) && query.queryKey[0] === "/api/events"
        }),
      ]);
      queryClient.invalidateQueries({ predicate: (query) => 
        Array.isArray(query.queryKey) && query.queryKey[0] === "/api/events"
      });
      setIsCreateDialogOpen(false);
      toast({
        title: "Success",
        description: "Event created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create event: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update event mutation
  const updateEventMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Event> }) => {
      return await apiRequest("PATCH", `/api/events/${id}`, updates);
    },
    onSuccess: async () => {
      // Comprehensive cache invalidation for real-time updates across all pages
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["/api/events"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/events/all"] }),
        queryClient.refetchQueries({ queryKey: ["/api/events"] }),
        queryClient.refetchQueries({ queryKey: ["/api/events/all"] }),
        // Also invalidate member queries to ensure immediate sync
        queryClient.invalidateQueries({ predicate: (query) => 
          Array.isArray(query.queryKey) && query.queryKey[0] === "/api/events"
        }),
      ]);
      
      setIsEditDialogOpen(false);
      setSelectedEvent(null);
      toast({
        title: "Success",
        description: "Event updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update event: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete event mutation
  const deleteEventMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/events/${id}`);
    },
    onSuccess: async () => {
      // Comprehensive cache invalidation for real-time updates across all pages
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["/api/events"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/events/all"] }),
        queryClient.refetchQueries({ queryKey: ["/api/events"] }),
        queryClient.refetchQueries({ queryKey: ["/api/events/all"] }),
        // Also invalidate member queries to ensure immediate sync
        queryClient.invalidateQueries({ predicate: (query) => 
          Array.isArray(query.queryKey) && query.queryKey[0] === "/api/events"
        }),
      ]);
      
      toast({
        title: "Success",
        description: "Event deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete event: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Fetch event registrations
  const fetchRegistrations = async (eventId: string) => {
    try {
      const response = await apiRequest("GET", `/api/events/${eventId}/registrations`);
      const registrations = await response.json();
      setSelectedEventRegistrations(registrations);
      setIsRegistrationsDialogOpen(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch registrations",
        variant: "destructive",
      });
    }
  };

  const handleCreateEvent = (formData: FormData) => {
    const eventData: InsertEvent = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      date: formData.get("date") as string,
      time: formData.get("time") as string,
      location: formData.get("location") as string || "Packanack Golf Club",
      maxSignups: parseInt(formData.get("maxSignups") as string) || 50,
      price: formData.get("price") as string || "0.00",
      category: formData.get("category") as string,
      createdBy: "Admin", // In a real app, this would be the logged-in admin's name
    };

    createEventMutation.mutate(eventData);
  };

  const handleUpdateEvent = (formData: FormData) => {
    if (!selectedEvent) return;

    const updates = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      date: formData.get("date") as string,
      time: formData.get("time") as string,
      location: formData.get("location") as string,
      maxSignups: parseInt(formData.get("maxSignups") as string),
      price: formData.get("price") as string,
      category: formData.get("category") as string,
    };

    updateEventMutation.mutate({ id: selectedEvent.id, updates });
  };

  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event);
    setIsEditDialogOpen(true);
  };

  const handleDeleteEvent = (eventId: string) => {
    if (confirm("Are you sure you want to delete this event?")) {
      deleteEventMutation.mutate(eventId);
    }
  };

  const formatDate = (dateStr: string) => {
    // Parse date as local date to avoid timezone issues
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString(navigator.language || 'en-US', { 
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F6F0] p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 bg-muted rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F6F0] p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-blue-800">Event Management</h1>
          <p className="text-muted-foreground">Create and manage club events and view member registrations</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleCreateEvent(formData);
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="title">Event Title</Label>
                <Input id="title" name="title" placeholder="Annual Golf Tournament" required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" placeholder="Event description..." required />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" name="date" type="date" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input id="time" name="time" type="time" required />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" name="location" defaultValue="Packanack Golf Club" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxSignups">Max Signups</Label>
                  <Input id="maxSignups" name="maxSignups" type="number" defaultValue="50" min="1" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input id="price" name="price" type="number" step="0.01" defaultValue="0.00" min="0" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select name="category" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tournament">Tournament</SelectItem>
                    <SelectItem value="social">Social Event</SelectItem>
                    <SelectItem value="lesson">Lesson</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createEventMutation.isPending}>
                  {createEventMutation.isPending ? "Creating..." : "Create Event"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((event) => (
          <Card key={event.id} className="border border-gray-200 hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg font-semibold text-[#08452e] line-clamp-2">
                    {event.title}
                  </CardTitle>
                  <Badge className={`${getCategoryColor(event.category)} text-xs`}>
                    {event.category}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-3">
                {event.description}
              </p>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#08452e]" />
                  <span>{formatDate(event.date)} at {formatTime(event.time)}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#08452e]" />
                  <span>{event.location}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#08452e]" />
                  <span>{(event as any).registrationCount || 0}/{event.maxSignups} registered</span>
                </div>
                
                {event.price && parseFloat(event.price) > 0 && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-[#08452e]" />
                    <span>${event.price}</span>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => fetchRegistrations(event.id)}
                  className="w-full"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View Registrations
                </Button>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditEvent(event)}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteEvent(event.id)}
                    className="flex-1 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {events.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">No Events Created</h3>
          <p className="text-muted-foreground mb-4">Create your first event to get started</p>
        </div>
      )}

      {/* Edit Event Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleUpdateEvent(formData);
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="edit-title">Event Title</Label>
                <Input id="edit-title" name="title" defaultValue={selectedEvent.title} required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea id="edit-description" name="description" defaultValue={selectedEvent.description} required />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-date">Date</Label>
                  <Input id="edit-date" name="date" type="date" defaultValue={selectedEvent.date} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-time">Time</Label>
                  <Input id="edit-time" name="time" type="time" defaultValue={selectedEvent.time} required />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-location">Location</Label>
                <Input id="edit-location" name="location" defaultValue={selectedEvent.location} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-maxSignups">Max Signups</Label>
                  <Input id="edit-maxSignups" name="maxSignups" type="number" defaultValue={selectedEvent.maxSignups} min="1" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-price">Price ($)</Label>
                  <Input id="edit-price" name="price" type="number" step="0.01" defaultValue={selectedEvent.price || "0.00"} min="0" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select name="category" defaultValue={selectedEvent.category} required>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tournament">Tournament</SelectItem>
                    <SelectItem value="social">Social Event</SelectItem>
                    <SelectItem value="lesson">Lesson</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateEventMutation.isPending}>
                  {updateEventMutation.isPending ? "Updating..." : "Update Event"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Event Registrations Dialog */}
      <Dialog open={isRegistrationsDialogOpen} onOpenChange={setIsRegistrationsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Event Registrations</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedEventRegistrations.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground mb-2">No Registrations Yet</h3>
                <p className="text-muted-foreground">No members have signed up for this event</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  {selectedEventRegistrations.length} member{selectedEventRegistrations.length !== 1 ? 's' : ''} registered
                </div>
                
                {selectedEventRegistrations.map((registration) => (
                  <Card key={registration.id} className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-[#08452e]">
                            {registration.user?.firstName} {registration.user?.lastName}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Member #{registration.user?.memberNumber}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {registration.user?.email}
                          </p>
                          {registration.notes && (
                            <p className="text-sm text-muted-foreground mt-1">
                              <span className="font-medium">Notes:</span> {registration.notes}
                            </p>
                          )}
                        </div>
                        
                        <div className="text-right">
                          <Badge className="bg-green-100 text-green-700 border-green-200">
                            {registration.status}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            Registered {new Date(registration.registeredAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
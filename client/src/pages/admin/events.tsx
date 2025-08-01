import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy, Calendar, Users, MapPin, CheckCircle, XCircle, AlertCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  maxParticipants: number;
  currentParticipants: number;
  registrations: EventRegistration[];
  status: string;
  entryFee?: string;
  prizes?: string;
  createdAt: string;
}

interface EventRegistration {
  id: string;
  memberName: string;
  memberEmail: string;
  registrationDate: string;
  status: string;
  notes?: string;
}

export default function AdminEventsPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: ["/api", "admin", "events"],
    enabled: true,
  });

  const updateEventMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Event> }) => {
      const response = await apiRequest("PATCH", `/api/admin/events/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api", "admin", "events"] });
    },
  });

  const updateRegistrationMutation = useMutation({
    mutationFn: async ({ eventId, registrationId, status }: { eventId: string; registrationId: string; status: string }) => {
      const response = await apiRequest("PATCH", `/api/admin/events/${eventId}/registrations/${registrationId}`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api", "admin", "events"] });
    },
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      upcoming: { color: "bg-blue-100 text-blue-800", icon: Calendar },
      ongoing: { color: "bg-green-100 text-green-800", icon: AlertCircle },
      completed: { color: "bg-gray-100 text-gray-800", icon: CheckCircle },
      cancelled: { color: "bg-red-100 text-red-800", icon: XCircle },
      full: { color: "bg-orange-100 text-orange-800", icon: Users },
    };
    
    const variant = variants[status as keyof typeof variants] || variants.upcoming;
    const Icon = variant.icon;
    
    return (
      <Badge className={`${variant.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getRegistrationStatusBadge = (status: string) => {
    const variants = {
      registered: { color: "bg-blue-100 text-blue-800" },
      confirmed: { color: "bg-green-100 text-green-800" },
      waitlist: { color: "bg-yellow-100 text-yellow-800" },
      cancelled: { color: "bg-red-100 text-red-800" },
    };
    
    const variant = variants[status as keyof typeof variants] || variants.registered;
    
    return (
      <Badge className={`${variant.color} text-xs`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const filteredEvents = events.filter((event: Event) => {
    const matchesStatus = statusFilter === "all" || event.status === statusFilter;
    const matchesSearch = 
      event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-golf-green">Event Management</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by event title, description, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="ongoing">Ongoing</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="full">Full</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Events Grid */}
      <div className="grid gap-6">
        {filteredEvents.map((event: Event) => (
          <Card key={event.id} className="border border-gray-200 hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl text-golf-green">{event.title}</CardTitle>
                {getStatusBadge(event.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">{event.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-golf-green" />
                  <span>{format(new Date(event.date), "MMM dd, yyyy")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-golf-green" />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-golf-green" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-golf-green" />
                  <span>{event.currentParticipants}/{event.maxParticipants}</span>
                </div>
              </div>

              {(event.entryFee || event.prizes) && (
                <div className="flex gap-4 text-sm">
                  {event.entryFee && (
                    <span><strong>Entry Fee:</strong> ${event.entryFee}</span>
                  )}
                  {event.prizes && (
                    <span><strong>Prizes:</strong> {event.prizes}</span>
                  )}
                </div>
              )}

              {/* Event Status Actions */}
              <div className="flex gap-2">
                <Select
                  value={event.status}
                  onValueChange={(newStatus) => 
                    updateEventMutation.mutate({ 
                      id: event.id, 
                      updates: { status: newStatus }
                    })
                  }
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="full">Full</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Registrations */}
              {event.registrations && event.registrations.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-3">
                    Registrations ({event.registrations.length})
                  </h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {event.registrations.map((registration: EventRegistration) => (
                      <div key={registration.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <span className="font-medium">{registration.memberName}</span>
                            <span className="text-sm text-gray-600">{registration.memberEmail}</span>
                            {getRegistrationStatusBadge(registration.status)}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Registered: {format(new Date(registration.registrationDate), "MMM dd, h:mm a")}
                          </div>
                          {registration.notes && (
                            <div className="text-xs text-gray-600 mt-1">{registration.notes}</div>
                          )}
                        </div>
                        
                        <div className="flex gap-1">
                          {registration.status === "registered" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateRegistrationMutation.mutate({ 
                                  eventId: event.id, 
                                  registrationId: registration.id, 
                                  status: "confirmed" 
                                })}
                                disabled={updateRegistrationMutation.isPending}
                                className="text-green-600 border-green-200 hover:bg-green-50 text-xs px-2 py-1"
                              >
                                Confirm
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateRegistrationMutation.mutate({ 
                                  eventId: event.id, 
                                  registrationId: registration.id, 
                                  status: "cancelled" 
                                })}
                                disabled={updateRegistrationMutation.isPending}
                                className="text-red-600 border-red-200 hover:bg-red-50 text-xs px-2 py-1"
                              >
                                Cancel
                              </Button>
                            </>
                          )}
                          
                          {registration.status === "confirmed" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateRegistrationMutation.mutate({ 
                                eventId: event.id, 
                                registrationId: registration.id, 
                                status: "cancelled" 
                              })}
                              disabled={updateRegistrationMutation.isPending}
                              className="text-red-600 border-red-200 hover:bg-red-50 text-xs px-2 py-1"
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Trophy className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-500">
              {searchQuery || statusFilter !== "all" 
                ? "Try adjusting your search or filter criteria"
                : "No events available"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
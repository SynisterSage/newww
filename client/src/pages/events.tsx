import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, ChevronRight } from "lucide-react";
import { format } from "date-fns";

interface Event {
  id: string;
  title: string;
  date: Date;
  time: string;
  type: "tournament" | "social" | "lesson" | "special";
  participants: number;
  maxParticipants?: number;
  location: string;
  description: string;
  registrationOpen: boolean;
}

export default function Events() {
  const { toast } = useToast();
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  
  const events: Event[] = [
    {
      id: "1",
      title: "The President's Cup",
      date: new Date("2025-03-15"),
      time: "4:00 AM",
      type: "tournament",
      participants: 16,
      maxParticipants: 32,
      location: "Championship Course",
      description: "A two-day stroke play tournament to kick off the season. All members are welcome to...",
      registrationOpen: true
    },
    {
      id: "2",
      title: "Couples' Scramble & Dine",
      date: new Date("2025-03-22"),
      time: "11:00 AM",
      type: "social",
      participants: 8,
      maxParticipants: 20,
      location: "Championship Course",
      description: "A fun, relaxed 9-hole scramble followed by a gourmet dinner at the clubhouse.",
      registrationOpen: true
    },
    {
      id: "3",
      title: "Junior Golf Clinic",
      date: new Date("2025-04-05"),
      time: "5:00 AM",
      type: "lesson",
      participants: 12,
      maxParticipants: 16,
      location: "Practice Range",
      description: "A weekend clinic for young golfers aged 8-16 to learn the fundamentals from our club...",
      registrationOpen: true
    }
  ];

  const getEventTypeDisplay = (type: Event["type"]) => {
    switch (type) {
      case "tournament":
        return { label: "Stroke Play", color: "bg-blue-100 text-blue-800" };
      case "social":
        return { label: "Scramble", color: "bg-green-100 text-green-800" };
      case "lesson":
        return { label: "Clinic", color: "bg-purple-100 text-purple-800" };
      case "special":
        return { label: "Special", color: "bg-orange-100 text-orange-800" };
      default:
        return { label: "Event", color: "bg-gray-100 text-gray-800" };
    }
  };

  const handleSignUp = (event: Event) => {
    toast({
      title: "Event Registration Successful!",
      description: `You've successfully registered for ${event.title}. We'll send you a confirmation email shortly.`,
    });
    setExpandedEvent(null);
  };

  const toggleEventDetails = (eventId: string) => {
    setExpandedEvent(expandedEvent === eventId ? null : eventId);
  };

  return (
    <div className="min-h-screen bg-[#F8F6F0]">
      <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#08452e] mb-2">Club Events</h1>
        <p className="text-muted-foreground">
          Tournaments, social events, and special activities
        </p>
      </div>

      {/* Upcoming Events */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => {
          const eventType = getEventTypeDisplay(event.type);
          const isExpanded = expandedEvent === event.id;
          
          return (
            <Card key={event.id} className="hover:shadow-lg transition-all duration-300 border-0 shadow-sm bg-white h-fit">
              <CardContent className="p-6">
                {/* Header with Status and Badge */}
                <div className="flex items-center justify-between mb-6">
                  <span className="text-sm text-muted-foreground">Past</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${eventType.color}`}>
                    {eventType.label}
                  </span>
                </div>
                
                {/* Event Title */}
                <h3 className="text-xl font-semibold text-[#08452e] mb-6 leading-tight">{event.title}</h3>
                
                {/* Date and Time */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    <span>{format(event.date, 'EEEE, MMM dd, yyyy')}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 flex-shrink-0" />
                    <span>{event.time}</span>
                  </div>
                </div>
                
                {/* Description */}
                <div className="mb-6">
                  <p className="text-sm text-muted-foreground leading-relaxed min-h-[3rem]">
                    {isExpanded ? event.description : `${event.description.substring(0, 75)}...`}
                  </p>
                </div>
                
                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Location:</span>
                        <span className="text-foreground font-medium">{event.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Registration:</span>
                        <span className={`font-medium ${event.registrationOpen ? 'text-green-600' : 'text-red-600'}`}>
                          {event.registrationOpen ? 'Open' : 'Closed'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Participant Progress Bar - Fixed Height */}
                <div className="mb-6 h-16">
                  <div className="flex items-center justify-between text-sm mb-3">
                    <span className="text-muted-foreground">Participants</span>
                    <span className="font-semibold text-foreground">{event.participants} / {event.maxParticipants}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-[#1B4332] h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${(event.participants / event.maxParticipants!) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
                
                {/* Action Buttons - Fixed Height */}
                <div className="h-10">
                  {!isExpanded ? (
                    <Button 
                      variant="outline" 
                      className="w-full h-10 justify-between border-[#1B4332] text-[#1B4332] hover:bg-[#1B4332] hover:text-white transition-colors"
                      onClick={() => toggleEventDetails(event.id)}
                    >
                      <span>View Details</span>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button 
                      className="w-full h-10 bg-[#1B4332] hover:bg-[#2D5A3D] text-white transition-colors"
                      onClick={() => handleSignUp(event)}
                      disabled={!event.registrationOpen}
                    >
                      {event.registrationOpen ? 'Sign Up for Event' : 'Registration Closed'}
                    </Button>
                  )}
                </div>
                
                {/* Hide Details Button (when expanded) */}
                {isExpanded && (
                  <div className="mt-3">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="w-full text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => toggleEventDetails(event.id)}
                    >
                      Hide Details
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
      </div>
    </div>
  );
}
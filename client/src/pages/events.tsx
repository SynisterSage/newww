import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, ChevronRight, Users, MapPin } from "lucide-react";
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
  const [registeredEvents, setRegisteredEvents] = useState<Set<string>>(new Set());
  const [openModal, setOpenModal] = useState<string | null>(null);
  
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
      description: "A weekend clinic for young golfers aged 8-16 to learn the funA weekend clinic for young golfers aged 8-16 to learn the fundamentals from our club..damentals from our club..A weekend clinic for young golfers aged 8-16 to learn the fundamentals from our club..",
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
    setRegisteredEvents(prev => new Set(Array.from(prev).concat([event.id])));
    setOpenModal(null); // Close the modal
    toast({
      title: "Event Registration Successful!",
      description: `You've successfully registered for ${event.title}. We'll send you a confirmation email shortly.`,
    });
  };

  const handleWithdrawal = (event: Event) => {
    setRegisteredEvents(prev => {
      const newSet = new Set(prev);
      newSet.delete(event.id);
      return newSet;
    });
    setOpenModal(null);
    toast({
      title: "Withdrawal Successful",
      description: `You've been withdrawn from ${event.title}.`,
    });
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
          const isRegistered = registeredEvents.has(event.id);
          
          return (
            <Card key={event.id} className={`hover:shadow-lg transition-all duration-300 border-0 shadow-sm bg-white flex flex-col ${isRegistered ? 'h-[480px]' : 'h-[420px]'}`}>
              <CardContent className="p-6 flex flex-col h-full">
                {/* Header with Status and Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-muted-foreground">Past</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${eventType.color}`}>
                    {eventType.label}
                  </span>
                </div>
                
                {/* Event Title - Fixed Height */}
                <div className="h-14 mb-4">
                  <h3 className="text-xl font-semibold text-[#08452e] leading-tight line-clamp-2">{event.title}</h3>
                </div>
                
                {/* Date and Time - Fixed Height */}
                <div className="h-12 mb-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      <span>{format(event.date, 'EEEE, MMM dd, yyyy')}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4 flex-shrink-0" />
                      <span>{event.time}</span>
                    </div>
                  </div>
                </div>
                
                {/* Description - Fixed Height */}
                <div className="h-16 mb-6">
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                    {event.description}
                  </p>
                </div>
                
                {/* Participant Progress Bar - Fixed Height */}
                <div className={`h-12 ${isRegistered ? 'mb-8' : 'mb-6'}`}>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Participants</span>
                    <span className="font-semibold text-foreground">{event.participants} / {event.maxParticipants}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-[#1B4332] h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${(event.participants / (event.maxParticipants || 1)) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
                
                {/* Action Buttons - Fixed at bottom with consistent height */}
                <div className="mt-auto">
                  <div className={`flex flex-col justify-end space-y-2 ${isRegistered ? 'h-[60px]' : 'h-[40px]'}`}>
                    {!isRegistered ? (
                      <Dialog open={openModal === event.id} onOpenChange={(open) => setOpenModal(open ? event.id : null)}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline"
                            className="w-full h-10 justify-between border-[#1B4332] text-[#1B4332] hover:bg-[#1B4332] hover:text-white transition-colors"
                          >
                            <span>View Details</span>
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                    
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <div className="flex items-center justify-between mt-[14px] mb-[14px]">
                          <span className="text-sm text-muted-foreground">Past</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${eventType.color}`}>
                            {eventType.label}
                          </span>
                        </div>
                        <DialogTitle className="text-2xl text-[#08452e] text-left mt-[5px] mb-[5px]">{event.title}</DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground">
                          View complete event details and register for this {getEventTypeDisplay(event.type).label.toLowerCase()} event.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-6">
                        {/* Event Details */}
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3 text-sm">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="text-foreground">{format(event.date, 'EEEE, MMM dd, yyyy')}</span>
                          </div>
                          <div className="flex items-center space-x-3 text-sm">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span className="text-foreground">{event.time}</span>
                          </div>
                          <div className="flex items-center space-x-3 text-sm">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span className="text-foreground">{event.location}</span>
                          </div>
                        </div>
                        
                        {/* Full Description */}
                        <div>
                          <h4 className="text-sm font-medium text-foreground mb-2">Event Description</h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {event.description}
                          </p>
                        </div>
                        
                        {/* Participants Section */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <Users className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm font-medium">Participants</span>
                            </div>
                            <span className="text-sm font-semibold">{event.participants} / {event.maxParticipants}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                            <div 
                              className="bg-[#1B4332] h-2 rounded-full transition-all duration-500"
                              style={{ 
                                width: `${(event.participants / (event.maxParticipants || 1)) * 100}%` 
                              }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Registration: {event.registrationOpen ? 'Open' : 'Closed'}</span>
                            <span>{event.maxParticipants - event.participants} spots remaining</span>
                          </div>
                        </div>
                        
                        {/* Sign Up Button */}
                        {!isRegistered && (
                          <Button 
                            className="w-full h-12 bg-[#1B4332] hover:bg-[#2D5A3D] text-white font-medium"
                            onClick={() => handleSignUp(event)}
                            disabled={!event.registrationOpen}
                          >
                            {event.registrationOpen ? 'Sign Up for Event' : 'Registration Closed'}
                          </Button>
                        )}
                        
                        {isRegistered && (
                          <div className="space-y-4">
                            <div className="text-center py-4">
                              <div className="inline-flex items-center space-x-2 text-[#1B4332]">
                                <div className="w-5 h-5 bg-[#1B4332] rounded-full flex items-center justify-center flex-shrink-0">
                                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </div>
                                <span className="font-medium">You're registered for this event!</span>
                              </div>
                            </div>
                            
                            <Button 
                              variant="outline"
                              className="w-full h-10 border-red-500 text-red-600 hover:bg-red-50 hover:border-red-600 hover:text-red-700 transition-all duration-200"
                              onClick={() => handleWithdrawal(event)}
                            >
                              Withdraw
                            </Button>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                    ) : (
                      <div className="space-y-2 mt-[15px] mb-[15px]">
                        <Button 
                          variant="default"
                          className="w-full h-10 bg-[#1B4332] hover:bg-[#1B4332] text-white border-[#1B4332] cursor-default"
                          disabled
                          style={{ opacity: 1 }}
                        >
                          <span>Registered</span>
                        </Button>
                        <Button 
                          variant="outline"
                          className="w-full h-8 border-red-500 text-red-600 hover:bg-red-50 hover:border-red-600 hover:text-red-700 text-sm transition-all duration-200"
                          onClick={() => handleWithdrawal(event)}
                        >
                          Withdraw
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      </div>
    </div>
  );
}
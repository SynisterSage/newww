import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, Clock, Users, MapPin, Trophy, ArrowRight } from "lucide-react";

interface Event {
  id: string;
  title: string;
  type: "stroke-play" | "scramble" | "clinic" | "tournament";
  date: string;
  time: string;
  description: string;
  fullDescription: string;
  status: "upcoming" | "past";
  maxParticipants?: number;
  currentParticipants?: number;
  location: string;
  format: string;
  prizes?: string[];
}

export default function Events() {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Mock data for events
  const events: Event[] = [
    {
      id: "1",
      title: "The President's Cup",
      type: "stroke-play",
      date: "Saturday, Mar 15, 2025",
      time: "4:00 AM",
      description: "A two-day stroke play tournament to kick off the season. All...",
      fullDescription: "A two-day stroke play tournament to kick off the season. All skill levels welcome. This prestigious event features 36 holes of championship golf across our championship course. Players will compete in flights based on handicap for fair competition. Registration includes continental breakfast, lunch, and awards ceremony.",
      status: "upcoming",
      maxParticipants: 144,
      currentParticipants: 67,
      location: "Championship Course",
      format: "36-hole stroke play",
      prizes: ["Champion Trophy", "$500 Pro Shop Credit", "Tournament Plaque"]
    },
    {
      id: "2",
      title: "Couples' Scramble & Dine",
      type: "scramble", 
      date: "Saturday, Mar 22, 2025",
      time: "11:00 AM",
      description: "A fun, relaxed 9-hole scramble followed by a gourmet dinner at...",
      fullDescription: "A fun, relaxed 9-hole scramble followed by a gourmet dinner at the clubhouse. Perfect for couples of all skill levels. Each team consists of one couple playing a best ball scramble format. The evening concludes with a three-course dinner prepared by our executive chef featuring locally sourced ingredients.",
      status: "upcoming",
      maxParticipants: 40,
      currentParticipants: 28,
      location: "Executive Course & Clubhouse",
      format: "9-hole couples scramble",
      prizes: ["Dinner for Winners", "Golf Accessories", "Club Gift Cards"]
    },
    {
      id: "3",
      title: "Junior Golf Clinic",
      type: "clinic",
      date: "Saturday, Apr 5, 2025", 
      time: "5:00 AM",
      description: "A weekend clinic for young golfers aged 8-16 to learn the...",
      fullDescription: "A weekend clinic for young golfers aged 8-16 to learn the fundamentals of golf. Our PGA professional instructors will cover grip, stance, swing basics, and course etiquette. All equipment provided. Parents are welcome to observe. Each participant receives a junior golf set to take home.",
      status: "upcoming",
      maxParticipants: 24,
      currentParticipants: 12,
      location: "Practice Range & Short Course",
      format: "Two-day instructional clinic",
      prizes: ["Junior Golf Set", "Certificate of Completion", "Free Practice Range Access"]
    },
    {
      id: "4",
      title: "Member-Guest Championship",
      type: "tournament",
      date: "Saturday, Feb 15, 2025",
      time: "8:00 AM",
      description: "Annual member-guest tournament featuring team competition...",
      fullDescription: "Annual member-guest tournament featuring team competition over two days. Members invite their favorite playing partner for this competitive yet social event. Format includes both better ball and alternate shot rounds. Includes welcome reception, daily lunch, and championship dinner.",
      status: "past",
      maxParticipants: 80,
      currentParticipants: 80,
      location: "Championship Course",
      format: "36-hole team competition",
      prizes: ["Championship Trophy", "Engraved Crystal Awards", "Golf Travel Bag"]
    }
  ];

  const getEventBadgeColor = (type: string) => {
    switch (type) {
      case "stroke-play": return "bg-blue-100 text-blue-700";
      case "scramble": return "bg-green-100 text-green-700";
      case "clinic": return "bg-cyan-100 text-cyan-700";
      case "tournament": return "bg-purple-100 text-purple-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getEventTypeName = (type: string) => {
    switch (type) {
      case "stroke-play": return "Stroke Play";
      case "scramble": return "Scramble";
      case "clinic": return "Clinic";
      case "tournament": return "Tournament";
      default: return "Event";
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-golf-green mb-2">Events & Tournaments</h1>
        <p className="text-muted-foreground text-sm sm:text-base">View the full schedule of club happenings and sign up for tournaments.</p>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {events.map((event) => (
          <Card key={event.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start justify-between mb-3">
                <Badge variant="outline" className="text-xs text-muted-foreground">
                  {event.status === "past" ? "Past" : "Upcoming"}
                </Badge>
                <Badge className={`text-xs font-medium ${getEventBadgeColor(event.type)}`}>
                  {getEventTypeName(event.type)}
                </Badge>
              </div>

              <h3 className="text-lg font-semibold text-foreground mb-3 line-clamp-2">{event.title}</h3>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{event.date}</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span>{event.time}</span>
                </div>
                {event.maxParticipants && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>{event.currentParticipants}/{event.maxParticipants} registered</span>
                  </div>
                )}
              </div>

              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{event.description}</p>

              <div className="flex flex-col sm:flex-row gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => setSelectedEvent(event)}
                    >
                      View Details
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader className="space-y-4">
                      <div className="flex items-start justify-between">
                        <DialogTitle className="text-xl sm:text-2xl font-bold text-golf-green pr-4">
                          {selectedEvent?.title}
                        </DialogTitle>
                        <Badge className={`text-xs font-medium flex-shrink-0 ${getEventBadgeColor(selectedEvent?.type || '')}`}>
                          {getEventTypeName(selectedEvent?.type || '')}
                        </Badge>
                      </div>
                    </DialogHeader>
                    
                    {selectedEvent && (
                      <div className="space-y-6">
                        {/* Event Details */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex items-center text-sm">
                            <Calendar className="w-4 h-4 mr-3 text-golf-green" />
                            <span>{selectedEvent.date}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <Clock className="w-4 h-4 mr-3 text-golf-green" />
                            <span>{selectedEvent.time}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <MapPin className="w-4 h-4 mr-3 text-golf-green" />
                            <span>{selectedEvent.location}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <Trophy className="w-4 h-4 mr-3 text-golf-green" />
                            <span>{selectedEvent.format}</span>
                          </div>
                        </div>

                        {/* Registration Status */}
                        {selectedEvent.maxParticipants && (
                          <div className="bg-golf-green-soft p-4 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">Registration</span>
                              <span className="text-sm text-muted-foreground">
                                {selectedEvent.currentParticipants}/{selectedEvent.maxParticipants} spots filled
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-golf-green h-2 rounded-full transition-all duration-300"
                                style={{ 
                                  width: `${(selectedEvent.currentParticipants! / selectedEvent.maxParticipants) * 100}%` 
                                }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Full Description */}
                        <div>
                          <h3 className="font-semibold text-foreground mb-2">Event Details</h3>
                          <p className="text-muted-foreground text-sm leading-relaxed">
                            {selectedEvent.fullDescription}
                          </p>
                        </div>

                        {/* Prizes */}
                        {selectedEvent.prizes && (
                          <div>
                            <h3 className="font-semibold text-foreground mb-2">Prizes & Awards</h3>
                            <ul className="space-y-1">
                              {selectedEvent.prizes.map((prize, index) => (
                                <li key={index} className="text-sm text-muted-foreground flex items-center">
                                  <span className="w-2 h-2 bg-golf-gold rounded-full mr-3 flex-shrink-0" />
                                  {prize}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Action Button */}
                        <div className="pt-4 border-t">
                          {selectedEvent.status === "upcoming" ? (
                            <Button 
                              className="w-full bg-golf-green hover:bg-golf-green-light text-white"
                              disabled={selectedEvent.currentParticipants === selectedEvent.maxParticipants}
                            >
                              {selectedEvent.currentParticipants === selectedEvent.maxParticipants 
                                ? "Event Full - Join Waitlist" 
                                : "Register for Event"
                              }
                            </Button>
                          ) : (
                            <Button variant="outline" className="w-full" disabled>
                              Event Completed
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>

                {event.status === "upcoming" && (
                  <Button 
                    size="sm" 
                    className="flex-1 bg-golf-green hover:bg-golf-green-light text-white"
                    disabled={event.currentParticipants === event.maxParticipants}
                  >
                    {event.currentParticipants === event.maxParticipants ? "Full" : "Register"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {events.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No events scheduled</h3>
          <p className="text-muted-foreground">Check back soon for upcoming tournaments and events</p>
        </div>
      )}
    </div>
  );
}
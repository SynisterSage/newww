import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Calendar, Users, MapPin, Clock } from "lucide-react";
import { format, addDays, addWeeks } from "date-fns";

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
  const events: Event[] = [
    {
      id: "1",
      title: "Member Championship",
      date: addDays(new Date(), 7),
      time: "8:00 AM",
      type: "tournament",
      participants: 24,
      maxParticipants: 32,
      location: "Championship Course",
      description: "Annual member championship tournament. 18-hole stroke play.",
      registrationOpen: true
    },
    {
      id: "2",
      title: "Ladies Night",
      date: addDays(new Date(), 3),
      time: "6:00 PM",
      type: "social",
      participants: 16,
      maxParticipants: 20,
      location: "Clubhouse Dining",
      description: "Monthly ladies night with dinner and networking.",
      registrationOpen: true
    },
    {
      id: "3",
      title: "Junior Golf Clinic",
      date: addWeeks(new Date(), 1),
      time: "10:00 AM",
      type: "lesson",
      participants: 8,
      maxParticipants: 12,
      location: "Practice Range",
      description: "Golf lessons for young members aged 8-16.",
      registrationOpen: true
    },
    {
      id: "4",
      title: "Charity Scramble",
      date: addWeeks(new Date(), 2),
      time: "1:00 PM",
      type: "special",
      participants: 36,
      maxParticipants: 48,
      location: "Championship Course",
      description: "Annual charity scramble supporting local youth programs.",
      registrationOpen: true
    },
    {
      id: "5",
      title: "Wine Tasting Evening",
      date: addDays(new Date(), 14),
      time: "7:00 PM",
      type: "social",
      participants: 22,
      maxParticipants: 30,
      location: "19th Hole Bar",
      description: "Exclusive wine tasting with sommelier guidance.",
      registrationOpen: false
    }
  ];

  const getEventIcon = (type: Event["type"]) => {
    switch (type) {
      case "tournament":
        return <Trophy className="w-5 h-5 text-golf-gold" />;
      case "social":
        return <Users className="w-5 h-5 text-golf-purple" />;
      case "lesson":
        return <Clock className="w-5 h-5 text-golf-blue" />;
      case "special":
        return <MapPin className="w-5 h-5 text-golf-orange" />;
      default:
        return <Calendar className="w-5 h-5 text-golf-green" />;
    }
  };

  const getEventTypeColor = (type: Event["type"]) => {
    switch (type) {
      case "tournament":
        return "bg-golf-gold/10 text-golf-gold border-golf-gold/20";
      case "social":
        return "bg-golf-purple/10 text-golf-purple border-golf-purple/20";
      case "lesson":
        return "bg-golf-blue/10 text-golf-blue border-golf-blue/20";
      case "special":
        return "bg-golf-orange/10 text-golf-orange border-golf-orange/20";
      default:
        return "bg-golf-green/10 text-golf-green border-golf-green/20";
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-golf-green">Club Events</h1>
        <p className="text-muted-foreground mt-1">
          Tournaments, social events, and special activities
        </p>
      </div>

      {/* Upcoming Events */}
      <div className="space-y-4">
        {events.map((event) => (
          <Card key={event.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="mt-1">
                    {getEventIcon(event.type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold">{event.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getEventTypeColor(event.type)}`}>
                        {event.type}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>{format(event.date, 'MMM dd, yyyy')}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{event.location}</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">
                      {event.description}
                    </p>
                    
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2 text-sm">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>
                          {event.participants}
                          {event.maxParticipants && ` / ${event.maxParticipants}`} participants
                        </span>
                      </div>
                      
                      {event.maxParticipants && (
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-golf-green h-2 rounded-full transition-all"
                            style={{ 
                              width: `${(event.participants / event.maxParticipants) * 100}%` 
                            }}
                          ></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="ml-4">
                  {event.registrationOpen ? (
                    <Button className="bg-golf-green hover:bg-golf-green-light">
                      Register
                    </Button>
                  ) : (
                    <Button variant="outline" disabled>
                      Registration Closed
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Event Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Event Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Trophy className="w-8 h-8 mx-auto mb-2 text-golf-gold" />
              <h4 className="font-medium">Tournaments</h4>
              <p className="text-sm text-muted-foreground">Competitive events</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Users className="w-8 h-8 mx-auto mb-2 text-golf-purple" />
              <h4 className="font-medium">Social Events</h4>
              <p className="text-sm text-muted-foreground">Networking & fun</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Clock className="w-8 h-8 mx-auto mb-2 text-golf-blue" />
              <h4 className="font-medium">Lessons</h4>
              <p className="text-sm text-muted-foreground">Skill development</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <MapPin className="w-8 h-8 mx-auto mb-2 text-golf-orange" />
              <h4 className="font-medium">Special Events</h4>
              <p className="text-sm text-muted-foreground">Unique experiences</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, AlertTriangle, Info, Wrench, Clock } from "lucide-react";

interface CourseUpdate {
  id: string;
  title: string;
  type: "maintenance" | "alert" | "news" | "delay";
  date: string;
  description: string;
}

interface Event {
  id: string;
  title: string;
  type: "stroke-play" | "scramble" | "clinic" | "tournament";
  date: string;
  time: string;
  description: string;
  status: "upcoming" | "past";
}

export default function CourseConditions() {
  // Mock data for course updates
  const courseUpdates: CourseUpdate[] = [
    {
      id: "1",
      title: "Aeration Alert: Front 9",
      type: "maintenance",
      date: "February 9, 2025",
      description: "The front 9 greens will be undergoing core aeration. Please expect slower green speeds."
    },
    {
      id: "2", 
      title: "New Pro Shop Merchandise",
      type: "news",
      date: "January 31, 2025",
      description: "Check out the new Spring collection from our top brands, now available in the Pro Shop!"
    },
    {
      id: "3",
      title: "Frost Delay This Morning",
      type: "delay",
      date: "January 27, 2025", 
      description: "Due to morning frost, all tee times before 9:00 AM are delayed by 1 hour. The driving range is open."
    }
  ];

  // Mock data for events
  const events: Event[] = [
    {
      id: "1",
      title: "The President's Cup",
      type: "stroke-play",
      date: "Saturday, Mar 15, 2025",
      time: "4:00 AM",
      description: "A two-day stroke play tournament to kick off the season. All...",
      status: "past"
    },
    {
      id: "2",
      title: "Couples' Scramble & Dine",
      type: "scramble", 
      date: "Saturday, Mar 22, 2025",
      time: "11:00 AM",
      description: "A fun, relaxed 9-hole scramble followed by a gourmet dinner at...",
      status: "past"
    },
    {
      id: "3",
      title: "Junior Golf Clinic",
      type: "clinic",
      date: "Saturday, Apr 5, 2025", 
      time: "5:00 AM",
      description: "A weekend clinic for young golfers aged 8-16 to learn the...",
      status: "past"
    }
  ];

  const getUpdateIcon = (type: string) => {
    switch (type) {
      case "maintenance": return <Wrench className="w-5 h-5" />;
      case "alert": return <AlertTriangle className="w-5 h-5" />;
      case "delay": return <Clock className="w-5 h-5" />;
      default: return <Info className="w-5 h-5" />;
    }
  };

  const getUpdateBadgeColor = (type: string) => {
    switch (type) {
      case "maintenance": return "bg-blue-100 text-blue-700";
      case "alert": return "bg-red-100 text-red-700";
      case "delay": return "bg-purple-100 text-purple-700";
      default: return "bg-green-100 text-green-700";
    }
  };

  const getEventBadgeColor = (type: string) => {
    switch (type) {
      case "stroke-play": return "bg-blue-100 text-blue-700";
      case "scramble": return "bg-green-100 text-green-700";
      case "clinic": return "bg-cyan-100 text-cyan-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-6xl mx-auto">
      {/* Course Conditions Section */}
      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-golf-green mb-2">Course Conditions & Updates</h1>
          <p className="text-muted-foreground">Stay informed about the latest course news and maintenance schedules.</p>
        </div>

        <div className="space-y-4">
          {courseUpdates.map((update) => (
            <Card key={update.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {getUpdateIcon(update.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-foreground">{update.title}</h3>
                      <Badge className={`text-xs font-medium ${getUpdateBadgeColor(update.type)}`}>
                        {update.type === "maintenance" ? "Maintenance" : 
                         update.type === "alert" ? "Alert" :
                         update.type === "delay" ? "Frost Delay" : "Course News"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{update.date}</p>
                    <p className="text-foreground">{update.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Events Section */}
      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-golf-green mb-2">Events & Tournaments</h1>
          <p className="text-muted-foreground">View the full schedule of club happenings and sign up for tournaments.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card key={event.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <Badge variant="outline" className="text-xs text-muted-foreground">
                    {event.status === "past" ? "Past" : "Upcoming"}
                  </Badge>
                  <Badge className={`text-xs font-medium ${getEventBadgeColor(event.type)}`}>
                    {event.type === "stroke-play" ? "Stroke Play" :
                     event.type === "scramble" ? "Scramble" :
                     event.type === "clinic" ? "Clinic" : "Tournament"}
                  </Badge>
                </div>

                <h3 className="text-lg font-semibold text-foreground mb-3">{event.title}</h3>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{event.time}</span>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-4">{event.description}</p>

                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                  >
                    View Details
                  </Button>
                  {event.status === "upcoming" && (
                    <Button 
                      size="sm" 
                      className="flex-1 bg-golf-green hover:bg-golf-green-light text-white"
                    >
                      Sign Up for Event
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
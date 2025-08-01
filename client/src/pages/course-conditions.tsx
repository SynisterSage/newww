import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Info, Wrench, Clock } from "lucide-react";

interface CourseUpdate {
  id: string;
  title: string;
  type: "maintenance" | "alert" | "news" | "delay";
  date: string;
  description: string;
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



  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-golf-green mb-2">Course Conditions & Updates</h1>
        <p className="text-muted-foreground text-sm sm:text-base">Stay informed about the latest course news and maintenance schedules.</p>
      </div>

      {/* Course Updates */}
      <div className="space-y-4">
        {courseUpdates.map((update) => (
          <Card key={update.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
                <div className="flex-shrink-0 self-start">
                  {getUpdateIcon(update.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 gap-2">
                    <h3 className="text-lg font-semibold text-foreground pr-2">{update.title}</h3>
                    <Badge className={`text-xs font-medium self-start flex-shrink-0 ${getUpdateBadgeColor(update.type)}`}>
                      {update.type === "maintenance" ? "Maintenance" : 
                       update.type === "alert" ? "Alert" :
                       update.type === "delay" ? "Frost Delay" : "Course News"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{update.date}</p>
                  <p className="text-foreground text-sm sm:text-base leading-relaxed">{update.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {courseUpdates.length === 0 && (
        <div className="text-center py-12">
          <Info className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No updates available</h3>
          <p className="text-muted-foreground">Course conditions and updates will appear here</p>
        </div>
      )}
    </div>
  );
}
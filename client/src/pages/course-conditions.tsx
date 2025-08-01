import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Info, Wrench, Clock, Cloud, Sun, CloudRain, Wind, Thermometer, Droplets } from "lucide-react";

interface CourseUpdate {
  id: string;
  title: string;
  type: "maintenance" | "alert" | "news" | "delay";
  date: string;
  description: string;
}

export default function CourseConditions() {
  // Mock weather data - in real app this would come from weather API
  const currentWeather = {
    temperature: 72,
    condition: "Partly Cloudy",
    humidity: 65,
    windSpeed: 8,
    windDirection: "SW",
    precipitation: 0,
    visibility: 10,
    uvIndex: 6,
    pressure: 30.12,
    feelsLike: 75
  };

  const weatherIcon = () => {
    switch (currentWeather.condition) {
      case "Sunny": return <Sun className="w-8 h-8 text-yellow-500" />;
      case "Partly Cloudy": return <Cloud className="w-8 h-8 text-gray-400" />;
      case "Rainy": return <CloudRain className="w-8 h-8 text-blue-500" />;
      default: return <Sun className="w-8 h-8 text-yellow-500" />;
    }
  };

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

      {/* Live Weather Widget */}
      <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-950/20 dark:to-green-950/20">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-golf-green">Live Weather Conditions</h2>
            <Badge className="bg-green-100 text-green-700 text-xs">
              Live
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Main Weather */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-4">
                {weatherIcon()}
                <div>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-3xl sm:text-4xl font-bold text-foreground">
                      {currentWeather.temperature}°
                    </span>
                    <span className="text-sm text-muted-foreground">F</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Feels like {currentWeather.feelsLike}°F
                  </p>
                  <p className="text-lg font-medium text-foreground mt-1">
                    {currentWeather.condition}
                  </p>
                </div>
              </div>
            </div>

            {/* Weather Details Grid */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="flex items-center space-x-2">
                  <Wind className="w-4 h-4 text-golf-green" />
                  <div>
                    <p className="text-xs text-muted-foreground">Wind</p>
                    <p className="text-sm font-medium">{currentWeather.windSpeed} mph {currentWeather.windDirection}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Droplets className="w-4 h-4 text-golf-green" />
                  <div>
                    <p className="text-xs text-muted-foreground">Humidity</p>
                    <p className="text-sm font-medium">{currentWeather.humidity}%</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <CloudRain className="w-4 h-4 text-golf-green" />
                  <div>
                    <p className="text-xs text-muted-foreground">Precipitation</p>
                    <p className="text-sm font-medium">{currentWeather.precipitation}"</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Thermometer className="w-4 h-4 text-golf-green" />
                  <div>
                    <p className="text-xs text-muted-foreground">UV Index</p>
                    <p className="text-sm font-medium">{currentWeather.uvIndex}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Course Playability Status */}
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-foreground">Course Open - Excellent Playing Conditions</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Last updated: {new Date().toLocaleTimeString()} • Visibility: {currentWeather.visibility} miles
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

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
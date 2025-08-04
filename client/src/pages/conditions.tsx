import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CloudSun, Thermometer, Wind, Droplets, AlertCircle, CheckCircle, MapPin, Clock, Wrench } from "lucide-react";
import type { CourseConditions } from "@shared/schema";

export default function ConditionsPage() {
  const { data: conditions, isLoading } = useQuery({
    queryKey: ["/api/course/conditions"],
    queryFn: () => fetch("/api/course/conditions").then(res => res.json()) as Promise<CourseConditions>
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F6F0] p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <CloudSun className="h-8 w-8 text-[#08452e]" />
            <h1 className="text-3xl font-bold text-[#08452e]">Course Conditions</h1>
          </div>
          <div className="text-center py-12">
            <div className="animate-spin h-8 w-8 border-2 border-[#08452e] border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading course conditions...</p>
          </div>
        </div>
      </div>
    );
  }

  const getWeatherIcon = (weather: string) => {
    switch (weather) {
      case 'sunny': return '☀️';
      case 'partly-cloudy': return '⛅';
      case 'cloudy': return '☁️';
      case 'overcast': return '☁️';
      case 'light-rain': return '🌦️';
      case 'heavy-rain': return '🌧️';
      case 'thunderstorms': return '⛈️';
      case 'fog': return '🌫️';
      case 'snow': return '❄️';
      case 'windy': return '💨';
      default: return '☀️';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-red-100 text-red-800';
      case 'limited': return 'bg-yellow-100 text-yellow-800';
      case 'maintenance': return 'bg-orange-100 text-orange-800';
      case 'weather-delay': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'fair': return 'bg-yellow-100 text-yellow-800';
      case 'poor': return 'bg-red-100 text-red-800';
      case 'temporary': return 'bg-purple-100 text-purple-800';
      case 'overseeded': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6F0] p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#08452e] mb-2">Course Conditions</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Packanack Golf Club - 9 Hole Course</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">
              Last Updated: {conditions?.lastUpdated ? new Date(conditions.lastUpdated).toLocaleDateString() : "Never"}
            </p>
          </div>
        </div>

        {/* Weather Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-[#08452e] mb-4">Current Weather</h2>
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                <div className="text-center">
                  <div className="text-4xl mb-3">{getWeatherIcon(conditions?.weather || 'sunny')}</div>
                  <p className="font-semibold text-gray-900 capitalize">
                    {conditions?.weather?.replace('-', ' ') || 'Sunny'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Conditions</p>
                </div>
                
                <div className="text-center">
                  <Thermometer className="h-8 w-8 text-red-500 mx-auto mb-3" />
                  <p className="text-2xl font-bold text-gray-900 mb-1">{conditions?.temperature || 72}°F</p>
                  <p className="text-sm text-muted-foreground">Temperature</p>
                </div>
                
                <div className="text-center">
                  <Wind className="h-8 w-8 text-blue-500 mx-auto mb-3" />
                  <p className="text-2xl font-bold text-gray-900 mb-1">{conditions?.windSpeed || 5} mph</p>
                  <p className="text-sm text-muted-foreground">Wind Speed</p>
                </div>
                
                <div className="text-center">
                  <Droplets className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                  <p className="text-2xl font-bold text-gray-900 mb-1">{conditions?.humidity || 45}%</p>
                  <p className="text-sm text-muted-foreground">Humidity</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Course Information */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-[#08452e] mb-4">Course Status</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Course Status */}
            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="p-6 text-center">
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-3" />
                <p className="font-semibold text-gray-900 mb-1">Course Status</p>
                <Badge className={`${getStatusColor(conditions?.courseStatus || 'open')} capitalize`}>
                  {conditions?.courseStatus || 'Open'}
                </Badge>
              </CardContent>
            </Card>

            {/* Cart Policy */}
            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="p-6 text-center">
                <MapPin className="h-8 w-8 text-blue-500 mx-auto mb-3" />
                <p className="font-semibold text-gray-900 mb-1">Cart Policy</p>
                <Badge className={`${conditions?.cartPathOnly ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                  {conditions?.cartPathOnly ? 'Cart Path Only' : 'Fairways Allowed'}
                </Badge>
              </CardContent>
            </Card>

            {/* Greens Condition */}
            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="p-6 text-center">
                <div className="w-8 h-8 bg-green-500 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <div className="w-4 h-4 bg-white rounded-full"></div>
                </div>
                <p className="font-semibold text-gray-900 mb-1">Greens</p>
                <Badge className={`${getConditionColor(conditions?.greensCondition || 'excellent')} capitalize`}>
                  {conditions?.greensCondition || 'Excellent'}
                </Badge>
              </CardContent>
            </Card>

            {/* Fairways Condition */}
            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="p-6 text-center">
                <div className="w-8 h-8 bg-green-400 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <div className="w-4 h-4 bg-white rounded-full"></div>
                </div>
                <p className="font-semibold text-gray-900 mb-1">Fairways</p>
                <Badge className={`${getConditionColor(conditions?.fairwaysCondition || 'good')} capitalize`}>
                  {conditions?.fairwaysCondition || 'Good'}
                </Badge>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Course Notices */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-[#08452e] mb-4">Important Notices</h2>
          {(conditions?.hazardNotes || (conditions?.maintenanceNotes && conditions.maintenanceNotes.length > 0)) ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {conditions?.hazardNotes && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-red-800 mb-2">Hazard Alert</h4>
                      <p className="text-red-700 leading-relaxed">{conditions.hazardNotes}</p>
                    </div>
                  </div>
                </div>
              )}
              {conditions?.maintenanceNotes && conditions.maintenanceNotes.length > 0 && 
                conditions.maintenanceNotes.map((note, index) => (
                  <div key={index} className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <Wrench className="h-6 w-6 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-orange-800 mb-2">Maintenance Notice</h4>
                        <p className="text-orange-700 leading-relaxed">{note}</p>
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-green-700 font-medium">No new course notices</p>
                  <p className="text-green-600 text-sm mt-1">All clear! Check back later for updates.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
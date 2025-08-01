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
    <div className="min-h-screen bg-[#F8F6F0]">
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto pb-20 lg:pb-8">
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

        {/* Main Course Overview */}
        <Card className="border-0 shadow-sm bg-white mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Weather Overview */}
              <div className="lg:col-span-1">
                <h3 className="text-lg font-semibold text-[#08452e] mb-4 flex items-center gap-2">
                  <CloudSun className="h-5 w-5" />
                  Current Weather
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{getWeatherIcon(conditions?.weather || 'sunny')}</div>
                    <div>
                      <p className="font-semibold text-gray-900 capitalize">
                        {conditions?.weather?.replace('-', ' ') || 'Sunny'}
                      </p>
                      <p className="text-2xl font-bold text-[#08452e]">{conditions?.temperature || 72}°F</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="flex items-center gap-2">
                      <Wind className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">{conditions?.windSpeed || 5} mph</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Droplets className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">{conditions?.humidity || 45}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Course Status Overview */}
              <div className="lg:col-span-2">
                <h3 className="text-lg font-semibold text-[#08452e] mb-4 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Course Status & Conditions
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Course Status */}
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-900 mb-1">Course Status</p>
                    <Badge className={`${getStatusColor(conditions?.courseStatus || 'open')} capitalize text-xs`}>
                      {conditions?.courseStatus || 'Open'}
                    </Badge>
                  </div>

                  {/* Cart Policy */}
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <MapPin className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-900 mb-1">Cart Policy</p>
                    <Badge className={`${conditions?.cartPathOnly ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'} text-xs`}>
                      {conditions?.cartPathOnly ? 'Path Only' : 'Fairways OK'}
                    </Badge>
                  </div>

                  {/* Greens */}
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="w-6 h-6 bg-green-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-1">Greens</p>
                    <Badge className={`${getConditionColor(conditions?.greensCondition || 'excellent')} capitalize text-xs`}>
                      {conditions?.greensCondition || 'Excellent'}
                    </Badge>
                  </div>

                  {/* Fairways */}
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="w-6 h-6 bg-green-400 rounded-full mx-auto mb-2 flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-1">Fairways</p>
                    <Badge className={`${getConditionColor(conditions?.fairwaysCondition || 'good')} capitalize text-xs`}>
                      {conditions?.fairwaysCondition || 'Good'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Course Notices */}
        {(conditions?.hazardNotes || (conditions?.maintenanceNotes && conditions.maintenanceNotes.length > 0)) && (
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-[#08452e] mb-4 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Important Notices
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {conditions?.hazardNotes && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-red-800 mb-1 text-sm">Hazard Alert</h4>
                        <p className="text-red-700 text-sm leading-relaxed">{conditions.hazardNotes}</p>
                      </div>
                    </div>
                  </div>
                )}
                {conditions?.maintenanceNotes && conditions.maintenanceNotes.length > 0 && 
                  conditions.maintenanceNotes.map((note, index) => (
                    <div key={index} className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Wrench className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-orange-800 mb-1 text-sm">Maintenance Notice</h4>
                          <p className="text-orange-700 text-sm leading-relaxed">{note}</p>
                        </div>
                      </div>
                    </div>
                  ))
                }
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
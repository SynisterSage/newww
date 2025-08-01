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
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-stone-100 to-stone-200 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <CloudSun className="h-8 w-8 text-golf-green" />
            <h1 className="text-3xl font-bold text-golf-green">Course Conditions</h1>
          </div>
          <div className="text-center py-12">
            <div className="animate-spin h-8 w-8 border-2 border-golf-green border-t-transparent rounded-full mx-auto"></div>
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
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-stone-100 to-stone-200 px-4 py-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                <CloudSun className="h-8 w-8 text-golf-green" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-golf-green tracking-tight">Course Conditions</h1>
                <p className="text-gray-600 mt-1">Packanack Golf Club - 9 Hole Course</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                Updated: {conditions ? new Date(conditions.lastUpdated).toLocaleDateString() : "Never"}
              </span>
            </div>
          </div>
        </div>

        {/* Current Weather Section */}
        <div className="mb-8">
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-3">
                <div className="w-2 h-8 bg-golf-green rounded-full"></div>
                Current Weather Conditions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center p-6 bg-gradient-to-b from-gray-50 to-white rounded-xl border border-gray-100">
                  <div className="text-5xl mb-3">{getWeatherIcon(conditions?.weather || 'sunny')}</div>
                  <p className="font-semibold text-gray-900 capitalize text-lg">
                    {conditions?.weather?.replace('-', ' ') || 'Sunny'}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Conditions</p>
                </div>
                <div className="text-center p-6 bg-gradient-to-b from-gray-50 to-white rounded-xl border border-gray-100">
                  <div className="flex items-center justify-center mb-3">
                    <Thermometer className="h-8 w-8 text-red-500 mr-2" />
                    <span className="text-4xl font-bold text-gray-900">{conditions?.temperature || 72}°F</span>
                  </div>
                  <p className="text-sm text-gray-500">Temperature</p>
                </div>
                <div className="text-center p-6 bg-gradient-to-b from-gray-50 to-white rounded-xl border border-gray-100">
                  <div className="flex items-center justify-center mb-3">
                    <Wind className="h-8 w-8 text-blue-500 mr-2" />
                    <span className="text-4xl font-bold text-gray-900">{conditions?.windSpeed || 5}</span>
                  </div>
                  <p className="text-sm text-gray-500">Wind Speed (mph)</p>
                </div>
                <div className="text-center p-6 bg-gradient-to-b from-gray-50 to-white rounded-xl border border-gray-100">
                  <div className="flex items-center justify-center mb-3">
                    <Droplets className="h-8 w-8 text-blue-600 mr-2" />
                    <span className="text-4xl font-bold text-gray-900">{conditions?.humidity || 45}%</span>
                  </div>
                  <p className="text-sm text-gray-500">Humidity</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Course Status & Conditions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Course Status */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-3">
                <div className="w-2 h-6 bg-golf-green rounded-full"></div>
                Course Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center p-4 bg-gradient-to-b from-gray-50 to-white rounded-lg border border-gray-100">
                <p className="text-sm font-medium text-gray-600 mb-3">Current Status</p>
                <Badge className={`${getStatusColor(conditions?.courseStatus || 'open')} text-base px-6 py-2 capitalize font-medium`}>
                  {conditions?.courseStatus || 'Open'}
                </Badge>
              </div>
              <div className="text-center p-4 bg-gradient-to-b from-gray-50 to-white rounded-lg border border-gray-100">
                <p className="text-sm font-medium text-gray-600 mb-3">Cart Policy</p>
                <Badge className={`${conditions?.cartPathOnly ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-emerald-100 text-emerald-800 border-emerald-200'} text-base px-6 py-2 font-medium border`}>
                  {conditions?.cartPathOnly ? 'Cart Path Only' : 'Fairways Allowed'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Playing Conditions */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-3">
                <div className="w-2 h-6 bg-golf-green rounded-full"></div>
                Playing Conditions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center p-4 bg-gradient-to-b from-gray-50 to-white rounded-lg border border-gray-100">
                <p className="text-sm font-medium text-gray-600 mb-3">Greens</p>
                <Badge className={`${getConditionColor(conditions?.greensCondition || 'excellent')} text-base px-6 py-2 capitalize font-medium`}>
                  {conditions?.greensCondition || 'Excellent'}
                </Badge>
              </div>
              <div className="text-center p-4 bg-gradient-to-b from-gray-50 to-white rounded-lg border border-gray-100">
                <p className="text-sm font-medium text-gray-600 mb-3">Fairways</p>
                <Badge className={`${getConditionColor(conditions?.fairwaysCondition || 'good')} text-base px-6 py-2 capitalize font-medium`}>
                  {conditions?.fairwaysCondition || 'Good'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Course Information */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-3">
                <div className="w-2 h-6 bg-golf-green rounded-full"></div>
                Course Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center p-6 bg-gradient-to-b from-golf-green-soft to-white rounded-lg border border-golf-green-light">
                <div className="mb-4">
                  <MapPin className="h-8 w-8 text-golf-green mx-auto mb-2" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Packanack Golf Club</h3>
                <p className="text-golf-green font-semibold text-lg mb-3">-</p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Course conditions are monitored and updated regularly by our professional grounds crew to ensure optimal playing conditions.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Course Notices */}
        {(conditions?.hazardNotes || conditions?.maintenanceNotes) && (
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-3">
                <div className="w-2 h-8 bg-red-500 rounded-full"></div>
                Course Notices & Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {conditions?.hazardNotes && (
                  <div className="p-6 bg-gradient-to-b from-red-50 to-white rounded-xl border-l-4 border-red-400 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <AlertCircle className="h-6 w-6 text-red-600" />
                      <h4 className="font-bold text-red-800 text-lg">Hazard Alert</h4>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{conditions.hazardNotes}</p>
                  </div>
                )}
                {conditions?.maintenanceNotes && (
                  <div className="p-6 bg-gradient-to-b from-orange-50 to-white rounded-xl border-l-4 border-orange-400 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <Wrench className="h-6 w-6 text-orange-600" />
                      <h4 className="font-bold text-orange-800 text-lg">Maintenance Notice</h4>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{conditions.maintenanceNotes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
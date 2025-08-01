import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CloudSun, Thermometer, Wind, Droplets, AlertCircle, CheckCircle, MapPin, Clock } from "lucide-react";
import type { CourseConditions } from "@shared/schema";

export default function ConditionsPage() {
  const { data: conditions, isLoading } = useQuery({
    queryKey: ["/api/course/conditions"],
    queryFn: () => fetch("/api/course/conditions").then(res => res.json()) as Promise<CourseConditions>
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-golf-green-soft via-white to-golf-green-light p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <CloudSun className="h-8 w-8 text-golf-green" />
            <h1 className="text-3xl font-bold text-gray-900">Course Conditions</h1>
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
    <div className="min-h-screen bg-gradient-to-br from-golf-green-soft via-white to-golf-green-light p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <CloudSun className="h-8 w-8 text-golf-green" />
            <h1 className="text-3xl font-bold text-gray-900">Course Conditions</h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            Last updated: {conditions ? new Date(conditions.lastUpdated).toLocaleString() : "Never"}
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Weather Card */}
          <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CloudSun className="h-5 w-5" />
                Current Weather
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-4xl mb-2">{getWeatherIcon(conditions?.weather || 'sunny')}</div>
                  <p className="font-semibold capitalize text-gray-900">{conditions?.weather?.replace('-', ' ') || 'Sunny'}</p>
                </div>
                <div className="bg-red-50 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <Thermometer className="h-6 w-6 text-red-500" />
                    <span className="text-3xl font-bold text-gray-900">{conditions?.temperature || 72}°</span>
                  </div>
                  <p className="text-gray-600 font-medium">Temperature</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <Wind className="h-6 w-6 text-blue-500" />
                    <span className="text-3xl font-bold text-gray-900">{conditions?.windSpeed || 5}</span>
                  </div>
                  <p className="text-gray-600 font-medium">Wind (mph)</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <Droplets className="h-6 w-6 text-blue-600" />
                    <span className="text-3xl font-bold text-gray-900">{conditions?.humidity || 45}%</span>
                  </div>
                  <p className="text-gray-600 font-medium">Humidity</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Course Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Course Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600 mb-2">Current Status</p>
                <Badge className={`${getStatusColor(conditions?.courseStatus || 'open')} text-lg px-4 py-2 capitalize`}>
                  {conditions?.courseStatus || 'Open'}
                </Badge>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600 mb-2">Cart Policy</p>
                <Badge className={`${conditions?.cartPathOnly ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'} text-lg px-4 py-2`}>
                  {conditions?.cartPathOnly ? 'Path Only' : 'Fairways OK'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Course Conditions Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Playing Conditions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600 mb-2">Greens</p>
                <Badge className={`${getConditionColor(conditions?.greensCondition || 'excellent')} text-lg px-4 py-2 capitalize`}>
                  {conditions?.greensCondition || 'Excellent'}
                </Badge>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600 mb-2">Fairways</p>
                <Badge className={`${getConditionColor(conditions?.fairwaysCondition || 'good')} text-lg px-4 py-2 capitalize`}>
                  {conditions?.fairwaysCondition || 'Good'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Course Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Course Info
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-golf-green-soft rounded-lg p-4 text-center space-y-3">
                <h3 className="font-bold text-lg text-gray-900">Packanack Golf Club</h3>
                <p className="text-golf-green font-semibold">9-Hole Course</p>
                <p className="text-sm text-gray-600">
                  Conditions updated regularly by our grounds crew
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Course Notes - Full Width */}
        {(conditions?.hazardNotes || conditions?.maintenanceNotes) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Course Notices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {conditions?.hazardNotes && (
                  <div className="bg-red-50 rounded-lg p-4 border-l-4 border-red-300">
                    <h4 className="font-semibold text-red-700 mb-2 flex items-center gap-2">
                      ⚠️ Hazard Alert
                    </h4>
                    <p className="text-gray-700">{conditions.hazardNotes}</p>
                  </div>
                )}
                {conditions?.maintenanceNotes && (
                  <div className="bg-orange-50 rounded-lg p-4 border-l-4 border-orange-300">
                    <h4 className="font-semibold text-orange-700 mb-2 flex items-center gap-2">
                      🔧 Maintenance Update
                    </h4>
                    <p className="text-gray-700">{conditions.maintenanceNotes}</p>
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
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
      <div className="max-w-4xl mx-auto">
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

        <div className="space-y-6">
          {/* Current Weather */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CloudSun className="h-5 w-5" />
                Current Weather
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-4xl mb-2">{getWeatherIcon(conditions?.weather || 'sunny')}</div>
                  <p className="font-semibold capitalize">{conditions?.weather?.replace('-', ' ') || 'Sunny'}</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <Thermometer className="h-5 w-5 text-red-500" />
                    <span className="text-2xl font-bold">{conditions?.temperature || 72}°F</span>
                  </div>
                  <p className="text-gray-600">Temperature</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <Wind className="h-5 w-5 text-blue-500" />
                    <span className="text-2xl font-bold">{conditions?.windSpeed || 5}</span>
                  </div>
                  <p className="text-gray-600">Wind (mph)</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <Droplets className="h-5 w-5 text-blue-600" />
                    <span className="text-2xl font-bold">{conditions?.humidity || 45}%</span>
                  </div>
                  <p className="text-gray-600">Humidity</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Course Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Course Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Current Status</p>
                  <Badge className={`${getStatusColor(conditions?.courseStatus || 'open')} text-lg px-4 py-2 capitalize`}>
                    {conditions?.courseStatus || 'Open'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">Cart Restrictions</p>
                  <Badge className={`${conditions?.cartPathOnly ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'} text-lg px-4 py-2`}>
                    {conditions?.cartPathOnly ? 'Cart Path Only' : 'Carts Allowed on Fairways'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Course Conditions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Course Conditions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Greens Condition</p>
                  <Badge className={`${getConditionColor(conditions?.greensCondition || 'excellent')} text-lg px-4 py-2 capitalize`}>
                    {conditions?.greensCondition || 'Excellent'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">Fairways Condition</p>
                  <Badge className={`${getConditionColor(conditions?.fairwaysCondition || 'good')} text-lg px-4 py-2 capitalize`}>
                    {conditions?.fairwaysCondition || 'Good'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Course Notes */}
          {(conditions?.hazardNotes || conditions?.maintenanceNotes) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Course Notices
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {conditions?.hazardNotes && (
                  <div>
                    <h4 className="font-semibold text-red-700 mb-2">⚠️ Hazard Notes</h4>
                    <p className="text-gray-700 bg-red-50 p-3 rounded-lg border-l-4 border-red-200">
                      {conditions.hazardNotes}
                    </p>
                  </div>
                )}
                {conditions?.maintenanceNotes && (
                  <div>
                    <h4 className="font-semibold text-orange-700 mb-2">🔧 Maintenance Notes</h4>
                    <p className="text-gray-700 bg-orange-50 p-3 rounded-lg border-l-4 border-orange-200">
                      {conditions.maintenanceNotes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Course Information */}
          <Card>
            <CardHeader>
              <CardTitle>Packanack Golf Club</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-2">
                <p className="text-gray-600">Championship Course - 18 Holes</p>
                <p className="text-sm text-gray-500">
                  Course conditions are updated regularly by our grounds crew to ensure the best playing experience.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
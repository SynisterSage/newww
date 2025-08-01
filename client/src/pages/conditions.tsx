import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sun, Wind, Droplets, Thermometer, Eye, Gauge, Calendar, AlertTriangle, CheckCircle, Clock, Scissors, Waves } from "lucide-react";
import { useEffect, useState } from "react";

interface WeatherData {
  temperature: number;
  condition: string;
  windSpeed: number;
  humidity: number;
  visibility: number;
  pressure: number;
  location: string;
}

interface CourseUpdate {
  id: string;
  type: 'aeration' | 'verticutting' | 'closure' | 'maintenance';
  title: string;
  description: string;
  date: string;
  status: 'upcoming' | 'active' | 'completed';
  affectedAreas?: string[];
}

export default function Conditions() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Course updates data
  const courseUpdates: CourseUpdate[] = [
    {
      id: '1',
      type: 'aeration',
      title: 'Greens Aeration',
      description: 'Annual greens aeration to improve root growth and drainage. Temporary putting surfaces will be available.',
      date: '2025-08-15',
      status: 'upcoming',
      affectedAreas: ['All Greens']
    },
    {
      id: '2',
      type: 'verticutting',
      title: 'Fairway Verticutting',
      description: 'Routine verticutting to remove thatch and promote healthy turf growth.',
      date: '2025-08-08',
      status: 'active',
      affectedAreas: ['Holes 1-9 Fairways']
    },
    {
      id: '3',
      type: 'maintenance',
      title: 'Cart Path Repair',
      description: 'Resurfacing and repair of cart paths on the back nine.',
      date: '2025-07-28',
      status: 'completed',
      affectedAreas: ['Holes 10-18 Cart Paths']
    },
    {
      id: '4',
      type: 'closure',
      title: 'Course Closure - Tournament',
      description: 'Course closed to members for annual club championship tournament.',
      date: '2025-08-22',
      status: 'upcoming',
      affectedAreas: ['Entire Course']
    }
  ];

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // Get user's location
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 10000,
            enableHighAccuracy: true
          });
        });

        const { latitude, longitude } = position.coords;
        
        // Fetch weather data from OpenWeatherMap API
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${import.meta.env.VITE_OPENWEATHER_API_KEY}&units=imperial`
        );

        if (!response.ok) {
          throw new Error('Weather data not available');
        }

        const data = await response.json();
        
        setWeather({
          temperature: Math.round(data.main.temp),
          condition: data.weather[0].description,
          windSpeed: Math.round(data.wind.speed),
          humidity: data.main.humidity,
          visibility: Math.round(data.visibility / 1609.34), // Convert to miles
          pressure: Math.round(data.main.pressure * 0.02953), // Convert to inHg
          location: data.name
        });
      } catch (err) {
        console.error('Weather fetch error:', err);
        setError('Unable to fetch weather data. Please check location permissions.');
        // Fallback to default data
        setWeather({
          temperature: 75,
          condition: "partly cloudy",
          windSpeed: 8,
          humidity: 65,
          visibility: 10,
          pressure: 30,
          location: "Golf Course"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  const getUpdateIcon = (type: CourseUpdate['type']) => {
    switch (type) {
      case 'aeration':
        return <Waves className="w-5 h-5" />;
      case 'verticutting':
        return <Scissors className="w-5 h-5" />;
      case 'closure':
        return <AlertTriangle className="w-5 h-5" />;
      case 'maintenance':
        return <Clock className="w-5 h-5" />;
      default:
        return <Calendar className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: CourseUpdate['status']) => {
    switch (status) {
      case 'upcoming':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'active':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F6F0]">
        <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-golf-green">Course Conditions</h1>
          <div className="animate-pulse space-y-4">
            <div className="h-64 bg-gray-300 rounded-lg"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-48 bg-gray-300 rounded-lg"></div>
              <div className="h-48 bg-gray-300 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F6F0]">
      <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#08452e] mb-2">Course Conditions</h1>
          <p className="text-muted-foreground text-lg">
            Live weather and course updates for {weather?.location || 'Packanack Golf Course'}
          </p>
        </div>

        {error && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <p className="text-yellow-800 text-sm">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Top Row - Weather and Quick Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Weather - Takes 2 columns */}
          <Card className="lg:col-span-2 shadow-sm border-0">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2 text-xl">
                <Sun className="w-6 h-6 text-amber-500" />
                <span>Current Weather</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-5xl font-bold text-[#08452e] mb-1">
                    {weather?.temperature}°F
                  </div>
                  <p className="text-lg text-muted-foreground capitalize">
                    {weather?.condition}
                  </p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-1">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-800">Perfect Golf Weather!</span>
                  </div>
                  <p className="text-sm text-green-700">Ideal conditions for your round</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <Wind className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold text-lg">{weather?.windSpeed} mph</p>
                  <p className="text-sm text-muted-foreground">Wind</p>
                </div>
                <div className="text-center p-3 bg-cyan-50 rounded-lg">
                  <Droplets className="w-6 h-6 mx-auto mb-2 text-cyan-600" />
                  <p className="font-semibold text-lg">{weather?.humidity}%</p>
                  <p className="text-sm text-muted-foreground">Humidity</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Eye className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                  <p className="font-semibold text-lg">{weather?.visibility} mi</p>
                  <p className="text-sm text-muted-foreground">Visibility</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <Gauge className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                  <p className="font-semibold text-lg">{weather?.pressure}"</p>
                  <p className="text-sm text-muted-foreground">Pressure</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Course Status - 1 column */}
          <Card className="shadow-sm border-0">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Course Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="font-medium">Course Open</span>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <span className="font-medium">Cart Path Only</span>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="font-medium">Greens</span>
                <span className="font-semibold text-green-600">Excellent</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="font-medium">Fairways</span>
                <span className="font-semibold text-green-600">Good</span>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200 space-y-2 text-sm">
                <p><strong>Sunrise:</strong> 6:12 AM</p>
                <p><strong>Sunset:</strong> 7:48 PM</p>
                <p><strong>UV Index:</strong> Moderate (6)</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Course Updates Section */}
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-[#08452e] mb-2">Course Updates</h2>
            <p className="text-muted-foreground">Maintenance schedules and course notifications</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courseUpdates.map((update) => (
              <Card key={update.id} className="shadow-sm border-0 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className={`p-2 rounded-lg ${getStatusColor(update.status)}`}>
                      {getUpdateIcon(update.type)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-lg">{update.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(update.status)}`}>
                          {update.status}
                        </span>
                      </div>
                      
                      <p className="text-muted-foreground text-sm mb-3">
                        {update.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-1 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(update.date)}</span>
                        </div>
                        
                        {update.affectedAreas && (
                          <div className="text-xs text-muted-foreground bg-gray-100 px-2 py-1 rounded">
                            {update.affectedAreas.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
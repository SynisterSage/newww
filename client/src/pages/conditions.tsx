import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sun, Wind, Droplets, Thermometer, Eye, Gauge } from "lucide-react";
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

export default function Conditions() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fbfff5]">
        <div className="p-6 space-y-6">
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
    <div className="min-h-screen bg-[#fbfff5]">
      <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-golf-green">Course Conditions</h1>
        <p className="text-muted-foreground mt-1">
          Live weather and course updates for {weather?.location || 'your location'}
        </p>
      </div>

      {error && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <p className="text-yellow-800 text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Current Weather */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sun className="w-5 h-5" />
            <span>Current Weather</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            <div className="text-6xl font-bold text-golf-green mb-2">
              {weather?.temperature}°F
            </div>
            <p className="text-lg text-muted-foreground capitalize">
              {weather?.condition}
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <Wind className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <div className="text-xl font-semibold">{weather?.windSpeed} mph</div>
              <div className="text-sm text-muted-foreground">Wind Speed</div>
            </div>
            
            <div className="text-center">
              <Droplets className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <div className="text-xl font-semibold">{weather?.humidity}%</div>
              <div className="text-sm text-muted-foreground">Humidity</div>
            </div>
            
            <div className="text-center">
              <Eye className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <div className="text-xl font-semibold">{weather?.visibility} mi</div>
              <div className="text-sm text-muted-foreground">Visibility</div>
            </div>
            
            <div className="text-center">
              <Gauge className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <div className="text-xl font-semibold">{weather?.pressure}"</div>
              <div className="text-sm text-muted-foreground">Pressure</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Course Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Course Open</span>
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              </div>
              <div className="flex items-center justify-between">
                <span>Cart Path Only</span>
                <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
              </div>
              <div className="flex items-center justify-between">
                <span>Greens Condition</span>
                <span className="text-green-600 font-medium">Excellent</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Fairways Condition</span>
                <span className="text-green-600 font-medium">Good</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Playing Conditions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-center mb-2">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <p className="font-medium text-green-800">Ideal Golf Weather!</p>
              </div>
              <p className="text-sm text-green-700 text-center">
                Perfect conditions for your round today
              </p>
            </div>
            
            <div className="space-y-2 text-sm">
              <p><strong>Sunrise:</strong> 6:12 AM</p>
              <p><strong>Sunset:</strong> 7:48 PM</p>
              <p><strong>UV Index:</strong> Moderate (6)</p>
              <p><strong>Golf Comfort:</strong> Excellent</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </div>
  );
}
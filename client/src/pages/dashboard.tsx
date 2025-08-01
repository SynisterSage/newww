import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Utensils, MapPin, User, Trophy, Clock, TrendingUp, DollarSign, Wind, Droplets, Sun } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import type { User as UserType, TeeTime, Order } from "@shared/schema";

interface DashboardProps {
  userEmail?: string;
  user?: UserType;
}

export default function Dashboard({ userEmail, user }: DashboardProps) {
  const { data: fetchedUser, isLoading } = useQuery<UserType>({
    queryKey: ['/api/user', user?.id || 'user-1'],
    enabled: !user, // Only fetch if user data wasn't passed in
  });

  // Use passed user data or fetched data
  const currentUser = user || fetchedUser;

  // Weather state
  const [weather, setWeather] = useState({
    temperature: 75,
    condition: "partly cloudy",
    windSpeed: 8,
    humidity: 65
  });

  // Fetch weather data using Open-Meteo API
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 5000,
            enableHighAccuracy: false
          });
        });

        const { latitude, longitude } = position.coords;
        
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=relative_humidity_2m&timezone=auto&temperature_unit=fahrenheit&wind_speed_unit=mph`
        );

        if (response.ok) {
          const data = await response.json();
          const current = data.current_weather;
          const hourly = data.hourly;
          const currentIndex = hourly.time.findIndex((time: string) => time === new Date().toISOString().slice(0, 13) + ':00') || 0;
          
          const getWeatherDescription = (code: number) => {
            const weatherCodes: { [key: number]: string } = {
              0: 'clear sky', 1: 'mainly clear', 2: 'partly cloudy', 3: 'overcast',
              45: 'fog', 48: 'fog', 51: 'light drizzle', 53: 'moderate drizzle',
              55: 'dense drizzle', 61: 'slight rain', 63: 'moderate rain',
              65: 'heavy rain', 80: 'rain showers', 95: 'thunderstorm'
            };
            return weatherCodes[code] || 'partly cloudy';
          };
          
          setWeather({
            temperature: Math.round(current.temperature),
            condition: getWeatherDescription(current.weathercode),
            windSpeed: Math.round(current.windspeed),
            humidity: hourly.relative_humidity_2m[currentIndex] || 65
          });
        }
      } catch (err) {
        // Keep default fallback values
        console.log('Using fallback weather data');
      }
    };

    fetchWeather();
  }, []);

  // Get user's tee time bookings
  const { data: userTeetimes = [] } = useQuery<TeeTime[]>({
    queryKey: ['/api/teetimes/user', currentUser?.id],
    enabled: !!currentUser?.id,
  });

  const { data: allOrders = [] } = useQuery<Order[]>({
    queryKey: ['/api/orders'],
  });

  // Filter orders for current user only
  const userOrders = allOrders.filter((order: Order) => order.userId === currentUser?.id);
  
  // Get recent orders (within last 30 days)
  const recentOrders = userOrders.filter((order: Order) => {
    if (!order.createdAt) return false;
    const orderDate = new Date(order.createdAt);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return orderDate >= thirtyDaysAgo;
  }).sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

  // Filter for recent tee times (past and upcoming within 30 days)
  const recentTeetimes = userTeetimes.filter((teetime: TeeTime) => {
    const teetimeDate = new Date(teetime.date); // Remove time part for date comparison
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
    return teetimeDate >= thirtyDaysAgo && teetimeDate <= thirtyDaysFromNow;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort by most recent first


  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F6F0]">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="animate-pulse space-y-6 lg:space-y-8">
            <div className="h-48 sm:h-56 lg:h-64 bg-gray-300 rounded-2xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 sm:h-72 lg:h-80 bg-gray-300 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F6F0]">
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8 max-w-7xl mx-auto pb-20 lg:pb-8">
      {/* Modern Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#08452e] leading-tight">
            Welcome Back{currentUser?.firstName && currentUser?.lastName 
              ? `, ${currentUser.firstName} ${currentUser.lastName}` 
              : userEmail ? `, ${userEmail}` : ""}
          </h1>
          <div className="text-xs sm:text-sm text-muted-foreground">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })} • {new Date().toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            })}
          </div>
        </div>
        <p className="text-muted-foreground">Your personalized golf club dashboard</p>
      </div>
      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 lg:mb-8">
        <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 shadow-sm">
          <CardContent className="p-4 sm:p-6 text-center">
            <Link href="/tee-times">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-golf-green-soft rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6 sm:w-7 sm:h-7 text-golf-green" />
              </div>
              <h3 className="font-semibold text-foreground mb-1 text-sm sm:text-base">Book Tee Time</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Reserve your preferred slot</p>
            </Link>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 shadow-sm">
          <CardContent className="p-4 sm:p-6 text-center">
            <Link href="/dining">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-golf-orange/10 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                <Utensils className="w-6 h-6 sm:w-7 sm:h-7 text-golf-orange" />
              </div>
              <h3 className="font-semibold text-foreground mb-1 text-sm sm:text-base">Order Food</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Browse clubhouse menu</p>
            </Link>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 shadow-sm">
          <CardContent className="p-6 text-center">
            <Link href="/conditions">
              <div className="w-14 h-14 bg-golf-blue/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <MapPin className="w-7 h-7 text-golf-blue" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">Course Conditions</h3>
              <p className="text-sm text-muted-foreground">Latest course updates</p>
            </Link>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 shadow-sm">
          <CardContent className="p-6 text-center">
            <Link href="/events">
              <div className="w-14 h-14 bg-golf-purple/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Trophy className="w-7 h-7 text-golf-purple" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">Club Events</h3>
              <p className="text-sm text-muted-foreground">View tournament schedule</p>
            </Link>
          </CardContent>
        </Card>
      </div>
      {/* Your Activity Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-[#08452e] mb-6">Your Activity</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-golf-green-soft rounded-2xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-golf-green" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Recent Tee Times</h3>
                    <p className="text-sm text-muted-foreground">Last 30 days</p>
                  </div>
                </div>
                <div className="text-3xl font-bold text-golf-green">{recentTeetimes.length}</div>
              </div>
              <div className="max-h-32 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-stone-300 scrollbar-track-stone-100">
                {recentTeetimes.map((teetime: TeeTime, index: number) => (
                  <div key={teetime.id || index} className="flex items-center justify-between text-sm py-1">
                    <span className="text-muted-foreground">{format(new Date(teetime.date), 'MMM dd')} • {teetime.time}</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      teetime.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      teetime.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {teetime.status}
                    </span>
                  </div>
                ))}
                {recentTeetimes.length === 0 && (
                  <p className="text-muted-foreground text-sm italic">No recent tee times</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-golf-orange/10 rounded-2xl flex items-center justify-center">
                    <Utensils className="w-6 h-6 text-golf-orange" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Recent Orders</h3>
                    <p className="text-sm text-muted-foreground">Last 30 days</p>
                  </div>
                </div>
                <div className="text-3xl font-bold text-golf-orange">{recentOrders.length}</div>
              </div>
              <div className="max-h-32 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-stone-300 scrollbar-track-stone-100">
                {recentOrders.map((order: Order, index: number) => (
                  <div key={order.id || index} className="flex items-center justify-between text-sm py-1">
                    <span className="text-muted-foreground">${order.total} • Clubhouse</span>
                    <span className={`px-2 py-1 rounded text-xs capitalize ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      order.status === 'preparing' ? 'bg-orange-100 text-orange-700' :
                      order.status === 'ready' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {order.status || 'placed'}
                    </span>
                  </div>
                ))}
                {recentOrders.length === 0 && (
                  <p className="text-muted-foreground text-sm italic">No recent orders</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Course Conditions Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Today's Weather */}
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Sun className="w-5 h-5 text-golf-green" />
              <h3 className="text-lg font-semibold text-[#08452e]">Today's Weather</h3>
            </div>
            
            <div className="text-center mb-6">
              <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-6 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center shadow-lg">
                <Sun className="h-8 w-8 text-white" />
              </div>
              <div className="text-4xl font-bold text-foreground mb-2">{weather.temperature}°F</div>
              <p className="text-muted-foreground capitalize text-lg">{weather.condition}</p>
            </div>

            <div className="grid grid-cols-2 gap-6 text-center">
              <div className="bg-stone-50 rounded-xl p-4">
                <Wind className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                <p className="text-lg font-semibold text-foreground">{weather.windSpeed} mph</p>
                <p className="text-xs text-muted-foreground">Wind Speed</p>
              </div>
              <div className="bg-stone-50 rounded-xl p-4">
                <Droplets className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                <p className="text-lg font-semibold text-foreground">{weather.humidity}%</p>
                <p className="text-xs text-muted-foreground">Humidity</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Club Status */}
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-6">
              <MapPin className="w-5 h-5 text-golf-green" />
              <h3 className="text-lg font-semibold text-[#08452e]">Club Status</h3>
            </div>
            
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <p className="font-semibold text-green-800">Course Open</p>
                  </div>
                  <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded">9-Hole</span>
                </div>
                <p className="text-sm text-green-700">Packanack Golf Club is open for play</p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Utensils className="w-4 h-4 text-blue-600" />
                    <p className="font-semibold text-blue-800">Clubhouse Dining</p>
                  </div>
                  <span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded">Open</span>
                </div>
                <p className="text-sm text-blue-700">Full menu available • Pickup & delivery</p>
              </div>
              
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-stone-600" />
                    <p className="font-semibold text-stone-800">Tee Times</p>
                  </div>
                  <span className="text-sm text-stone-600 bg-stone-100 px-2 py-1 rounded">Available</span>
                </div>
                <p className="text-sm text-stone-700">Book online • Walk-ins welcome</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </div>
  );
}

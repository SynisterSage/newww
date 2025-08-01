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

  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ['/api/orders'],
  });

  // Filter for recent tee times (past and upcoming within 30 days)
  const recentTeetimes = userTeetimes.filter((teetime: TeeTime) => {
    const teetimeDate = new Date(`${teetime.date}T${teetime.time}`);
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
    return teetimeDate >= thirtyDaysAgo && teetimeDate <= thirtyDaysFromNow;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort by most recent first

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F6F0]">
        <div className="p-4 lg:p-8">
          <div className="animate-pulse space-y-8">
            <div className="h-64 bg-gray-300 rounded-2xl"></div>
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-80 bg-gray-300 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F6F0]">
      <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Modern Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-[#08452e]">
            Welcome Back{currentUser?.firstName && currentUser?.lastName 
              ? `, ${currentUser.firstName} ${currentUser.lastName}` 
              : userEmail ? `, ${userEmail}` : ""}
          </h1>
          <div className="text-sm text-muted-foreground">
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 shadow-sm">
          <CardContent className="p-6 text-center">
            <Link href="/tee-times">
              <div className="w-14 h-14 bg-golf-green-soft rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Calendar className="w-7 h-7 text-golf-green" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">Book Tee Time</h3>
              <p className="text-sm text-muted-foreground">Reserve your preferred slot</p>
            </Link>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 shadow-sm">
          <CardContent className="p-6 text-center">
            <Link href="/dining">
              <div className="w-14 h-14 bg-golf-orange/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Utensils className="w-7 h-7 text-golf-orange" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">Order Food</h3>
              <p className="text-sm text-muted-foreground">Browse clubhouse menu</p>
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
      {/* Your Stats Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-foreground mb-6">Your Stats</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-golf-green-soft rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-6 h-6 text-golf-green" />
              </div>
              <div className="text-2xl font-bold text-foreground mb-1">{recentTeetimes.length}</div>
              <div className="text-sm text-muted-foreground">Recent Tee Times</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-golf-orange/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Utensils className="w-6 h-6 text-golf-orange" />
              </div>
              <div className="text-2xl font-bold text-foreground mb-1">{orders.filter((o: Order) => {
                const orderDate = new Date(o.createdAt || Date.now());
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return orderDate >= weekAgo;
              }).length}</div>
              <div className="text-sm text-muted-foreground">Recent Orders</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-golf-blue/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-golf-blue" />
              </div>
              <div className="text-2xl font-bold text-foreground mb-1">{recentTeetimes.filter((t: TeeTime) => {
                const teetimeDate = new Date(t.date);
                const now = new Date();
                return teetimeDate.getMonth() === now.getMonth() && teetimeDate.getFullYear() === now.getFullYear();
              }).length} Rounds</div>
              <div className="text-sm text-muted-foreground">This Month</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-golf-purple/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-golf-purple" />
              </div>
              <div className="text-2xl font-bold text-foreground mb-1">Par -2</div>
              <div className="text-sm text-muted-foreground">Best Score</div>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Two sections */}
        <div className="lg:col-span-2 space-y-8">
          {/* Upcoming Tee Times */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Calendar className="w-5 h-5" />
                <h3 className="text-lg font-semibold text-foreground">Recent Tee Times</h3>
              </div>
              <div className="space-y-3">
                {recentTeetimes.slice(0, 3).map((teetime: TeeTime, index: number) => (
                  <div key={teetime.id || index} className="flex items-center space-x-3">
                    <div className="bg-golf-green p-2 rounded-full">
                      <Clock className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{format(new Date(teetime.date), 'MMM dd')} at {teetime.time}</p>
                      <p className="text-sm text-muted-foreground">{teetime.holes} holes • {teetime.status}</p>
                    </div>
                    <span className={`text-sm px-2 py-1 rounded ${
                      teetime.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      teetime.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      new Date(`${teetime.date}T${teetime.time}`) > new Date() ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {teetime.status === 'pending' ? 'Pending' : 
                       teetime.status === 'confirmed' ? 'Confirmed' :
                       new Date(`${teetime.date}T${teetime.time}`) > new Date() ? 'Upcoming' : 'Completed'}
                    </span>
                  </div>
                ))}
                {recentTeetimes.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">No recent tee times</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Utensils className="w-5 h-5" />
                <h3 className="text-lg font-semibold text-foreground">Recent Orders</h3>
              </div>
              <div className="space-y-3">
                {orders.slice(0, 3).map((order: Order, index: number) => (
                  <div key={order.id || index} className="flex items-center space-x-3">
                    <div className="bg-orange-500 p-2 rounded-full">
                      <Utensils className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">${typeof order.total === 'string' ? order.total : '160.00'}</p>
                      <p className="text-sm text-muted-foreground">19th Hole Bar</p>
                    </div>
                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {order.status || 'placed'}
                    </span>
                  </div>
                ))}
                {orders.length === 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="bg-orange-500 p-2 rounded-full">
                        <Utensils className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">$160.00</p>
                        <p className="text-sm text-muted-foreground">19th Hole Bar</p>
                      </div>
                      <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        placed
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="bg-orange-500 p-2 rounded-full">
                        <Utensils className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">$40.00</p>
                        <p className="text-sm text-muted-foreground">19th Hole Bar</p>
                      </div>
                      <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                        delivered
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="bg-orange-500 p-2 rounded-full">
                        <Utensils className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">$124.00</p>
                        <p className="text-sm text-muted-foreground">Clubhouse Dining</p>
                      </div>
                      <span className="text-sm bg-orange-100 text-orange-800 px-2 py-1 rounded">
                        preparing
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Course Conditions */}
        <div>
          <Card className="border-0 shadow-sm h-full">
            <CardContent className="p-6 h-full flex flex-col">
              <div className="flex items-center space-x-2 mb-6">
                <Sun className="w-5 h-5" />
                <h3 className="text-lg font-semibold text-foreground">Course Conditions</h3>
              </div>
              
              {/* Weather */}
              <div className="text-center mb-6">
                <div className="bg-blue-500 p-6 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <Sun className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl font-bold">{weather.temperature}°F</div>
                <p className="text-muted-foreground capitalize">{weather.condition}</p>
              </div>

              {/* Conditions */}
              <div className="grid grid-cols-2 gap-4 text-center mb-6">
                <div>
                  <Wind className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                  <p className="text-sm font-medium">{weather.windSpeed} mph</p>
                  <p className="text-xs text-muted-foreground">Wind</p>
                </div>
                <div>
                  <Droplets className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                  <p className="text-sm font-medium">{weather.humidity}%</p>
                  <p className="text-xs text-muted-foreground">Humidity</p>
                </div>
              </div>

              {/* Course Status - Push to bottom */}
              <div className="mt-auto bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <p className="font-medium text-green-800">Perfect Golf Weather!</p>
                </div>
                <p className="text-sm text-green-700 text-center">Ideal conditions for your round today</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </div>
  );
}

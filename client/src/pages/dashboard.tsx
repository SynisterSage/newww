import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Utensils, MapPin, User, Trophy } from "lucide-react";
import { Link } from "wouter";
import type { User as UserType } from "@shared/schema";

export default function Dashboard() {
  const { data: user, isLoading } = useQuery<UserType>({
    queryKey: ['/api/user/user-1'],
  });

  if (isLoading) {
    return (
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
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Modern Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-4xl font-bold text-foreground">Welcome Back</h1>
          <div className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>
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
            <Link href="/gps">
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
            <div className="w-14 h-14 bg-golf-purple/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Trophy className="w-7 h-7 text-golf-purple" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">Club Events</h3>
            <p className="text-sm text-muted-foreground">View tournament schedule</p>
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
              <div className="text-2xl font-bold text-foreground mb-1">{user?.handicap || 18}</div>
              <div className="text-sm text-muted-foreground">Handicap</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-golf-orange/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Trophy className="w-6 h-6 text-golf-orange" />
              </div>
              <div className="text-2xl font-bold text-foreground mb-1">{user?.roundsPlayed || 47}</div>
              <div className="text-sm text-muted-foreground">Rounds Played</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-golf-blue/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <User className="w-6 h-6 text-golf-blue" />
              </div>
              <div className="text-2xl font-bold text-foreground mb-1">${user?.accountBalance || "285"}</div>
              <div className="text-sm text-muted-foreground">Account Balance</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-golf-purple/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Trophy className="w-6 h-6 text-golf-purple" />
              </div>
              <div className="text-2xl font-bold text-foreground mb-1">{user?.memberStatus || "Gold"}</div>
              <div className="text-sm text-muted-foreground">Member Status</div>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Upcoming Tee Times */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Upcoming Tee Times</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-golf-green-soft rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-golf-green" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">Tomorrow 8:20 AM</h4>
                    <p className="text-sm text-muted-foreground">Championship Course</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-golf-green">Confirmed</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-golf-green-soft rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-golf-green" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">Saturday 9:00 AM</h4>
                    <p className="text-sm text-muted-foreground">Championship Course</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-golf-green">Confirmed</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Recent Orders</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-golf-orange/10 rounded-lg flex items-center justify-center">
                    <Utensils className="w-5 h-5 text-golf-orange" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">Prime Rib Special</h4>
                    <p className="text-sm text-muted-foreground">Today 12:30 PM</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-golf-green">Delivered</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-golf-orange/10 rounded-lg flex items-center justify-center">
                    <Utensils className="w-5 h-5 text-golf-orange" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">Coffee & Pastry</h4>
                    <p className="text-sm text-muted-foreground">Yesterday 8:00 AM</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-golf-green">Delivered</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Course Conditions Widget */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-golf-green-soft to-golf-blue/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Course Conditions</h3>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-golf-green rounded-full"></div>
              <span>Live</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-golf-blue/20 rounded-2xl flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">☀️</span>
              </div>
              <div className="text-2xl font-bold text-foreground">75°F</div>
              <div className="text-sm text-muted-foreground">Partly Cloudy</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-golf-green-soft rounded-2xl flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">💨</span>
              </div>
              <div className="text-2xl font-bold text-foreground">8 mph</div>
              <div className="text-sm text-muted-foreground">Wind</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-golf-blue/20 rounded-2xl flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">💧</span>
              </div>
              <div className="text-2xl font-bold text-foreground">65%</div>
              <div className="text-sm text-muted-foreground">Humidity</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-golf-green-soft rounded-2xl flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">⛳</span>
              </div>
              <div className="text-lg font-bold text-golf-green">Perfect!</div>
              <div className="text-sm text-muted-foreground">Golf Weather</div>
            </div>
          </div>
          
          <div className="p-3 rounded-lg pt-[11px] pb-[11px] mt-[27px] mb-[27px] bg-[#fafafa]">
            <p className="text-sm text-golf-green font-medium text-center">
              Perfect Golf Weather! Ideal conditions for your round today
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

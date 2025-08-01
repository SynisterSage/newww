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
    <div className="p-4 lg:p-8 space-y-8">
      {/* Header */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div 
            className="relative h-48 lg:h-64 bg-cover bg-center"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=600')`
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-golf-green/80 to-transparent"></div>
            <div className="absolute bottom-6 left-6 text-white">
              <h1 className="text-3xl lg:text-4xl font-bold mb-2">Welcome to Oakwood</h1>
              <p className="text-lg opacity-90">Championship Golf at its Finest</p>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <div className="text-2xl font-bold text-golf-green">{user?.handicap || 18}</div>
                <div className="text-sm text-gray-600">Handicap</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <div className="text-2xl font-bold text-golf-green">{user?.roundsPlayed || 47}</div>
                <div className="text-sm text-gray-600">Rounds Played</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <div className="text-2xl font-bold text-golf-green">${user?.accountBalance || "285"}</div>
                <div className="text-sm text-gray-600">Account Balance</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <div className="text-2xl font-bold text-golf-green">{user?.memberStatus || "Gold"}</div>
                <div className="text-sm text-gray-600">Member Status</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Tee Times Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-golf-green rounded-lg flex items-center justify-center">
                <Calendar className="text-white text-xl" />
              </div>
              <span className="text-sm text-golf-gold font-medium">Book Now</span>
            </div>
            <h3 className="text-xl font-semibold text-golf-green mb-2">Tee Times</h3>
            <p className="text-gray-600 mb-4">Reserve your preferred tee time for the championship course</p>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span>Next Available:</span>
                <span className="font-medium">Tomorrow 8:20 AM</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Peak Time:</span>
                <span className="font-medium">Weekend 9:00 AM</span>
              </div>
            </div>
            <Link href="/tee-times">
              <Button className="w-full bg-golf-gold hover:bg-golf-gold/90 text-white">
                Book Tee Time
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Dining Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-golf-green rounded-lg flex items-center justify-center">
                <Utensils className="text-white text-xl" />
              </div>
              <span className="text-sm text-golf-gold font-medium">Order Now</span>
            </div>
            <h3 className="text-xl font-semibold text-golf-green mb-2">Clubhouse Dining</h3>
            <p className="text-gray-600 mb-4">Enjoy gourmet cuisine with our premium dining service</p>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span>Kitchen Hours:</span>
                <span className="font-medium">6:00 AM - 9:00 PM</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Special Today:</span>
                <span className="font-medium">Prime Rib Lunch</span>
              </div>
            </div>
            <Link href="/dining">
              <Button className="w-full bg-golf-gold hover:bg-golf-gold/90 text-white">
                View Menu
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* GPS Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-golf-green rounded-lg flex items-center justify-center">
                <MapPin className="text-white text-xl" />
              </div>
              <span className="text-sm text-golf-gold font-medium">Navigate</span>
            </div>
            <h3 className="text-xl font-semibold text-golf-green mb-2">Course GPS</h3>
            <p className="text-gray-600 mb-4">Advanced GPS tracking with hole-by-hole guidance</p>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span>Course Length:</span>
                <span className="font-medium">7,248 yards</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Par:</span>
                <span className="font-medium">72</span>
              </div>
            </div>
            <Link href="/gps">
              <Button className="w-full bg-golf-gold hover:bg-golf-gold/90 text-white">
                Launch GPS
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Reservations */}
      <Card>
        <CardContent className="p-6 lg:p-8">
          <h2 className="text-2xl font-semibold text-golf-green mb-6">Upcoming Reservations</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-golf-green rounded-lg flex items-center justify-center">
                  <Trophy className="text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-golf-green">Tee Time - Championship Course</h4>
                  <p className="text-sm text-gray-600">Tomorrow, March 15 at 8:20 AM</p>
                </div>
              </div>
              <span className="text-golf-gold font-medium">Confirmed</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-golf-green rounded-lg flex items-center justify-center">
                  <Utensils className="text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-golf-green">Dinner Reservation - Main Dining</h4>
                  <p className="text-sm text-gray-600">Saturday, March 18 at 7:00 PM</p>
                </div>
              </div>
              <span className="text-golf-gold font-medium">Confirmed</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

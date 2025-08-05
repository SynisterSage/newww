import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, UtensilsCrossed, Users, Clock, CheckCircle, AlertCircle, TrendingUp, Trophy, RotateCcw, CloudSun } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import type { TeeTime, Order, User } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface AdminDashboardProps {
  adminEmail?: string;
}

export default function AdminDashboard({ adminEmail }: AdminDashboardProps) {
  const today = format(new Date(), 'yyyy-MM-dd');
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Fetch tee times for today
  const { data: teetimes = [] } = useQuery<TeeTime[]>({
    queryKey: ['/api/teetimes', today],
    refetchInterval: 3000, // Auto-refresh every 3 seconds like orders
    refetchIntervalInBackground: true, // Continue polling when tab inactive
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0, // Always fetch fresh data
  });

  // Fetch tee times for tomorrow to catch recent bookings
  const tomorrow = format(new Date(Date.now() + 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
  const { data: tomorrowTeetimes = [] } = useQuery<TeeTime[]>({
    queryKey: ['/api/teetimes', tomorrow],
    refetchInterval: 3000,
    refetchIntervalInBackground: true,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  // Combine today and tomorrow tee times for recent activity
  const allTeetimes = [...teetimes, ...tomorrowTeetimes];

  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ['/api/orders'],
    refetchInterval: 3000, // Auto-refresh every 3 seconds like orders
    refetchIntervalInBackground: true, // Continue polling when tab inactive
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0, // Always fetch fresh data
  });

  const { data: members = [] } = useQuery<User[]>({
    queryKey: ['/api/admin/members'],
    refetchInterval: 10000, // Auto-refresh every 10 seconds (less frequent)
    refetchIntervalInBackground: true, // Continue polling when tab inactive
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0, // Always fetch fresh data
  });

  // Fetch recent events for activity feed - real-time updates like orders
  const { data: recentEvents = [] } = useQuery<Event[]>({
    queryKey: ['/api/events/all'],
    refetchInterval: 3000, // Auto-refresh every 3 seconds like orders
    refetchIntervalInBackground: true,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0, // Always fetch fresh data like orders
  });

  // Reset test data mutation
  const resetTestDataMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/admin/reset-test-data"),
    onSuccess: async () => {
      toast({
        title: "Test data reset successfully",
        description: "All events, bookings, orders, and conditions have been reset.",
      });
      
      // Comprehensive cache invalidation to clear all data immediately
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['/api/teetimes'] }),
        queryClient.invalidateQueries({ queryKey: ['/api/orders'] }),
        queryClient.invalidateQueries({ queryKey: ['/api/events'] }),
        queryClient.invalidateQueries({ queryKey: ['/api/events/all'] }),
        queryClient.invalidateQueries({ queryKey: ['/api/course/conditions'] }),
        queryClient.invalidateQueries({ queryKey: ['/api/admin/members'] }),
        // Clear all event-related queries
        queryClient.invalidateQueries({ predicate: (query) => 
          Array.isArray(query.queryKey) && query.queryKey[0] === "/api/events"
        }),
        // Force refetch to ensure immediate updates
        queryClient.refetchQueries({ queryKey: ['/api/events'] }),
        queryClient.refetchQueries({ queryKey: ['/api/events/all'] }),
      ]);
    },
    onError: () => {
      toast({
        title: "Error resetting test data",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  // Calculate stats with proper filtering - count BOOKED tee times (slots with bookings)
  const todaysTeetimes = teetimes.filter(t => {
    // Only count tee times for today that have bookings
    if (t.date !== today) return false;
    
    // Check if tee time has any bookings
    const currentPlayers = t.bookedBy?.length || 0;
    
    return currentPlayers > 0; // Only count if there are bookings
  }).length;
  const todaysActiveOrders = orders.filter(o => {
    const orderDate = new Date(o.createdAt || Date.now());
    const today = new Date();
    return orderDate.toDateString() === today.toDateString();
  }).length;

  // Sort recent orders by creation date (most recent first)
  const recentOrders = [...orders]
    .filter(o => o.createdAt) // Only orders with timestamp
    .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
    .slice(0, 3);

  // Filter and sort recent tee times from today and tomorrow
  const recentTeetimes = [...allTeetimes]
    .filter(t => {
      const hasBookingsById = t.bookedBy && t.bookedBy.length > 0;
      const hasBookingsByName = t.playerNames && t.playerNames.length > 0 && t.playerNames.some(name => name && name.trim());
      const hasBooking = hasBookingsById || hasBookingsByName;
      
      console.log(`Admin Dashboard Tee time ${t.time} on ${t.date}:`, {
        hasBookingsById,
        hasBookingsByName, 
        hasBooking,
        bookedBy: t.bookedBy,
        playerNames: t.playerNames
      });
      
      return hasBooking;
    })
    .sort((a, b) => {
      // Sort by date first (more recent first), then by time
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      if (dateA !== dateB) return dateB - dateA;
      
      // Sort by time slot (later times first within same day)
      const timeA = a.time.includes('PM') ? parseInt(a.time) + 12 : parseInt(a.time);
      const timeB = b.time.includes('PM') ? parseInt(b.time) + 12 : parseInt(b.time);
      return timeB - timeA;
    })
    .slice(0, 5); // Show more recent bookings
  // Sort recent events (event registrations and event creation)
  const recentEventActivity = [...recentEvents]
    .filter(e => (e as any).createdAt) // Only events with timestamp
    .sort((a, b) => new Date((b as any).createdAt).getTime() - new Date((a as any).createdAt).getTime())
    .slice(0, 2); // Limit to 2 most recent events
  
  const recentActivity = [
    ...recentTeetimes.map(t => {
      const playersList = t.playerNames?.filter(name => name && name.trim()) || [];
      const memberNames = t.bookedBy?.map(userId => {
        const member = members.find(m => m.id === userId);
        return member ? `${member.firstName} ${member.lastName}` : 'Member';
      }).filter(Boolean) || [];
      
      const displayNames = playersList.length > 0 ? playersList : memberNames;
      
      return {
        type: 'tee-time',
        title: `Tee Time Booked - ${t.time} (${t.date})`,
        subtitle: `${displayNames.join(', ') || 'Players'} • ${t.holes || '18'} holes`,
        time: format(new Date(), 'MMM dd, h:mm a'), // Use current time since we don't store booking timestamp
        status: 'booked'
      };
    }),
    ...recentOrders.map(o => {
      const member = members.find(m => m.id === o.userId);
      const memberName = member ? `${member.firstName} ${member.lastName}` : 'Member';
      return {
        type: 'order',
        title: `Food Order - ${memberName}`,
        subtitle: `${o.items.length} items • $${o.total}`,
        time: format(new Date(o.createdAt || Date.now()), 'MMM dd, h:mm a'),
        status: o.status
      };
    }),
    ...recentEventActivity.map(e => {
      return {
        type: 'event',
        title: `Event Created - ${(e as any).title}`,
        subtitle: `${(e as any).category} • ${(e as any).date} at ${(e as any).time}`,
        time: format(new Date((e as any).createdAt || Date.now()), 'MMM dd, h:mm a'),
        status: 'created'
      };
    })
  ].slice(0, 5);

  return (
    <div className="min-h-screen bg-[#F8F6F0]">
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-blue-800">Admin Dashboard{adminEmail ? `, ${adminEmail}` : ""}</h1>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => resetTestDataMutation.mutate()}
                disabled={resetTestDataMutation.isPending}
                className="flex items-center gap-2"
                data-testid="button-reset-test-data"
              >
                <RotateCcw className="w-4 h-4" />
                {resetTestDataMutation.isPending ? 'Resetting...' : 'Reset Test Data'}
              </Button>
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
          </div>
          <p className="text-muted-foreground">Manage club operations and member requests</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Today's Tee Times</p>
                  <p className="text-2xl font-bold text-slate-800">{todaysTeetimes}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Orders</p>
                  <p className="text-2xl font-bold text-slate-800">{todaysActiveOrders}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <UtensilsCrossed className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Members</p>
                  <p className="text-2xl font-bold text-slate-800">{members.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 shadow-sm">
            <CardContent className="p-6 text-center">
              <Link href="/admin/tee-times">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Calendar className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">Manage Tee Times</h3>
                <p className="text-sm text-muted-foreground">Review and approve bookings</p>
              </Link>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 shadow-sm">
            <CardContent className="p-6 text-center">
              <Link href="/admin/orders">
                <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <UtensilsCrossed className="w-7 h-7 text-orange-600" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">Kitchen Orders</h3>
                <p className="text-sm text-muted-foreground">Track food preparation</p>
              </Link>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 shadow-sm">
            <CardContent className="p-6 text-center">
              <Link href="/admin/members">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Users className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">Member Management</h3>
                <p className="text-sm text-muted-foreground">View member profiles</p>
              </Link>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 shadow-sm">
            <CardContent className="p-6 text-center">
              <Link href="/admin/events">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Trophy className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">Events</h3>
                <p className="text-sm text-muted-foreground">Manage tournaments</p>
              </Link>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 shadow-sm">
            <CardContent className="p-6 text-center">
              <Link href="/admin/conditions">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <CloudSun className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">Course Conditions</h3>
                <p className="text-sm text-muted-foreground">Adjust course rules</p>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-slate-800">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length > 0 ? recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      activity.type === 'tee-time' ? 'bg-blue-100' : 
                      activity.type === 'event' ? 'bg-purple-100' : 'bg-orange-100'
                    }`}>
                      {activity.type === 'tee-time' ? (
                        <Calendar className="w-5 h-5 text-blue-600" />
                      ) : activity.type === 'event' ? (
                        <Trophy className="w-5 h-5 text-purple-600" />
                      ) : (
                        <UtensilsCrossed className="w-5 h-5 text-orange-600" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-800">{activity.title}</h4>
                      <p className="text-sm text-muted-foreground">{activity.subtitle}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-muted-foreground">{activity.time}</span>
                    <span className={`px-2 py-1 text-xs rounded-md ${
                      activity.type === 'tee-time' ? 'bg-green-100 text-green-700' :
                      activity.type === 'event' ? 'bg-purple-100 text-purple-700' :
                      activity.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      activity.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {activity.type === 'tee-time' ? 'booked' : 
                       activity.type === 'event' ? 'created' : activity.status}
                    </span>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8">
                  <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">No recent activity</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
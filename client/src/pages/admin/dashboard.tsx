import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, UtensilsCrossed, Users, Clock, CheckCircle, AlertCircle, TrendingUp, Trophy, RotateCcw } from "lucide-react";
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
  
  const { data: teetimes = [] } = useQuery<TeeTime[]>({
    queryKey: ['/api/teetimes', today],
    refetchInterval: 3000, // Auto-refresh every 3 seconds like orders
    refetchIntervalInBackground: true, // Continue polling when tab inactive
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0, // Always fetch fresh data
  });

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

  // Fetch recent events for activity feed - explicitly type as Event array
  const { data: recentEvents = [] } = useQuery<Event[]>({
    queryKey: ['/api/events/all'],
    refetchInterval: 3000, // Same as orders for consistency
    refetchIntervalInBackground: true,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  // Reset test data mutation
  const resetTestDataMutation = useMutation({
    mutationFn: () => apiRequest("/api/admin/reset-test-data", "POST"),
    onSuccess: () => {
      toast({
        title: "Test data reset successfully",
        description: "All events, bookings, orders, and conditions have been reset.",
      });
      // Invalidate all related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/teetimes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      queryClient.invalidateQueries({ queryKey: ['/api/course/conditions'] });
    },
    onError: () => {
      toast({
        title: "Error resetting test data",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  // Calculate stats
  const todaysTeetimes = teetimes.length;
  const pendingOrders = orders.filter(o => {
    const orderDate = new Date(o.createdAt || Date.now());
    const today = new Date();
    return orderDate.toDateString() === today.toDateString();
  }).length;

  // Filter tee times with actual bookings (bookedBy array has entries or playerNames has entries)
  const bookedTeetimes = teetimes.filter(t => {
    const hasBookingsById = t.bookedBy && t.bookedBy.length > 0;
    const hasBookingsByName = t.playerNames && t.playerNames.length > 0 && t.playerNames.some(name => name && name.trim());
    const isToday = t.date === today;
    
    console.log(`Tee time ${t.time} on ${t.date}:`, {
      hasBookingsById,
      hasBookingsByName, 
      bookedBy: t.bookedBy,
      playerNames: t.playerNames,
      isToday,
      today
    });
    
    return (hasBookingsById || hasBookingsByName) && isToday;
  });

  // Sort recent orders by creation date (most recent first)
  const recentOrders = [...orders]
    .filter(o => o.createdAt) // Only orders with timestamp
    .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
    .slice(0, 3);

  // Sort recent tee times by booking time (most recent first)  
  const recentTeetimes = [...bookedTeetimes]
    .sort((a, b) => {
      // Sort by time slot (later times first for today)
      const timeA = a.time.includes('PM') ? parseInt(a.time) + 12 : parseInt(a.time);
      const timeB = b.time.includes('PM') ? parseInt(b.time) + 12 : parseInt(b.time);
      return timeB - timeA;
    })
    .slice(0, 3);
  // Sort recent events (event registrations and event creation)
  const recentEventActivity = [...recentEvents]
    .filter(e => e.createdAt) // Only events with timestamp
    .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
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
        title: `Tee Time - ${t.time}`,
        subtitle: `${displayNames.join(', ') || 'Players'} • ${t.holes || '18'} holes`,
        time: format(new Date(t.date), 'MMM dd'),
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
        title: `Event Created - ${e.title}`,
        subtitle: `${e.category} • ${e.date} at ${e.time}`,
        time: format(new Date(e.createdAt || Date.now()), 'MMM dd, h:mm a'),
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
                  <p className="text-2xl font-bold text-slate-800">{pendingOrders}</p>
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
                      activity.type === 'tee-time' ? 'bg-blue-100' : 'bg-orange-100'
                    }`}>
                      {activity.type === 'tee-time' ? (
                        <Calendar className="w-5 h-5 text-blue-600" />
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
                      activity.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      activity.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {activity.type === 'tee-time' ? 'booked' : activity.status}
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
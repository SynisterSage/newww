import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, UtensilsCrossed, Users, Clock, CheckCircle, AlertCircle, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import type { TeeTime, Order } from "@shared/schema";

interface AdminDashboardProps {
  adminEmail?: string;
}

export default function AdminDashboard({ adminEmail }: AdminDashboardProps) {
  const today = format(new Date(), 'yyyy-MM-dd');
  
  const { data: teetimes = [] } = useQuery<TeeTime[]>({
    queryKey: ['/api/teetimes', today],
  });

  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ['/api/orders'],
  });

  // Calculate stats
  const todaysTeetimes = teetimes.length;
  const pendingOrders = orders.filter(o => {
    const orderDate = new Date(o.createdAt || Date.now());
    const today = new Date();
    return orderDate.toDateString() === today.toDateString();
  }).length;

  const recentActivity = [
    ...teetimes.slice(0, 3).map(t => ({
      type: 'tee-time',
      title: `Tee Time Booking - ${t.time}`,
      subtitle: `${t.holes} holes`,
      time: format(new Date(t.date), 'MMM dd'),
      status: 'pending'
    })),
    ...orders.slice(0, 3).map(o => ({
      type: 'order',
      title: 'Food Order',
      subtitle: `${JSON.parse(o.items[0] || '{}').quantity || 1} items`,
      time: format(new Date(o.createdAt || Date.now()), 'MMM dd'),
      status: 'pending'
    }))
  ].slice(0, 5);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard{adminEmail ? `, ${adminEmail}` : ""}</h1>
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
                  <p className="text-2xl font-bold text-slate-800">247</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
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
                <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Users className="w-7 h-7 text-green-600" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">Member Management</h3>
                <p className="text-sm text-muted-foreground">View member profiles</p>
              </Link>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 shadow-sm">
            <CardContent className="p-6 text-center">
              <Link href="/admin/events">
                <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Calendar className="w-7 h-7 text-purple-600" />
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
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-md">
                      Pending
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
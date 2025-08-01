import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User as UserIcon, CheckCircle, XCircle, Users, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import type { TeeTime, User } from "@shared/schema";

export default function AdminTeeTimesPage() {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState("2025-08-01");

  // Fetch all tee times for the selected date
  const { data: teetimes = [], isLoading } = useQuery<TeeTime[]>({
    queryKey: ['/api/teetimes', selectedDate],
    queryFn: () => fetch(`/api/teetimes?date=${selectedDate}`).then(res => res.json()),
  });

  // Fetch all members to get user details
  const { data: members = [] } = useQuery<User[]>({
    queryKey: ['/api/admin/members'],
  });

  // Approve tee time request
  const approveMutation = useMutation({
    mutationFn: async (teetimeId: string) => {
      const response = await apiRequest('PATCH', `/api/admin/teetimes/${teetimeId}/approve`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teetimes'] });
      toast({
        title: "Tee Time Approved",
        description: "The tee time request has been approved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Approval Failed",
        description: "Unable to approve the tee time request.",
        variant: "destructive",
      });
    },
  });

  // Deny tee time request
  const denyMutation = useMutation({
    mutationFn: async (teetimeId: string) => {
      const response = await apiRequest('PATCH', `/api/admin/teetimes/${teetimeId}/deny`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teetimes'] });
      toast({
        title: "Tee Time Denied",
        description: "The tee time request has been denied.",
      });
    },
    onError: () => {
      toast({
        title: "Denial Failed",
        description: "Unable to deny the tee time request.",
        variant: "destructive",
      });
    },
  });

  // Get member details by user ID
  const getMemberDetails = (userId: string | null) => {
    if (!userId) return null;
    return members.find(member => member.id === userId);
  };

  // Filter tee times by status
  const pendingRequests = teetimes.filter(tt => tt.status === "pending" && tt.userId);
  const approvedTeetimes = teetimes.filter(tt => tt.status === "booked" && tt.userId);
  const availableTeetimes = teetimes.filter(tt => tt.status === "available");

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'booked': return 'bg-green-100 text-green-800';
      case 'available': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Generate date options for today (8/1) and tomorrow (8/2) only
  const getDateOptions = () => {
    return [
      { value: "2025-08-01", label: "Today (8/1)" },
      { value: "2025-08-02", label: "Tomorrow (8/2)" }
    ];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F6F0] p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4 w-1/3"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F6F0]">
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#08452e] mb-2">Tee Time Management</h1>
          <p className="text-muted-foreground">Manage member tee time requests and bookings</p>
        </div>

        {/* Date Selector */}
        <div className="mb-8">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#08452e]" />
              <span className="font-medium text-[#08452e]">Select Date:</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {getDateOptions().map(option => (
                <Button
                  key={option.value}
                  variant={selectedDate === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedDate(option.value)}
                  className={selectedDate === option.value ? 
                    "bg-[#08452e] hover:bg-[#08452e]/90" : 
                    "hover:bg-[#08452e]/10"
                  }
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{pendingRequests.length}</p>
              <p className="text-sm text-muted-foreground">Pending Requests</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{approvedTeetimes.length}</p>
              <p className="text-sm text-muted-foreground">Approved</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{availableTeetimes.length}</p>
              <p className="text-sm text-muted-foreground">Available</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <MapPin className="h-6 w-6 text-gray-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{teetimes.length}</p>
              <p className="text-sm text-muted-foreground">Total Slots</p>
            </CardContent>
          </Card>
        </div>

        {/* Pending Requests Section */}
        {pendingRequests.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-[#08452e] mb-4">Pending Requests</h2>
            <div className="space-y-4">
              {pendingRequests.map((teetime) => {
                const member = getMemberDetails(teetime.userId);
                return (
                  <Card key={teetime.id} className="border-0 shadow-sm bg-white border-l-4 border-yellow-400">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <div className="w-16 h-16 bg-yellow-50 rounded-lg flex items-center justify-center mb-2">
                              <Clock className="h-8 w-8 text-yellow-600" />
                            </div>
                            <p className="font-bold text-lg text-gray-900">{teetime.time}</p>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <UserIcon className="h-5 w-5 text-gray-500" />
                              <span className="font-semibold text-gray-900">
                                {member ? `${member.firstName} ${member.lastName}` : 'Unknown Member'}
                              </span>
                              <Badge className={getStatusColor(teetime.status)} >
                                {teetime.status.charAt(0).toUpperCase() + teetime.status.slice(1)}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                              <p><span className="font-medium">Member #:</span> {member?.memberNumber || 'N/A'}</p>
                              <p><span className="font-medium">Phone:</span> {member?.phone || 'N/A'}</p>
                              <p><span className="font-medium">Holes:</span> {teetime.holes}</p>
                              <p><span className="font-medium">Spots:</span> {teetime.spotsAvailable}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <Button
                            onClick={() => approveMutation.mutate(teetime.id)}
                            disabled={approveMutation.isPending}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            onClick={() => denyMutation.mutate(teetime.id)}
                            disabled={denyMutation.isPending}
                            variant="destructive"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Deny
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* All Tee Times Section */}
        <div>
          <h2 className="text-xl font-semibold text-[#08452e] mb-4">All Tee Times - {selectedDate === "2025-08-01" ? "8/1/2025" : "8/2/2025"}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {teetimes.map((teetime) => {
              const member = getMemberDetails(teetime.userId);
              return (
                <Card key={teetime.id} className="border-0 shadow-sm bg-white">
                  <CardContent className="p-6">
                    <div className="text-center mb-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
                        teetime.status === 'pending' ? 'bg-yellow-100' :
                        teetime.status === 'booked' ? 'bg-green-100' : 'bg-blue-100'
                      }`}>
                        <Clock className={`h-6 w-6 ${
                          teetime.status === 'pending' ? 'text-yellow-600' :
                          teetime.status === 'booked' ? 'text-green-600' : 'text-blue-600'
                        }`} />
                      </div>
                      <p className="font-bold text-xl text-gray-900 mb-1">{teetime.time}</p>
                      <Badge className={getStatusColor(teetime.status)}>
                        {teetime.status.charAt(0).toUpperCase() + teetime.status.slice(1)}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-sm">
                      {member && (
                        <p className="text-center">
                          <span className="font-medium text-gray-900">
                            {member.firstName} {member.lastName}
                          </span>
                        </p>
                      )}
                      <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                        <p><span className="font-medium">Holes:</span> {teetime.holes}</p>
                        <p><span className="font-medium">Spots:</span> {teetime.spotsAvailable}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {teetimes.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No tee times available for {new Date(selectedDate).toLocaleDateString()}</p>
          </div>
        )}
      </div>
    </div>
  );
}
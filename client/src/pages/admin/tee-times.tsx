import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Users, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface TeeTime {
  id: string;
  date: string;
  time: string;
  course: string;
  holes: number;
  players: number;
  bookedBy: string;
  bookedEmail: string;
  status: string;
  price: string;
  notes?: string;
  createdAt: string;
}

export default function AdminTeeTimesPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: teeTimes = [], isLoading } = useQuery<TeeTime[]>({
    queryKey: ["/api", "admin", "teetimes"],
    enabled: true,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await apiRequest("PATCH", `/api/admin/teetimes/${id}`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api", "admin", "teetimes"] });
    },
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      available: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      booked: { color: "bg-blue-100 text-blue-800", icon: AlertCircle },
      confirmed: { color: "bg-emerald-100 text-emerald-800", icon: CheckCircle },
      cancelled: { color: "bg-red-100 text-red-800", icon: XCircle },
      premium: { color: "bg-purple-100 text-purple-800", icon: AlertCircle },
    };
    
    const variant = variants[status as keyof typeof variants] || variants.booked;
    const Icon = variant.icon;
    
    return (
      <Badge className={`${variant.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const filteredTeeTimes = teeTimes.filter((teeTime: TeeTime) => {
    const matchesStatus = statusFilter === "all" || teeTime.status === statusFilter;
    const matchesSearch = 
      teeTime.bookedBy?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teeTime.bookedEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teeTime.date.includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-golf-green">Tee Time Management</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by member name, email, or date..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="booked">Booked</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="premium">Premium</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tee Times Grid */}
      <div className="grid gap-4">
        {filteredTeeTimes.map((teeTime: TeeTime) => (
          <Card key={teeTime.id} className="border border-gray-200 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-golf-green" />
                      <span className="font-medium">{format(new Date(teeTime.date), "MMM dd, yyyy")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-golf-green" />
                      <span className="font-medium">{teeTime.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-golf-green" />
                      <span className="font-medium">{teeTime.players} players</span>
                    </div>
                  </div>
                  
                  {teeTime.bookedBy && (
                    <div className="text-sm text-gray-600">
                      <p><strong>Member:</strong> {teeTime.bookedBy}</p>
                      <p><strong>Email:</strong> {teeTime.bookedEmail}</p>
                      {teeTime.notes && <p><strong>Notes:</strong> {teeTime.notes}</p>}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4">
                    {getStatusBadge(teeTime.status)}
                    <span className="text-lg font-semibold text-golf-green">${teeTime.price}</span>
                    <span className="text-sm text-gray-500">
                      {teeTime.holes} holes • {teeTime.course}
                    </span>
                  </div>
                </div>

                {/* Status Actions */}
                <div className="flex flex-wrap gap-2">
                  {teeTime.status === "booked" && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateStatusMutation.mutate({ id: teeTime.id, status: "confirmed" })}
                        disabled={updateStatusMutation.isPending}
                        className="text-green-600 border-green-200 hover:bg-green-50"
                      >
                        Confirm
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateStatusMutation.mutate({ id: teeTime.id, status: "cancelled" })}
                        disabled={updateStatusMutation.isPending}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                  
                  {teeTime.status === "confirmed" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateStatusMutation.mutate({ id: teeTime.id, status: "cancelled" })}
                      disabled={updateStatusMutation.isPending}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      Cancel
                    </Button>
                  )}
                  
                  {teeTime.status === "cancelled" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateStatusMutation.mutate({ id: teeTime.id, status: "available" })}
                      disabled={updateStatusMutation.isPending}
                      className="text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                      Reopen
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTeeTimes.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tee times found</h3>
            <p className="text-gray-500">
              {searchQuery || statusFilter !== "all" 
                ? "Try adjusting your search or filter criteria"
                : "No tee time bookings available"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
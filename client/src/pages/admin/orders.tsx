import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, User, CheckCircle, XCircle, AlertCircle, ChefHat } from "lucide-react";
import { format } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface Order {
  id: string;
  memberName: string;
  memberEmail: string;
  items: string[];
  total: string;
  status: string;
  specialRequests?: string;
  estimatedTime?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminOrdersPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ["/api", "admin", "orders"],
    enabled: true,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, estimatedTime }: { id: string; status: string; estimatedTime?: string }) => {
      const response = await apiRequest("PATCH", `/api/admin/orders/${id}`, { 
        status, 
        ...(estimatedTime && { estimatedTime }),
        updatedAt: new Date().toISOString()
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api", "admin", "orders"] });
    },
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { color: "bg-yellow-100 text-yellow-800", icon: AlertCircle },
      confirmed: { color: "bg-blue-100 text-blue-800", icon: CheckCircle },
      preparing: { color: "bg-orange-100 text-orange-800", icon: ChefHat },
      ready: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      delivered: { color: "bg-emerald-100 text-emerald-800", icon: CheckCircle },
      cancelled: { color: "bg-red-100 text-red-800", icon: XCircle },
    };
    
    const variant = variants[status as keyof typeof variants] || variants.pending;
    const Icon = variant.icon;
    
    return (
      <Badge className={`${variant.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getNextStatusActions = (currentStatus: string) => {
    const actions = {
      pending: [
        { status: "confirmed", label: "Confirm", color: "text-blue-600 border-blue-200 hover:bg-blue-50" },
        { status: "cancelled", label: "Cancel", color: "text-red-600 border-red-200 hover:bg-red-50" }
      ],
      confirmed: [
        { status: "preparing", label: "Start Preparing", color: "text-orange-600 border-orange-200 hover:bg-orange-50" },
        { status: "cancelled", label: "Cancel", color: "text-red-600 border-red-200 hover:bg-red-50" }
      ],
      preparing: [
        { status: "ready", label: "Ready for Pickup", color: "text-green-600 border-green-200 hover:bg-green-50" }
      ],
      ready: [
        { status: "delivered", label: "Mark Delivered", color: "text-emerald-600 border-emerald-200 hover:bg-emerald-50" }
      ],
      delivered: [],
      cancelled: [
        { status: "pending", label: "Reopen", color: "text-blue-600 border-blue-200 hover:bg-blue-50" }
      ]
    };
    
    return actions[currentStatus as keyof typeof actions] || [];
  };

  const filteredOrders = orders.filter((order: Order) => {
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesSearch = 
      order.memberName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.memberEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase());
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
        <h1 className="text-3xl font-bold text-golf-green">Order Management</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by member name, email, or order ID..."
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
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="preparing">Preparing</SelectItem>
            <SelectItem value="ready">Ready</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders Grid */}
      <div className="grid gap-4">
        {filteredOrders.map((order: Order) => (
          <Card key={order.id} className="border border-gray-200 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-golf-green" />
                      <span className="font-medium">{order.memberName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-golf-green" />
                      <span className="text-sm text-gray-600">
                        {format(new Date(order.createdAt), "MMM dd, h:mm a")}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <p><strong>Order ID:</strong> {order.id.slice(0, 8)}</p>
                    <p><strong>Email:</strong> {order.memberEmail}</p>
                    <p><strong>Items:</strong> {order.items.length} items</p>
                    {order.specialRequests && (
                      <p><strong>Special Requests:</strong> {order.specialRequests}</p>
                    )}
                    {order.estimatedTime && (
                      <p><strong>Estimated Time:</strong> {order.estimatedTime}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {getStatusBadge(order.status)}
                    <span className="text-lg font-semibold text-golf-green">${order.total}</span>
                    {order.updatedAt !== order.createdAt && (
                      <span className="text-xs text-gray-400">
                        Updated {format(new Date(order.updatedAt), "MMM dd, h:mm a")}
                      </span>
                    )}
                  </div>
                </div>

                {/* Status Actions */}
                <div className="flex flex-wrap gap-2">
                  {getNextStatusActions(order.status).map((action) => (
                    <Button
                      key={action.status}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const estimatedTime = action.status === "preparing" ? "15-20 mins" : undefined;
                        updateStatusMutation.mutate({ 
                          id: order.id, 
                          status: action.status,
                          estimatedTime
                        });
                      }}
                      disabled={updateStatusMutation.isPending}
                      className={action.color}
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <ChefHat className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-500">
              {searchQuery || statusFilter !== "all" 
                ? "Try adjusting your search or filter criteria"
                : "No dining orders available"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
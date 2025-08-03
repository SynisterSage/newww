import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Clock, User as UserIcon, UtensilsCrossed, CheckCircle, XCircle, ChefHat } from "lucide-react";
import type { Order, User, MenuItem } from "@shared/schema";

export default function AdminOrdersPage() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Fetch all orders
  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ['/api/orders'],
  });

  // Fetch all members to get user details
  const { data: members = [] } = useQuery<User[]>({
    queryKey: ['/api/admin/members'],
  });

  // Fetch menu items to get order details
  const { data: menuItems = [] } = useQuery<MenuItem[]>({
    queryKey: ['/api/menu'],
  });

  // Update order status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const response = await apiRequest('PATCH', `/api/admin/orders/${orderId}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      toast({
        title: "Order Updated",
        description: "Order status has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Unable to update order status.",
        variant: "destructive",
      });
    },
  });

  // Get member details by user ID
  const getMemberDetails = (userId: string | null) => {
    if (!userId) return null;
    return members.find(member => member.id === userId);
  };

  // Get menu item details
  const getMenuItemDetails = (itemId: string) => {
    return menuItems.find(item => item.id === itemId);
  };

  // Parse order items
  const parseOrderItems = (items: string[]) => {
    return items.map(itemStr => {
      try {
        // Handle double-escaped JSON from database
        let cleanedStr = itemStr;
        if (typeof itemStr === 'string' && itemStr.startsWith('{"')) {
          // Remove extra escaping
          cleanedStr = itemStr.replace(/\\"/g, '"');
        }
        
        const parsed = JSON.parse(cleanedStr);
        const itemId = parsed.itemId || parsed.id;
        const menuItem = getMenuItemDetails(itemId);
        
        // Check if the parsed item has a custom name (with options) or use the display name
        const itemName = parsed.name || menuItem?.name || `Item ${itemId?.slice(0, 8) || 'Unknown'}`;
        
        return {
          id: itemId,
          name: itemName,
          quantity: parsed.quantity || 1,
          price: menuItem?.price || '0.00',
          options: parsed.options || []
        };
      } catch (error) {
        console.error('Error parsing order item:', itemStr, error);
        return { 
          id: 'unknown', 
          name: `Raw: ${itemStr.slice(0, 20)}...`, 
          quantity: 1, 
          price: '0.00',
          options: []
        };
      }
    });
  };

  // Filter orders by status
  const filteredOrders = orders.filter(order => {
    if (statusFilter === "all") return true;
    return order.status === statusFilter;
  });

  // Sort orders by status priority and creation date
  const sortedOrders = filteredOrders.sort((a, b) => {
    const statusPriority = { pending: 0, preparing: 1, ready: 2, delivered: 3 };
    const aPriority = statusPriority[a.status as keyof typeof statusPriority] ?? 4;
    const bPriority = statusPriority[b.status as keyof typeof statusPriority] ?? 4;
    
    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }
    
    // Sort by creation date (newest first)
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'preparing': return 'bg-blue-100 text-blue-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-5 w-5" />;
      case 'preparing': return <ChefHat className="h-5 w-5" />;
      case 'ready': return <CheckCircle className="h-5 w-5" />;
      case 'delivered': return <CheckCircle className="h-5 w-5" />;
      default: return <Clock className="h-5 w-5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F6F0] p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4 w-1/3"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
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
          <h1 className="text-3xl font-bold text-blue-800 mb-2">Order Management</h1>
          <p className="text-muted-foreground">Manage member food and beverage orders</p>
        </div>

        {/* Status Filter and Stats */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Orders</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="preparing">Preparing</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Order Stats */}
            <div className="flex gap-4">
              {['pending', 'preparing', 'ready'].map(status => {
                const count = orders.filter(order => order.status === status).length;
                return (
                  <div key={status} className="text-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-1 ${
                      status === 'pending' ? 'bg-yellow-100' :
                      status === 'preparing' ? 'bg-blue-100' : 'bg-green-100'
                    }`}>
                      {getStatusIcon(status)}
                    </div>
                    <p className="font-bold text-lg">{count}</p>
                    <p className="text-sm text-muted-foreground capitalize">{status}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {sortedOrders.length === 0 && (
            <div className="text-center py-12">
              <UtensilsCrossed className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {statusFilter === "all" ? "No orders found" : `No ${statusFilter} orders found`}
              </p>
            </div>
          )}

          {sortedOrders.map((order) => {
            const member = getMemberDetails(order.userId);
            const orderItems = parseOrderItems(order.items);
            
            return (
              <Card key={order.id} className={`border-0 shadow-sm bg-white ${
                order.status === 'pending' ? 'border-l-4 border-yellow-400' :
                order.status === 'preparing' ? 'border-l-4 border-blue-400' :
                order.status === 'ready' ? 'border-l-4 border-green-400' : ''
              }`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className={`w-16 h-16 rounded-lg flex items-center justify-center mb-2 ${
                          order.status === 'pending' ? 'bg-yellow-50' :
                          order.status === 'preparing' ? 'bg-blue-50' :
                          order.status === 'ready' ? 'bg-green-50' : 'bg-gray-50'
                        }`}>
                          {getStatusIcon(order.status)}
                        </div>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <UserIcon className="h-5 w-5 text-gray-500" />
                          <span className="font-semibold text-gray-900">
                            {member ? `${member.firstName} ${member.lastName}` : 'Unknown Member'}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-3">
                          <p><span className="font-medium">Order #:</span> {order.id.slice(-8)}</p>
                          <p><span className="font-medium">Member #:</span> {member?.memberNumber || 'N/A'}</p>
                          <p><span className="font-medium">Phone:</span> {member?.phone || 'N/A'}</p>
                          <p><span className="font-medium">Total:</span> ${order.total}</p>
                        </div>

                        {order.createdAt && (
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium">Ordered:</span> {new Date(order.createdAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Status Update Controls */}
                    {order.status !== 'delivered' && (
                      <div className="flex gap-2">
                        {order.status === 'pending' && (
                          <Button
                            onClick={() => updateStatusMutation.mutate({ orderId: order.id, status: 'preparing' })}
                            disabled={updateStatusMutation.isPending}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            size="sm"
                          >
                            Start Preparing
                          </Button>
                        )}
                        {order.status === 'preparing' && (
                          <Button
                            onClick={() => updateStatusMutation.mutate({ orderId: order.id, status: 'ready' })}
                            disabled={updateStatusMutation.isPending}
                            className="bg-green-600 hover:bg-green-700 text-white"
                            size="sm"
                          >
                            Mark Ready
                          </Button>
                        )}
                        {order.status === 'ready' && (
                          <Button
                            onClick={() => updateStatusMutation.mutate({ orderId: order.id, status: 'delivered' })}
                            disabled={updateStatusMutation.isPending}
                            className="bg-gray-600 hover:bg-gray-700 text-white"
                            size="sm"
                          >
                            Mark Delivered
                          </Button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Order Items */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-900 mb-3">Order Items:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {orderItems.map((item, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{item.name}</p>
                              {item.options && item.options.length > 0 && (
                                <p className="text-xs text-green-600 font-medium mt-1">
                                  + {item.options.join(', ')}
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground mt-1">Qty: {item.quantity}</p>
                            </div>
                            <p className="font-medium text-sm">${(parseFloat(item.price) * item.quantity).toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Information */}
                  <div className="border-t pt-4 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Delivery Information:</h4>
                        <div className="bg-blue-50 rounded-lg p-3">
                          <p className="text-sm">
                            <span className="font-medium">Method:</span> {order.deliveryOption || 'Clubhouse Pickup'}
                          </p>
                          {order.deliveryLocation && (
                            <p className="text-sm mt-1">
                              <span className="font-medium">Location:</span> {order.deliveryLocation}
                            </p>
                          )}
                        </div>
                      </div>

                      {order.specialRequests && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Special Requests / Allergens:</h4>
                          <div className="bg-yellow-50 rounded-lg p-3">
                            <p className="text-sm">{order.specialRequests}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { ShoppingCart, Plus, Minus, Trash2, X } from "lucide-react";
import type { MenuItem } from "@shared/schema";

export default function Dining() {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentOrder, setCurrentOrder] = useState<{[key: string]: number}>({});
  const [deliveryOption, setDeliveryOption] = useState("Clubhouse Pickup");
  const [selectedHole, setSelectedHole] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);

  const { data: menuItems = [], isLoading } = useQuery<MenuItem[]>({
    queryKey: ['/api/menu', selectedCategory === "All" ? undefined : selectedCategory],
  });

  const orderMutation = useMutation({
    mutationFn: async (orderData: { userId: string; items: string[]; total: string; deliveryOption: string; deliveryLocation?: string }) => {
      const response = await apiRequest('POST', '/api/orders', orderData);
      return response.json();
    },
    onSuccess: () => {
      setCurrentOrder({});
      setIsCartOpen(false);
      toast({
        title: "Order Placed",
        description: "Your order has been sent to the kitchen!",
      });
    },
    onError: () => {
      toast({
        title: "Order Failed",
        description: "Unable to place your order. Please try again.",
        variant: "destructive",
      });
    },
  });

  const addToOrder = (itemId: string) => {
    setCurrentOrder(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1
    }));
    // Don't auto-open cart when adding items
  };

  const removeFromOrder = (itemId: string) => {
    setCurrentOrder(prev => {
      const newOrder = { ...prev };
      if (newOrder[itemId] > 1) {
        newOrder[itemId]--;
      } else {
        delete newOrder[itemId];
      }
      return newOrder;
    });
  };

  const clearOrder = () => {
    setCurrentOrder({});
  };

  const calculateTotal = () => {
    return Object.entries(currentOrder).reduce((total, [itemId, quantity]) => {
      const item = menuItems.find(item => item.id === itemId);
      return total + (item ? parseFloat(item.price) * quantity : 0);
    }, 0);
  };

  const placeOrder = () => {
    if (Object.keys(currentOrder).length === 0) return;
    
    const orderItems = Object.entries(currentOrder).map(([itemId, quantity]) => 
      JSON.stringify({ itemId, quantity })
    );
    
    orderMutation.mutate({
      userId: 'user-1',
      items: orderItems,
      total: calculateTotal().toFixed(2),
      deliveryOption,
      deliveryLocation: deliveryOption === "Deliver on Course" ? `Hole ${selectedHole}` : undefined
    });
  };

  const filteredItems = selectedCategory === "All" 
    ? menuItems
    : menuItems.filter(item => item.category === selectedCategory);

  const totalItems = Object.values(currentOrder).reduce((sum, count) => sum + count, 0);
  const orderTotal = calculateTotal();

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <div className="flex-1 p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-20 bg-muted rounded-xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-48 bg-muted rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
        <div className="w-96 bg-muted"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile Cart Overlay */}
      {isCartOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsCartOpen(false)}
        />
      )}
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-4 sm:p-6 max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-golf-green mb-2">Order Food & Drinks</h1>
                <p className="text-muted-foreground text-sm sm:text-base">From the clubhouse to the course</p>
              </div>
              
              {/* View Cart Button */}
              <Button 
                onClick={() => setIsCartOpen(true)}
                className="bg-golf-gold hover:bg-golf-gold/90 text-black font-medium w-full sm:w-auto"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                View Cart{totalItems > 0 && ` (${totalItems})`}
              </Button>
            </div>
          </div>

          {/* Category Filter */}
          <div className="mb-6">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Categories</SelectItem>
                <SelectItem value="Appetizers">Appetizers</SelectItem>
                <SelectItem value="Mains">Main Course</SelectItem>
                <SelectItem value="Desserts">Desserts</SelectItem>
                <SelectItem value="Beverages">Beverages</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Menu Items Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 pb-6">
            {filteredItems.map((item) => (
              <Card key={item.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">{item.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{item.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-golf-green">${item.price}</span>
                        <Badge variant="secondary" className="text-xs">
                          {item.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center">
                    {currentOrder[item.id] ? (
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeFromOrder(item.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-8 text-center font-medium">
                          {currentOrder[item.id]}
                        </span>
                        <Button
                          size="sm"
                          onClick={() => addToOrder(item.id)}
                          className="h-8 w-8 p-0 bg-golf-green hover:bg-golf-green-light text-white"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => addToOrder(item.id)}
                        className="bg-golf-green hover:bg-golf-green-light text-white w-full sm:w-auto"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add to Order
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Order Sidebar */}
      <div className={`w-96 bg-card border-l border-border flex flex-col transition-transform duration-300 ${
        isCartOpen ? 'translate-x-0' : 'translate-x-full'
      } fixed right-0 top-0 h-full z-50`}>
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="w-5 h-5 text-foreground" />
              <h2 className="text-lg font-semibold text-foreground">Your Order</h2>
            </div>
            <div className="flex items-center space-x-2">
              {totalItems > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearOrder}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCartOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {totalItems === 0 ? (
            <div className="p-6 text-center">
              <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Your order is empty</p>
            </div>
          ) : (
            <div className="p-6">
              <div className="space-y-4">
                {Object.entries(currentOrder).map(([itemId, quantity]) => {
                  const item = menuItems.find(mi => mi.id === itemId);
                  if (!item) return null;
                  
                  return (
                    <div key={itemId} className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          ${item.price} • {item.category}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeFromOrder(itemId)}
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center text-sm">{quantity}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => addToOrder(itemId)}
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setCurrentOrder(prev => {
                              const newOrder = { ...prev };
                              delete newOrder[itemId];
                              return newOrder;
                            });
                          }}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {totalItems > 0 && (
          <div className="border-t border-border p-6 space-y-4">
            {/* Delivery Options */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Delivery Option
              </label>
              <Select value={deliveryOption} onValueChange={setDeliveryOption}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Clubhouse Pickup">Clubhouse Pickup</SelectItem>
                  <SelectItem value="Dine In">Dine In</SelectItem>
                  <SelectItem value="Deliver on Course">Deliver on Course</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {deliveryOption === "Deliver on Course" && (
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Select Hole
                </label>
                <Select value={selectedHole} onValueChange={setSelectedHole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose hole" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((hole) => (
                      <SelectItem key={hole} value={hole.toString()}>
                        Hole {hole}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Total */}
            <div className="border-t border-border pt-4">
              <div className="flex items-center justify-between text-lg font-bold text-foreground">
                <span>Total:</span>
                <span>${orderTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Place Order Button */}
            <Button
              onClick={placeOrder}
              disabled={orderMutation.isPending || (deliveryOption === "Deliver on Course" && !selectedHole)}
              className="w-full bg-golf-green hover:bg-golf-green-light text-white py-3"
            >
              {orderMutation.isPending ? "Placing Order..." : "Place Order"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
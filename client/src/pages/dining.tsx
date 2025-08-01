import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import MenuItemCard from "@/components/menu-item";
import { useState } from "react";
import { Utensils } from "lucide-react";
import type { MenuItem } from "@shared/schema";

export default function Dining() {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentOrder, setCurrentOrder] = useState<{[key: string]: number}>({});

  const { data: menuItems = [], isLoading } = useQuery<MenuItem[]>({
    queryKey: ['/api/menu', selectedCategory || undefined],
  });

  const orderMutation = useMutation({
    mutationFn: async (orderData: { userId: string; items: string[]; total: string }) => {
      const response = await apiRequest('POST', '/api/orders', orderData);
      return response.json();
    },
    onSuccess: () => {
      setCurrentOrder({});
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
    toast({
      title: "Item Added",
      description: "Item added to your order",
    });
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
      total: calculateTotal().toFixed(2)
    });
  };

  const groupedItems = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  const categoryNames = {
    appetizers: "Appetizers",
    main_course: "Main Course",
    beverages: "Beverages",
    desserts: "Desserts"
  };

  if (isLoading) {
    return (
      <div className="p-4 lg:p-8">
        <div className="animate-pulse space-y-8">
          <div className="h-32 bg-gray-300 rounded-2xl"></div>
          <div className="h-64 bg-gray-300 rounded-xl"></div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-4">
                <div className="h-8 bg-gray-300 rounded"></div>
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-32 bg-gray-300 rounded-xl"></div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-8">
      <Card>
        <CardContent className="p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-golf-green mb-2">Clubhouse Dining</h1>
              <p className="text-gray-600">Premium culinary experience with course views</p>
            </div>
            <div className="mt-4 lg:mt-0">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  <SelectItem value="appetizers">Appetizers</SelectItem>
                  <SelectItem value="main_course">Main Course</SelectItem>
                  <SelectItem value="beverages">Beverages</SelectItem>
                  <SelectItem value="desserts">Desserts</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Featured Dining Image */}
          <div 
            className="relative h-64 rounded-xl overflow-hidden mb-8 bg-cover bg-center"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1559329007-40df8a9345d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=600')`
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-6 left-6 text-white">
              <h2 className="text-2xl font-bold mb-2">The 19th Hole Restaurant</h2>
              <p className="text-lg opacity-90">Fine dining with championship course views</p>
            </div>
          </div>

          {/* Menu Categories */}
          {selectedCategory ? (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-golf-green border-b border-golf-gold pb-2">
                {categoryNames[selectedCategory as keyof typeof categoryNames]}
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedItems[selectedCategory]?.map((item) => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    quantity={currentOrder[item.id] || 0}
                    onAdd={() => addToOrder(item.id)}
                    onRemove={() => removeFromOrder(item.id)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Object.entries(groupedItems).map(([category, items]) => (
                <div key={category} className="space-y-4">
                  <h3 className="text-xl font-semibold text-golf-green border-b border-golf-gold pb-2">
                    {categoryNames[category as keyof typeof categoryNames]}
                  </h3>
                  {items.slice(0, 3).map((item) => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      quantity={currentOrder[item.id] || 0}
                      onAdd={() => addToOrder(item.id)}
                      onRemove={() => removeFromOrder(item.id)}
                    />
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* Order Summary */}
          <div className="mt-8 p-6 bg-gray-50 rounded-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-golf-green">Current Order</h3>
              <span className="text-sm text-gray-600">Table service available</span>
            </div>
            {Object.keys(currentOrder).length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Utensils className="mx-auto text-3xl mb-3" />
                <p>No items in your order yet</p>
                <p className="text-sm">Add items from the menu above</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(currentOrder).map(([itemId, quantity]) => {
                  const item = menuItems.find(item => item.id === itemId);
                  if (!item) return null;
                  
                  return (
                    <div key={itemId} className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">{item.name}</span>
                        <span className="text-gray-600 ml-2">x{quantity}</span>
                      </div>
                      <span className="font-semibold">${(parseFloat(item.price) * quantity).toFixed(2)}</span>
                    </div>
                  );
                })}
                <div className="border-t pt-4 flex justify-between items-center">
                  <span className="text-lg font-semibold">Total: ${calculateTotal().toFixed(2)}</span>
                  <button
                    onClick={placeOrder}
                    disabled={orderMutation.isPending}
                    className="bg-golf-gold hover:bg-golf-gold/90 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50"
                  >
                    {orderMutation.isPending ? "Placing Order..." : "Place Order"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

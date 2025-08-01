import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const [specialRequests, setSpecialRequests] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCartClosing, setIsCartClosing] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const { data: menuItems = [], isLoading } = useQuery<MenuItem[]>({
    queryKey: ['/api/menu'],
  });

  const orderMutation = useMutation({
    mutationFn: async (orderData: { userId: string; items: string[]; total: string; deliveryOption: string; deliveryLocation?: string; specialRequests?: string }) => {
      const response = await apiRequest('POST', '/api/orders', orderData);
      return response.json();
    },
    onSuccess: () => {
      setCurrentOrder({});
      setSpecialRequests("");
      closeCart();
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
    
    // Auto-open cart with animation
    setIsCartOpen(true);
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
    setSpecialRequests("");
  };

  const closeCart = () => {
    setIsCartClosing(true);
    setTimeout(() => {
      setIsCartOpen(false);
      setIsCartClosing(false);
    }, 300); // Match animation duration
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
      deliveryLocation: deliveryOption === "Deliver on Course" ? `Hole ${selectedHole}` : undefined,
      specialRequests: specialRequests || undefined
    });
  };

  const filteredItems = selectedCategory === "All" 
    ? menuItems
    : menuItems.filter(item => item.category === selectedCategory);

  const totalItems = Object.values(currentOrder).reduce((sum, count) => sum + count, 0);
  const orderTotal = calculateTotal();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F6F0]">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-20 bg-gray-300 rounded-xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="h-48 bg-gray-300 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F6F0]">
      {/* Mobile Cart Overlay */}
      {isCartOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsCartOpen(false)}
        />
      )}
      {/* Main Content */}
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-[#08452e]">Order Food & Drinks</h1>
              <p className="text-muted-foreground">From the clubhouse to the course</p>
            </div>
            
            {/* View Cart Button */}
            <Button 
              onClick={() => {
                if (!isCartClosing) {
                  setIsCartOpen(true);
                }
              }}
              className="bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-black font-medium w-full sm:w-auto"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              View Cart{totalItems > 0 && ` (${totalItems})`}
            </Button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {["All", "Mains", "Appetizers", "Desserts", "Beverages", "Wine", "Cocktails"].map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? "bg-[#1B4332] text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pb-6">
          {filteredItems.map((item) => {
            const isExpanded = expandedCard === item.id;
            return (
              <Card 
                key={item.id} 
                className={`bg-white border-0 shadow-sm hover:shadow-lg transition-all duration-200 rounded-lg overflow-hidden cursor-pointer ${
                  isExpanded ? 'h-auto' : 'h-48'
                } flex flex-col`}
                onClick={() => setExpandedCard(isExpanded ? null : item.id)}
              >
                <CardContent className="p-4 flex flex-col h-full">
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 text-base leading-tight flex-1 pr-2">{item.name}</h3>
                      <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-md whitespace-nowrap">
                        {item.category}
                      </span>
                    </div>
                    <p className={`text-sm text-gray-600 mb-3 leading-relaxed transition-all duration-200 ${
                      isExpanded ? 'line-clamp-none' : 'line-clamp-2'
                    }`}>
                      {item.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-auto pt-2">
                    <span className="text-lg font-bold text-gray-900">${item.price}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        addToOrder(item.id);
                      }}
                      className="border-[#1B4332] text-[#1B4332] hover:bg-[#1B4332] hover:text-white px-3 py-1.5 text-sm font-medium transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
      {/* Mobile Cart Modal */}
      {isCartOpen && (
        <div 
          className={`fixed inset-0 z-50 ${isCartClosing ? 'animate-out fade-out duration-200' : 'animate-in fade-in duration-200'}`}
          onClick={() => closeCart()}
        >
          <div 
            className={`fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-xl ${
              isCartClosing ? 'animate-out slide-out-to-right duration-300' : 'animate-in slide-in-from-right duration-300'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">Your Order</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeCart}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4">
                {Object.keys(currentOrder).length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500">Your cart is empty</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(currentOrder).map(([itemId, quantity]) => {
                      const item = menuItems.find(m => m.id === itemId);
                      if (!item) return null;
                      
                      return (
                        <div key={itemId} className="flex items-center space-x-3">
                          <div className="flex-1">
                            <h4 className="font-medium">{item.name}</h4>
                            <p className="text-sm text-gray-500">${item.price} each</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeFromOrder(item.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="w-8 text-center">{quantity}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => addToOrder(item.id)}
                              className="h-8 w-8 p-0 border-[#1B4332] text-[#1B4332] hover:bg-[#1B4332] hover:text-white transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
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
                            className="h-8 w-8 p-0 text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              
              {Object.keys(currentOrder).length > 0 && (
                <div className="border-t p-4 space-y-4">
                  <div className="space-y-3">
                    <Select value={deliveryOption} onValueChange={setDeliveryOption}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Clubhouse Pickup">Clubhouse Pickup</SelectItem>
                        <SelectItem value="Deliver on Course">Deliver on Course</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    {deliveryOption === "Deliver on Course" && (
                      <Select value={selectedHole} onValueChange={setSelectedHole}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Hole" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 9 }, (_, i) => (
                            <SelectItem key={i + 1} value={`${i + 1}`}>
                              Hole {i + 1}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    
                    {/* Special Requests */}
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Special Requests (Allergens, Notes)
                      </label>
                      <textarea
                        value={specialRequests}
                        onChange={(e) => setSpecialRequests(e.target.value)}
                        placeholder="Any special requests, dietary restrictions, or allergen information..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#1B4332] focus:border-transparent"
                        rows={3}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-lg font-semibold">
                    <span>Total:</span>
                    <span>${orderTotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={clearOrder}
                      className="flex-1"
                    >
                      Clear
                    </Button>
                    <Button
                      onClick={placeOrder}
                      disabled={orderMutation.isPending || (deliveryOption === "Deliver on Course" && !selectedHole)}
                      className="flex-1"
                    >
                      {orderMutation.isPending ? "Placing..." : "Place Order"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
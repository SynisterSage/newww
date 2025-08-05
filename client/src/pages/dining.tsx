import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { ShoppingCart, Plus, Minus, Trash2, X } from "lucide-react";
import type { MenuItem, User } from "@shared/schema";

interface DiningProps {
  userData?: User;
}

export default function Dining({ userData }: DiningProps) {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentOrder, setCurrentOrder] = useState<{[key: string]: {quantity: number, options: string[]}}>({});
  const [deliveryOption, setDeliveryOption] = useState("Clubhouse Pickup");
  const [selectedHole, setSelectedHole] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCartClosing, setIsCartClosing] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<{[itemId: string]: string[]}>({});

  // Function to format category names for display
  const formatCategoryName = (category: string) => {
    return category
      .replace(/_/g, ' ') // Replace underscores with spaces
      .replace(/\b\w/g, l => l.toUpperCase()); // Capitalize first letter of each word
  };

  const { data: menuItems = [], isLoading } = useQuery<MenuItem[]>({
    queryKey: ['/api/menu'],
    refetchInterval: 10000, // Auto-refresh every 10 seconds (less frequent than tee times/events)
    refetchIntervalInBackground: true, // Continue polling when tab inactive
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0, // Always fetch fresh data
  });

  const orderMutation = useMutation({
    mutationFn: async (orderData: { items: string[]; total: string; deliveryOption: string; deliveryLocation?: string; specialRequests?: string }) => {
      if (!userData?.id) {
        throw new Error("User not logged in");
      }
      
      const response = await apiRequest('POST', '/api/orders', {
        ...orderData,
        userId: userData.id
      });
      return response.json();
    },
    onSuccess: () => {
      // Comprehensive cache invalidation for real-time updates
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      queryClient.invalidateQueries({ predicate: (query) => 
        query.queryKey[0] === '/api/orders' || 
        (Array.isArray(query.queryKey) && query.queryKey[0] === '/api/orders')
      });
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
    const options = selectedOptions[itemId] || [];
    setCurrentOrder(prev => ({
      ...prev,
      [itemId]: {
        quantity: (prev[itemId]?.quantity || 0) + 1,
        options: options
      }
    }));
    
    // Auto-open cart with animation
    setIsCartOpen(true);
  };

  const removeFromOrder = (itemId: string) => {
    setCurrentOrder(prev => {
      const newOrder = { ...prev };
      if (newOrder[itemId]?.quantity > 1) {
        newOrder[itemId] = {
          ...newOrder[itemId],
          quantity: newOrder[itemId].quantity - 1
        };
      } else {
        delete newOrder[itemId];
      }
      return newOrder;
    });
  };

  const clearOrder = () => {
    setCurrentOrder({});
    setSpecialRequests("");
    setSelectedOptions({});
  };

  const toggleOption = (itemId: string, option: string) => {
    setSelectedOptions(prev => {
      const currentOptions = prev[itemId] || [];
      const isSelected = currentOptions.includes(option);
      
      let newOptions;
      if (isSelected) {
        newOptions = currentOptions.filter(opt => opt !== option);
      } else {
        newOptions = [...currentOptions, option];
      }
      
      // Update the current order with new options if item is already in cart
      setCurrentOrder(orderPrev => {
        if (orderPrev[itemId]) {
          return {
            ...orderPrev,
            [itemId]: {
              ...orderPrev[itemId],
              options: newOptions
            }
          };
        }
        return orderPrev;
      });
      
      return {
        ...prev,
        [itemId]: newOptions
      };
    });
  };

  const parseAvailableOptions = (availableSettings: string) => {
    // Split by semicolon and clean up each option
    return availableSettings
      .split(';')
      .map(option => option.trim())
      .filter(option => option.length > 0);
  };

  // Get price for specific options (some options have additional costs)
  const getOptionPrice = (option: string) => {
    const pricedOptions: {[key: string]: number} = {
      'French Fries': 4.75,
      'French Fries with Cheese': 6.00,
      'French Fries with Cheese & Bacon': 8.50,
      'Bacon': 3.00,
      'Sautéed Onions': 2.00,
      'American': 1.50,
      'Cheddar': 1.50,
      'Swiss Cheese': 1.50,
      'Blue Cheese': 1.50,
      'Sauerkraut': 1.00,
      'Salsa': 1.00,
      'Sour Cream': 1.00,
      'Buffalo': 0, // Wing sauces are free
      'BBQ': 0,
      'Sweet Thai Chili': 0,
      'Cajun': 0,
      'Mushrooms': 2.00,
      'Pepperoni': 2.50,
      'Peppers': 1.50,
      'Onions': 1.50,
      // Salad dressings are typically free
      'House-Made Balsamic': 0,
      'Champagne': 0,
      'Honey Mustard': 0,
      'Thousand Island': 0,
      'Ranch': 0,
      'EVOO & Balsamic Vinegar': 0,
      'Cole Slaw': 3.50,
      'Fresh Fruit Salad': 4.00
    };
    
    return pricedOptions[option] || 0;
  };

  const closeCart = () => {
    setIsCartClosing(true);
    setTimeout(() => {
      setIsCartOpen(false);
      setIsCartClosing(false);
    }, 300); // Match animation duration
  };

  const calculateTotal = () => {
    return Object.entries(currentOrder).reduce((total, [itemId, orderItem]) => {
      const item = menuItems.find(item => item.id === itemId);
      if (!item) return total;
      
      const basePrice = parseFloat(item.price);
      const optionsPrice = orderItem.options.reduce((optionTotal, option) => {
        return optionTotal + getOptionPrice(option);
      }, 0);
      
      return total + ((basePrice + optionsPrice) * orderItem.quantity);
    }, 0);
  };

  const placeOrder = () => {
    if (Object.keys(currentOrder).length === 0) return;
    
    const orderItems = Object.entries(currentOrder).map(([itemId, orderItem]) => {
      const item = menuItems.find(m => m.id === itemId);
      const itemName = item ? item.name : 'Unknown Item';
      const displayName = orderItem.options.length > 0 
        ? `${itemName} (${orderItem.options.join(', ')})` 
        : itemName;
      
      return JSON.stringify({ 
        itemId, 
        quantity: orderItem.quantity,
        name: displayName,
        options: orderItem.options
      });
    });
    
    orderMutation.mutate({
      items: orderItems,
      total: calculateTotal().toFixed(2),
      deliveryOption,
      deliveryLocation: deliveryOption === "Deliver on Course" ? `Hole ${selectedHole}` : undefined,
      specialRequests: specialRequests || undefined
    });
  };

  // Smart filtering based on time of day and available categories
  const getAvailableCategories = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour + (currentMinute / 60);
    const isDinnerTime = currentTime >= 18.5; // 6:30 PM
    
    // Get categories that actually have items
    const categoriesWithItems = Array.from(new Set(menuItems.map(item => item.category)));
    
    // Filter categories based on time of day
    const timeFilteredCategories = categoriesWithItems.filter(category => {
      if (isDinnerTime) {
        // During dinner time, exclude breakfast
        return category !== "Breakfast Corner";
      } else {
        // During lunch time, exclude dinner-specific items if any
        return true;
      }
    });
    
    return ["All", ...timeFilteredCategories];
  };

  const availableCategories = getAvailableCategories();
  
  // Reset to "All" if current category is not available
  if (!availableCategories.includes(selectedCategory)) {
    setSelectedCategory("All");
  }
  
  const filteredItems = selectedCategory === "All" 
    ? menuItems.filter(item => availableCategories.includes(item.category))
    : menuItems.filter(item => item.category === selectedCategory);

  const totalItems = Object.values(currentOrder).reduce((sum, orderItem) => sum + orderItem.quantity, 0);
  const orderTotal = calculateTotal();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F6F0]">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
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
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto pb-20 lg:pb-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-[#08452e]">Order Food & Drinks</h1>
              <p className="text-sm sm:text-base text-muted-foreground">From the clubhouse to the course</p>
              {/* Menu Time Indicator */}
              <div className="mt-2">
                {(() => {
                  const now = new Date();
                  const currentHour = now.getHours();
                  const currentMinute = now.getMinutes();
                  const currentTime = currentHour + (currentMinute / 60);
                  const isDinnerTime = currentTime >= 18.5; // 6:30 PM
                  
                  return (
                    <div className="inline-flex items-center gap-2 text-sm">
                      <div className={`w-2 h-2 rounded-full ${isDinnerTime ? 'bg-orange-500' : 'bg-green-500'}`}></div>
                      <span className="text-gray-600">
                        {isDinnerTime ? 'Dinner Menu' : 'Lunch Menu'} • Available until {isDinnerTime ? '11:00 PM' : '6:30 PM'}
                      </span>
                    </div>
                  );
                })()}
              </div>
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

        {/* Category Tabs - Only show available categories */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
            {availableCategories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                  selectedCategory === category
                    ? "bg-[#1B4332] text-white shadow-md"
                    : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:border-gray-300"
                }`}
              >
                {category === "Entrees – Seafood" ? "Seafood" :
                 category === "Entrees – Meat" ? "Meat" :
                 category === "Entrees – Chicken" ? "Chicken" :
                 category === "Packanacks Picks" ? "Packanack's Picks" :
                 category === "Chef Specialties" ? "Specialties" :
                 category === "Breakfast Corner" ? "Breakfast" :
                 category}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-6">
          {filteredItems.map((item) => {
            return (
              <Card 
                key={item.id} 
                className="bg-white border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-200 rounded-xl overflow-hidden h-72 flex flex-col relative"
              >
                <CardContent className="p-5 flex flex-col h-full">
                  <div className="flex-1 flex flex-col pt-[0px] pb-[0px] mt-[-1px] mb-[-1px]">
                    {/* Header with category badge and options indicator */}
                    <div className="flex items-start justify-between mb-3">
                      <span className="bg-green-100 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap">
                        {formatCategoryName(item.category)}
                      </span>
                      {item.availableSettings && (
                        <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                          Has Options
                        </span>
                      )}
                    </div>
                    
                    {/* Title - Fixed height for consistency */}
                    <div className="mb-3 h-16 flex items-start">
                      <h3 className="font-semibold text-gray-900 text-lg leading-tight mt-[9px] mb-[9px]">
                        {item.name}
                      </h3>
                    </div>
                    
                    {/* Description - Scrollable with clear scroll indicator */}
                    <div className="text-sm text-gray-600 mb-4 h-20 relative">
                      <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 pr-2">
                        <p className="leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                      {/* Scroll indicator - subtle gradient at bottom */}
                      <div className="absolute bottom-0 left-0 right-2 h-3 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
                    </div>
                  </div>
                  
                  {/* Footer with price and add button */}
                  <div className="flex items-center justify-between mt-auto border-t border-gray-100 pt-[6px] pb-[6px]">
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-bold text-[#1B4332]">${item.price}</span>
                    </div>
                    
                    {currentOrder[item.id]?.quantity ? (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromOrder(item.id);
                          }}
                          className="h-8 w-8 p-0 border-gray-300"
                          data-testid={`button-decrease-${item.id}`}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="font-medium text-sm min-w-[24px] text-center">
                          {currentOrder[item.id]?.quantity}
                        </span>
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            addToOrder(item.id);
                          }}
                          className="h-8 w-8 p-0 bg-[#1B4332] hover:bg-[#1B4332]/90"
                          data-testid={`button-increase-${item.id}`}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToOrder(item.id);
                        }}
                        className="bg-[#1B4332] hover:bg-[#1B4332]/90 text-white px-4"
                        data-testid={`button-add-${item.id}`}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                    )}
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
                    {Object.entries(currentOrder).map(([itemId, orderItem]) => {
                      const item = menuItems.find(m => m.id === itemId);
                      if (!item) return null;
                      
                      return (
                        <div key={itemId} className="border border-gray-200 rounded-lg p-4 bg-white">
                          {/* Item Header */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-base text-gray-900 leading-tight">{item.name}</h4>
                              <p className="text-sm text-gray-600 mt-1">Base price: ${item.price}</p>
                            </div>
                            <div className="flex items-center space-x-2 ml-3">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => removeFromOrder(itemId)}
                                className="h-8 w-8 p-0 flex-shrink-0"
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <span className="text-sm font-semibold w-8 text-center">{orderItem.quantity}</span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => addToOrder(itemId)}
                                className="h-8 w-8 p-0 flex-shrink-0"
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Simple Options Display */}
                          {orderItem.options.length > 0 && (
                            <p className="text-xs text-green-600 font-medium mt-1">
                              + {orderItem.options.join(', ')}
                            </p>
                          )}

                          {/* Simple Price Display */}
                          <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
                            <span className="text-sm text-gray-600">
                              ${(parseFloat(item.price) + orderItem.options.reduce((total, option) => total + getOptionPrice(option), 0)).toFixed(2)} × {orderItem.quantity}
                            </span>
                            <span className="font-semibold text-gray-900">
                              ${((parseFloat(item.price) + orderItem.options.reduce((total, option) => total + getOptionPrice(option), 0)) * orderItem.quantity).toFixed(2)}
                            </span>
                          </div>

                          {/* Options selection in cart */}
                          {item.availableSettings && (
                            <div className="border-t pt-3">
                              <p className="text-xs font-medium text-gray-700 mb-2">Available Options:</p>
                              <div className="grid grid-cols-1 gap-1">
                                {parseAvailableOptions(item.availableSettings).map((option, index) => {
                                  const isSelected = selectedOptions[itemId]?.includes(option) || false;
                                  const optionPrice = getOptionPrice(option);
                                  return (
                                    <button
                                      key={index}
                                      onClick={() => toggleOption(itemId, option)}
                                      className={`text-left px-2 py-1 rounded text-xs transition-colors ${
                                        isSelected
                                          ? 'bg-green-200 text-green-800 border border-green-300'
                                          : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-green-50'
                                      }`}
                                    >
                                      <span className="flex items-center justify-between w-full">
                                        <span className="flex items-center gap-2">
                                          <span className={`w-3 h-3 rounded border flex items-center justify-center ${
                                            isSelected ? 'bg-green-600 border-green-600' : 'border-gray-300'
                                          }`}>
                                            {isSelected && (
                                              <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                              </svg>
                                            )}
                                          </span>
                                          {option}
                                        </span>
                                        {optionPrice > 0 && (
                                          <span className="text-green-600 font-medium">
                                            +${optionPrice.toFixed(2)}
                                          </span>
                                        )}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              
              {Object.keys(currentOrder).length > 0 && (
                <div className="border-t p-4 space-y-4">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Delivery Option</label>
                      <Select value={deliveryOption} onValueChange={setDeliveryOption}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Clubhouse Pickup">Clubhouse Pickup</SelectItem>
                          <SelectItem value="Deliver on Course">Deliver on Course</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {deliveryOption === "Deliver on Course" && (
                      <div>
                        <label className="block text-sm font-medium mb-1">Hole Number</label>
                        <Select value={selectedHole} onValueChange={setSelectedHole}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select hole" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 18 }, (_, i) => i + 1).map((hole) => (
                              <SelectItem key={hole} value={hole.toString()}>
                                Hole {hole}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Special Requests / Allergens</label>
                      <textarea
                        value={specialRequests}
                        onChange={(e) => setSpecialRequests(e.target.value)}
                        placeholder="Any special requests, dietary restrictions, or allergens..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        rows={2}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="font-semibold text-lg">Total: ${orderTotal.toFixed(2)}</span>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={clearOrder} className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300">
                        <Trash2 className="w-4 h-4 mr-1" />
                        Clear Cart
                      </Button>
                      <Button 
                        onClick={placeOrder} 
                        disabled={orderMutation.isPending}
                        className="bg-[#1B4332] hover:bg-[#1B4332]/90"
                      >
                        {orderMutation.isPending ? "Placing..." : "Place Order"}
                      </Button>
                    </div>
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
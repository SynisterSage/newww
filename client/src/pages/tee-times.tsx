import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { Calendar, Clock, Users, MapPin, Plus, Edit, X, Filter } from "lucide-react";
import { format } from "date-fns";
import type { TeeTime } from "@shared/schema";

export default function TeeTimes() {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [selectedHoles, setSelectedHoles] = useState("All");
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [newBooking, setNewBooking] = useState({
    date: "",
    time: "",
    players: "1",
    holes: "18",
    cartOption: "walk",
    cartQuantity: "1",
    specialRequests: ""
  });
  const [userBookings, setUserBookings] = useState<any[]>([]);
  const [editingBooking, setEditingBooking] = useState<any>(null);

  const { data: teetimes = [], isLoading } = useQuery<TeeTime[]>({
    queryKey: ['/api/teetimes', selectedDate],
  });

  const bookingMutation = useMutation({
    mutationFn: async (bookingData: any) => {
      const response = await apiRequest('POST', '/api/teetimes', {
        userId: 'user-1',
        date: bookingData.date,
        time: bookingData.time,
        course: "Packanack Golf Course",
        holes: parseInt(bookingData.holes),
        spotsAvailable: parseInt(bookingData.players),
        price: bookingData.holes === "9" ? "45.00" : "85.00",
        status: "booked"
      });
      return response.json();
    },
    onSuccess: (data: any) => {
      // Add booking to user bookings
      const bookingData = {
        id: data.id || 'temp-id',
        date: newBooking.date,
        time: newBooking.time,
        players: newBooking.players,
        holes: newBooking.holes,
        course: "Packanack Golf Course",
        cartOption: newBooking.cartOption,
        cartQuantity: newBooking.cartQuantity,
        specialRequests: newBooking.specialRequests,
        status: "pending"
      };
      
      setUserBookings(prev => [...prev, bookingData]);
      
      queryClient.invalidateQueries({ queryKey: ['/api/teetimes'] });
      setIsBookingModalOpen(false);
      setNewBooking({ date: "", time: "", players: "1", holes: "18", cartOption: "walk", cartQuantity: "1", specialRequests: "" });
      toast({
        title: "Booking Confirmed",
        description: "Your tee time has been successfully booked!",
      });
    },
    onError: () => {
      toast({
        title: "Booking Failed",
        description: "Unable to book this tee time. Please try again.",
        variant: "destructive",
      });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (teetimeId: string) => {
      const response = await apiRequest('PATCH', `/api/teetimes/${teetimeId}`, {
        status: "available",
        userId: null
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teetimes'] });
      toast({
        title: "Booking Cancelled",
        description: "Your tee time has been cancelled.",
      });
    },
  });

  const handleBookTeeTime = () => {
    if (!newBooking.date || !newBooking.time || !newBooking.holes) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    if (editingBooking) {
      // Update existing booking
      const updatedBookings = userBookings.map(booking => 
        booking.id === editingBooking.id 
          ? { ...booking, ...newBooking, holes: newBooking.holes }
          : booking
      );
      setUserBookings(updatedBookings);
      setEditingBooking(null);
      setIsBookingModalOpen(false);
      setNewBooking({ date: "", time: "", players: "1", holes: "18", cartOption: "walk", cartQuantity: "1", specialRequests: "" });
      toast({
        title: "Booking Updated",
        description: "Your tee time has been successfully updated!",
      });
    } else {
      // Create new booking
      bookingMutation.mutate(newBooking);
    }
  };

  const handleCancelBooking = (bookingId: string) => {
    setUserBookings(prev => prev.filter(booking => booking.id !== bookingId));
    toast({
      title: "Booking Cancelled",
      description: "Your tee time has been cancelled.",
    });
  };

  const handleEditBooking = (booking: any) => {
    setEditingBooking(booking);
    setNewBooking({
      date: booking.date,
      time: booking.time,
      players: booking.players,
      holes: booking.holes.toString(),
      cartOption: booking.cartOption || "walk",
      cartQuantity: booking.cartQuantity || "1",
      specialRequests: booking.specialRequests || ""
    });
    setIsBookingModalOpen(true);
  };

  const getStatusBadge = (teetime: TeeTime) => {
    if (teetime.status === "booked") return { text: "confirmed", color: "bg-green-100 text-green-700" };
    if (teetime.isPremium) return { text: "pending", color: "bg-yellow-100 text-yellow-700" };
    return { text: "available", color: "bg-blue-100 text-blue-700" };
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-20 bg-muted rounded-xl"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 bg-muted rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">


      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-golf-green mb-2">Tee Times</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Book and manage your golf reservations</p>
        </div>
        
        <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-golf-green hover:bg-golf-green-light text-white w-full lg:w-auto"
              onClick={() => {
                setEditingBooking(null);
                setNewBooking({ date: "", time: "", players: "1", holes: "18", cartOption: "walk", cartQuantity: "1", specialRequests: "" });
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Book Tee Time
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-golf-green mb-4">
                <Calendar className="w-6 h-6 inline mr-2" />
                {editingBooking ? "Edit Tee Time" : "Book New Tee Time"}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Date</label>
                  <Input
                    type="date"
                    value={newBooking.date}
                    onChange={(e) => setNewBooking({...newBooking, date: e.target.value})}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Bookings available up to 2 days in advance</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Time</label>
                  <Select value={newBooking.time} onValueChange={(value) => setNewBooking({...newBooking, time: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6:30 AM">6:30 AM</SelectItem>
                      <SelectItem value="7:00 AM">7:00 AM</SelectItem>
                      <SelectItem value="7:30 AM">7:30 AM</SelectItem>
                      <SelectItem value="8:00 AM">8:00 AM</SelectItem>
                      <SelectItem value="8:30 AM">8:30 AM</SelectItem>
                      <SelectItem value="9:00 AM">9:00 AM</SelectItem>
                      <SelectItem value="9:30 AM">9:30 AM</SelectItem>
                      <SelectItem value="10:00 AM">10:00 AM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Number of Players</label>
                  <Select value={newBooking.players} onValueChange={(value) => setNewBooking({...newBooking, players: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Player</SelectItem>
                      <SelectItem value="2">2 Players</SelectItem>
                      <SelectItem value="3">3 Players</SelectItem>
                      <SelectItem value="4">4 Players</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Holes</label>
                  <Select value={newBooking.holes} onValueChange={(value) => setNewBooking({...newBooking, holes: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select holes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="9">9 Holes ($45)</SelectItem>
                      <SelectItem value="18">18 Holes ($85)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Cart Option</label>
                  <Select value={newBooking.cartOption} onValueChange={(value) => setNewBooking({...newBooking, cartOption: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="walk">Walk</SelectItem>
                      <SelectItem value="cart">Cart</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {newBooking.cartOption === "cart" && (
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Number of Carts</label>
                    <Select value={newBooking.cartQuantity} onValueChange={(value) => setNewBooking({...newBooking, cartQuantity: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Cart</SelectItem>
                        <SelectItem value="2">2 Carts</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Special Requests</label>
                <Textarea
                  placeholder="Any special requests or notes..."
                  value={newBooking.specialRequests}
                  onChange={(e) => setNewBooking({...newBooking, specialRequests: e.target.value})}
                  className="resize-none"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button variant="outline" onClick={() => setIsBookingModalOpen(false)}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button 
                  className="bg-golf-green hover:bg-golf-green-light text-white"
                  onClick={handleBookTeeTime}
                  disabled={bookingMutation.isPending}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  {bookingMutation.isPending ? 
                    (editingBooking ? "Updating..." : "Booking...") : 
                    (editingBooking ? "Edit Tee Time" : "Book Tee Time")
                  }
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-golf-green" />
              <span className="text-sm font-medium text-foreground">Filter Tee Times</span>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="flex-1">
                <label className="text-sm text-muted-foreground mb-1 block"># of Holes</label>
                <Select value={selectedHoles} onValueChange={setSelectedHoles}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All</SelectItem>
                    <SelectItem value="9">9 Holes</SelectItem>
                    <SelectItem value="18">18 Holes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex-1">
                <label className="text-sm text-muted-foreground mb-1 block">Date</label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User's Booking Cards - Grid Layout */}
      {userBookings.filter(booking => selectedHoles === "All" || booking.holes.toString() === selectedHoles).length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Your Bookings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userBookings
              .filter(booking => selectedHoles === "All" || booking.holes.toString() === selectedHoles)
              .map((booking, index) => (
              <Card key={booking.id} className="bg-white border shadow-lg hover:shadow-xl transition-shadow duration-200">
                <CardHeader className="border-b border-border/20 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Calendar className="w-6 h-6 text-golf-green mr-3" />
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">
                          {format(new Date(booking.date), "MMM d, yyyy")}
                        </h3>
                        <p className="text-sm text-muted-foreground">Tee Time Booking</p>
                      </div>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                      {booking.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="w-4 h-4 mr-3" />
                      <span>{booking.time}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="w-4 h-4 mr-3" />
                      <span>{booking.players} Players</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-3" />
                      <span>Packanack Golf Course</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Badge className="bg-golf-green text-white text-xs px-2 py-1">
                        {booking.holes} Holes
                      </Badge>
                    </div>
                    {booking.cartOption && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <span className="w-4 h-4 mr-3">🚗</span>
                        <span>{booking.cartOption === "cart" ? `Cart (${booking.cartQuantity || 1})` : "Walk"}</span>
                      </div>
                    )}
                    {booking.specialRequests && (
                      <div className="mt-3 p-2 bg-gray-50 rounded-lg border">
                        <p className="text-sm text-muted-foreground italic break-words whitespace-pre-wrap">
                          {booking.specialRequests}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleEditBooking(booking)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 text-red-600 hover:text-red-700"
                      onClick={() => handleCancelBooking(booking.id)}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tee Time Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teetimes.map((teetime) => {
          const status = getStatusBadge(teetime);
          const isUserBooking = teetime.userId === 'user-1';
          
          return (
            <Card key={teetime.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-golf-green-soft rounded-2xl flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-golf-green" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {formatDate(teetime.date)}
                      </h3>
                      <p className="text-sm text-muted-foreground">Tee Time Booking</p>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-md text-xs font-medium ${status.color}`}>
                    {status.text}
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground mr-2" />
                    <span className="font-medium">{teetime.time}</span>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <Users className="w-4 h-4 text-muted-foreground mr-2" />
                    <span>{teetime.spotsAvailable} Player{teetime.spotsAvailable !== 1 ? 's' : ''}</span>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground mr-2" />
                    <span className="text-golf-green font-medium">
                      Packanack Golf Course
                    </span>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <Badge className="bg-golf-green text-white text-xs px-2 py-1">
                      {teetime.holes || 18} Holes
                    </Badge>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-4">
                  {isUserBooking ? "Your reservation" : 
                   teetime.isPremium ? "Tournament preparation" : "Early morning round"}
                </p>

                <div className="flex space-x-2">
                  {isUserBooking ? (
                    <>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 text-red-600 hover:text-red-700"
                        onClick={() => cancelMutation.mutate(teetime.id)}
                        disabled={cancelMutation.isPending}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* No Tee Times Message */}
      {teetimes.length === 0 && userBookings.length === 0 ? (
        <Card className="border-0 shadow-lg bg-white relative">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-golf-green rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-semibold">
                      No tee times available
                    </span>
                    <Badge className="bg-orange-100 text-orange-700 text-xs font-medium px-2 py-1">
                      pending
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Tee Time Booking</p>
                </div>
              </div>

            </div>
            
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No tee times found</h3>
              <p className="text-muted-foreground mb-4">Try selecting a different date or course</p>
              <Button 
                className="bg-golf-green hover:bg-golf-green-light text-white"
                onClick={() => {
                  setEditingBooking(null);
                  setNewBooking({ date: "", time: "", players: "1", holes: "18", cartOption: "walk", cartQuantity: "1", specialRequests: "" });
                  setIsBookingModalOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Book New Tee Time
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

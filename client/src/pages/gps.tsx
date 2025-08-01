import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import CourseHoleCard from "@/components/course-hole";
import { useState } from "react";
import { MapPin, Target, Wind, TrendingUp } from "lucide-react";
import type { CourseHole, Round } from "@shared/schema";

export default function GPS() {
  const { toast } = useToast();
  const [selectedCourse, setSelectedCourse] = useState("Championship Course");

  const { data: holes = [], isLoading: holesLoading } = useQuery<CourseHole[]>({
    queryKey: ['/api/course/holes', selectedCourse],
  });

  const { data: currentRound } = useQuery<Round | null>({
    queryKey: ['/api/rounds/user-1/current'],
  });

  const startRoundMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/rounds', {
        userId: 'user-1',
        currentHole: 1,
        scores: [],
        status: 'in_progress'
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/rounds'] });
      toast({
        title: "Round Started",
        description: "Your GPS tracking has been activated!",
      });
    },
  });

  const currentHole = currentRound ? holes.find(h => h.holeNumber === currentRound.currentHole) : holes[6]; // Default to hole 7
  const nextHole = holes.find(h => h.holeNumber === (currentHole?.holeNumber || 7) + 1);

  if (holesLoading) {
    return (
      <div className="p-4 lg:p-8">
        <div className="animate-pulse space-y-8">
          <div className="h-32 bg-gray-300 rounded-2xl"></div>
          <div className="h-96 bg-gray-300 rounded-xl"></div>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-gray-300 rounded-xl"></div>
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
              <h1 className="text-3xl font-bold text-golf-green mb-2">Course GPS & Navigation</h1>
              <p className="text-gray-600">Advanced GPS tracking with hole-by-hole guidance</p>
            </div>
            <div className="mt-4 lg:mt-0 flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={() => startRoundMutation.mutate()}
                disabled={startRoundMutation.isPending || !!currentRound}
                className="bg-golf-gold hover:bg-golf-gold/90 text-white"
              >
                <MapPin className="w-4 h-4 mr-2" />
                {currentRound ? "GPS Active" : "Start GPS"}
              </Button>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Championship Course">Championship Course</SelectItem>
                  <SelectItem value="Executive Course">Executive Course</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Course Overview Map */}
          <div 
            className="relative h-96 rounded-xl overflow-hidden mb-8 bg-cover bg-center"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1535131749006-b7f58c99034b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=800')`
            }}
          >
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-4">
              <h3 className="font-semibold text-golf-green mb-2">Current Location</h3>
              <p className="text-sm text-gray-600">Tee Box - Hole {currentHole?.holeNumber || 7}</p>
              <p className="text-sm text-golf-gold font-medium">
                Par {currentHole?.par || 4} • {currentHole?.yardage || 385} yards
              </p>
            </div>
            
            {/* GPS Markers */}
            <div className="absolute top-1/2 left-1/3 w-4 h-4 bg-golf-gold rounded-full border-2 border-white shadow-lg animate-pulse"></div>
            <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-golf-green rounded-full border-2 border-white shadow-lg"></div>
            <div className="absolute bottom-1/3 left-1/2 w-3 h-3 bg-golf-green rounded-full border-2 border-white shadow-lg"></div>
          </div>

          {/* Hole Information Grid */}
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
            {/* Current Hole */}
            {currentHole && (
              <Card className="border-2 border-golf-gold bg-golf-gold/5">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-golf-gold rounded-lg flex items-center justify-center text-white font-bold">
                        {currentHole.holeNumber}
                      </div>
                      <div>
                        <h4 className="font-semibold text-golf-green">Current Hole</h4>
                        <p className="text-sm text-gray-600">Par {currentHole.par}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-golf-green">{currentHole.yardage}</div>
                      <div className="text-sm text-gray-600">yards</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Distance to Pin:</span>
                      <span className="font-medium text-golf-gold">142 yards</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Wind:</span>
                      <span className="font-medium">5 mph SW</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Elevation:</span>
                      <span className="font-medium">+8 feet</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h5 className="font-medium text-golf-green mb-2">Course Notes</h5>
                    <p className="text-sm text-gray-600">{currentHole.notes}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Next Hole Preview */}
            {nextHole && (
              <Card className="border border-gray-200 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-golf-green rounded-lg flex items-center justify-center text-white font-bold">
                        {nextHole.holeNumber}
                      </div>
                      <div>
                        <h4 className="font-semibold text-golf-green">Next Hole</h4>
                        <p className="text-sm text-gray-600">Par {nextHole.par}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-golf-green">{nextHole.yardage}</div>
                      <div className="text-sm text-gray-600">yards</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Handicap:</span>
                      <span className="font-medium">{nextHole.handicap}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Green Size:</span>
                      <span className="font-medium">Medium</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">{nextHole.description}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Score Tracking */}
            <Card className="border border-gray-200">
              <CardContent className="p-6">
                <h4 className="font-semibold text-golf-green mb-4">Round Progress</h4>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>Holes Completed:</span>
                    <span className="font-medium">6 of 18</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Current Score:</span>
                    <span className="font-medium text-golf-gold">+2 (E)</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Time Elapsed:</span>
                    <span className="font-medium">2h 15min</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Pace of Play:</span>
                    <span className="font-medium text-green-600">On Time</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h5 className="font-medium text-golf-green mb-2">Recent Holes</h5>
                  <div className="flex space-x-2">
                    {[4, 3, 6, 4].map((score, index) => (
                      <div key={index} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        score <= 4 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {score}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Full Course Layout */}
          <div className="p-6 bg-gray-50 rounded-xl">
            <h3 className="text-lg font-semibold text-golf-green mb-6">Championship Course Layout</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {holes.slice(0, 12).map((hole, index) => {
                const holeStatus = index < 6 ? 'completed' : index === 6 ? 'current' : 'upcoming';
                const scores = [4, 3, 6, 4, 3, 4]; // Mock scores for completed holes
                
                return (
                  <div key={hole.id} className={`text-center p-3 rounded-lg ${
                    holeStatus === 'completed' ? 'bg-green-100' :
                    holeStatus === 'current' ? 'bg-golf-gold text-white ring-2 ring-golf-gold' :
                    'bg-gray-100'
                  }`}>
                    <div className={`text-lg font-bold ${
                      holeStatus === 'completed' ? 'text-green-800' :
                      holeStatus === 'current' ? 'text-white' :
                      'text-gray-600'
                    }`}>
                      {hole.holeNumber}
                    </div>
                    <div className={`text-xs ${
                      holeStatus === 'current' ? 'text-white opacity-90' : 'text-gray-600'
                    }`}>
                      Par {hole.par} • {hole.yardage}y
                    </div>
                    <div className={`text-sm font-medium ${
                      holeStatus === 'completed' ? 'text-green-800' :
                      holeStatus === 'current' ? 'text-white' :
                      'text-gray-500'
                    }`}>
                      {holeStatus === 'completed' ? scores[index] : 
                       holeStatus === 'current' ? 'Playing' : '-'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

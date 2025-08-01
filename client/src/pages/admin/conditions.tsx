import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CloudSun, Thermometer, Wind, Droplets, AlertCircle, CheckCircle, Wrench } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { CourseConditions, InsertCourseConditions } from "@shared/schema";

export default function CourseConditionsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: conditions, isLoading } = useQuery({
    queryKey: ["/api/course/conditions"],
    queryFn: () => fetch("/api/course/conditions").then(res => res.json()) as Promise<CourseConditions>
  });

  const [formData, setFormData] = useState<Partial<InsertCourseConditions>>({});

  const updateConditionsMutation = useMutation({
    mutationFn: (data: Partial<InsertCourseConditions>) => 
      apiRequest("PATCH", "/api/course/conditions", data),
    onSuccess: () => {
      toast({
        title: "Course Conditions Updated",
        description: "The course conditions have been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/course/conditions"] });
      setFormData({});
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update course conditions",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(formData).length === 0) {
      toast({
        title: "No Changes",
        description: "Please make changes before updating.",
        variant: "destructive",
      });
      return;
    }
    
    updateConditionsMutation.mutate({
      ...formData,
      updatedBy: "Admin User"
    });
  };

  const handleInputChange = (field: keyof InsertCourseConditions, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-gray-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <CloudSun className="h-8 w-8 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-900">Course Conditions</h1>
          </div>
          <div className="text-center py-12">
            <div className="animate-spin h-8 w-8 border-2 border-green-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading course conditions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <CloudSun className="h-8 w-8 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-900">Course Conditions</h1>
          </div>
          <div className="text-sm text-gray-600">
            Last updated: {conditions ? new Date(conditions.lastUpdated).toLocaleString() : "Never"}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Weather Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CloudSun className="h-5 w-5" />
                Weather Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weather">Weather</Label>
                <Select 
                  value={formData.weather || conditions?.weather || ""} 
                  onValueChange={(value) => handleInputChange("weather", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select weather" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sunny">Sunny</SelectItem>
                    <SelectItem value="partly-cloudy">Partly Cloudy</SelectItem>
                    <SelectItem value="cloudy">Cloudy</SelectItem>
                    <SelectItem value="overcast">Overcast</SelectItem>
                    <SelectItem value="light-rain">Light Rain</SelectItem>
                    <SelectItem value="heavy-rain">Heavy Rain</SelectItem>
                    <SelectItem value="thunderstorms">Thunderstorms</SelectItem>
                    <SelectItem value="fog">Fog</SelectItem>
                    <SelectItem value="snow">Snow</SelectItem>
                    <SelectItem value="windy">Windy</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="temperature" className="flex items-center gap-1">
                  <Thermometer className="h-4 w-4" />
                  Temperature (°F)
                </Label>
                <Input
                  id="temperature"
                  type="number"
                  value={formData.temperature ?? conditions?.temperature ?? ""}
                  onChange={(e) => handleInputChange("temperature", parseInt(e.target.value))}
                  placeholder="Temperature"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="windSpeed" className="flex items-center gap-1">
                  <Wind className="h-4 w-4" />
                  Wind Speed (mph)
                </Label>
                <Input
                  id="windSpeed"
                  type="number"
                  value={formData.windSpeed ?? conditions?.windSpeed ?? ""}
                  onChange={(e) => handleInputChange("windSpeed", parseInt(e.target.value))}
                  placeholder="Wind speed"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="humidity" className="flex items-center gap-1">
                  <Droplets className="h-4 w-4" />
                  Humidity (%)
                </Label>
                <Input
                  id="humidity"
                  type="number"
                  value={formData.humidity ?? conditions?.humidity ?? ""}
                  onChange={(e) => handleInputChange("humidity", parseInt(e.target.value))}
                  placeholder="Humidity"
                />
              </div>
            </CardContent>
          </Card>

          {/* Course Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Course Status
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="courseStatus">Course Status</Label>
                <Select 
                  value={formData.courseStatus || conditions?.courseStatus || ""} 
                  onValueChange={(value) => handleInputChange("courseStatus", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="limited">Limited</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="weather-delay">Weather Delay</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="cartPathOnly"
                  checked={formData.cartPathOnly ?? conditions?.cartPathOnly ?? false}
                  onCheckedChange={(checked) => handleInputChange("cartPathOnly", checked)}
                />
                <Label htmlFor="cartPathOnly">Cart Path Only</Label>
              </div>
            </CardContent>
          </Card>

          {/* Course Conditions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Course Conditions
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="greensCondition">Greens Condition</Label>
                <Select 
                  value={formData.greensCondition || conditions?.greensCondition || ""} 
                  onValueChange={(value) => handleInputChange("greensCondition", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">Excellent</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="poor">Poor</SelectItem>
                    <SelectItem value="temporary">Temporary</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fairwaysCondition">Fairways Condition</Label>
                <Select 
                  value={formData.fairwaysCondition || conditions?.fairwaysCondition || ""} 
                  onValueChange={(value) => handleInputChange("fairwaysCondition", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">Excellent</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="poor">Poor</SelectItem>
                    <SelectItem value="overseeded">Overseeded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Course Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hazardNotes">Hazard Notes</Label>
                <Textarea
                  id="hazardNotes"
                  value={formData.hazardNotes ?? conditions?.hazardNotes ?? ""}
                  onChange={(e) => handleInputChange("hazardNotes", e.target.value)}
                  placeholder="Enter any hazard notes or course warnings..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maintenanceNotes">Maintenance Notes</Label>
                <Textarea
                  id="maintenanceNotes"
                  value={formData.maintenanceNotes ?? conditions?.maintenanceNotes ?? ""}
                  onChange={(e) => handleInputChange("maintenanceNotes", e.target.value)}
                  placeholder="Enter any maintenance notes or upcoming work..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={updateConditionsMutation.isPending || Object.keys(formData).length === 0}
              className="px-8"
            >
              {updateConditionsMutation.isPending ? "Updating..." : "Update Conditions"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
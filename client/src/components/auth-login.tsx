import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { User } from "@shared/schema";

interface AuthLoginProps {
  onLogin: (email: string, user?: User) => void;
}

export function AuthLogin({ onLogin }: AuthLoginProps) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; phone: string }) => {
      try {
        const response = await apiRequest("POST", "/api/auth/member", credentials);
        const data = await response.json();
        // Store session token in localStorage
        if (data.sessionToken) {
          localStorage.setItem('sessionToken', data.sessionToken);
        }
        return data as User & { sessionToken?: string };
      } catch (error: any) {
        throw new Error(error.message || "Authentication failed");
      }
    },
    onSuccess: (userData) => {
      setError("");
      onLogin(userData.email || email, userData);
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !phone.trim()) return;
    
    setError("");
    loginMutation.mutate({ email, phone });
  };

  if (loginMutation.isPending) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-golf-green-soft via-white to-golf-green-light flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-8">
            {/* Rotating rings animation */}
            <div className="absolute inset-0 border-4 border-golf-green border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-4 border-golf-green-light border-r-transparent rounded-full animate-spin animation-delay-200"></div>
            <div className="absolute inset-4 border-4 border-gold border-b-transparent rounded-full animate-spin animation-delay-400"></div>
            
            {/* Golf ball icon in center */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-white rounded-full border-2 border-golf-green shadow-lg">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-white to-gray-100 flex items-center justify-center">
                  <div className="w-1 h-1 bg-golf-green rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
          
          <h3 className="text-xl font-semibold text-golf-green mb-2">Authenticating...</h3>
          <p className="text-muted-foreground">Verifying member credentials</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-golf-green-soft via-white to-golf-green-light flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="text-center pb-8">
          <div className="w-20 h-20 bg-golf-green rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <div className="w-6 h-6 bg-golf-green rounded-full"></div>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-golf-green">
            Welcome Back
          </CardTitle>
          <p className="text-muted-foreground mt-2">
            Verify your membership credentials
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="email"
                  placeholder="your.email@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="tel"
                  placeholder="(973) 555-1234"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10 h-12"
                  required
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-12 bg-golf-green hover:bg-golf-green-light text-white font-semibold"
              disabled={!email.trim() || !phone.trim() || loginMutation.isPending}
            >
              {loginMutation.isPending ? "Verifying..." : "Member Access"}
            </Button>
            
            <div className="text-center text-sm text-muted-foreground">
              <p>For assistance, contact the pro shop</p>
              <p className="font-medium text-golf-green">(973) 694-9754</p>
              <div className="mt-3 text-xs text-gray-600">
                <p>Demo credentials:</p>
                <p>keith.allerton@email.com / (973) 333-9593</p>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                <p>Only utilized for desktop, mobile soon</p>
              </div>
              <div className="mt-3">
                <a 
                  href="/admin" 
                  className="inline-block text-xs text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Staff Portal
                </a>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
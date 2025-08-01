import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Lock, Eye, EyeOff, Shield } from "lucide-react";

interface AuthAdminProps {
  onLogin: (email: string) => void;
}

export function AuthAdmin({ onLogin }: AuthAdminProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    setIsLoading(true);
    
    // Simulate login delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    onLogin(email);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 border-4 border-slate-700 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-4 border-slate-500 border-r-transparent rounded-full animate-spin animation-delay-200"></div>
            <div className="absolute inset-4 border-4 border-blue-600 border-b-transparent rounded-full animate-spin animation-delay-400"></div>
            
            <div className="absolute inset-0 flex items-center justify-center">
              <Shield className="w-8 h-8 text-slate-700" />
            </div>
          </div>
          
          <h3 className="text-xl font-semibold text-slate-700 mb-2">Authenticating Admin...</h3>
          <p className="text-muted-foreground">Verifying staff credentials</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="text-center pb-8">
          <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-700">
            Admin Access
          </CardTitle>
          <p className="text-muted-foreground mt-2">
            Staff portal for PGC management
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Admin Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="email"
                  placeholder="admin@packanackgolf.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-12 bg-slate-700 hover:bg-slate-800 text-white font-semibold"
              disabled={!email.trim()}
            >
              Admin Login
            </Button>
            
            <div className="text-center text-sm text-muted-foreground">
              <p>Staff access only</p>
              <p className="font-medium text-slate-700">Contact IT for assistance</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
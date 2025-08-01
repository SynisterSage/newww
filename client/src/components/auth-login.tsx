import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

interface AuthLoginProps {
  onLogin: (email: string) => void;
}

export function AuthLogin({ onLogin }: AuthLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    setIsLoading(true);
    
    // Simulate login delay with cool animation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    onLogin(email);
  };

  if (isLoading) {
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
            Sign in to access your member portal
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="email"
                  placeholder="member@packanackgolf.com"
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
                  placeholder="Enter your password"
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
              className="w-full h-12 bg-golf-green hover:bg-golf-green-light text-white font-semibold"
              disabled={!email.trim()}
            >PGC Private Access</Button>
            
            <div className="text-center text-sm text-muted-foreground">
              <p>For assistance, contact the pro shop</p>
              <p className="font-medium text-golf-green">(973) 694-9754</p>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <a 
                  href="/admin" 
                  className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
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
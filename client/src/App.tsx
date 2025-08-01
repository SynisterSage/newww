import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navigation from "@/components/navigation";

import { AuthLogin } from "@/components/auth-login";
import { AuthAdmin } from "@/components/auth-admin";
import AdminNavigation from "@/components/admin-navigation";
import Dashboard from "@/pages/dashboard";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminMembers from "@/pages/admin/members";
import AdminConditions from "@/pages/admin/conditions";
import AdminTeeTimes from "@/pages/admin/tee-times";
import AdminOrders from "@/pages/admin/orders";
import TeeTimes from "@/pages/tee-times";
import Dining from "@/pages/dining";
import Conditions from "@/pages/conditions";
import Events from "@/pages/events";
import NotFound from "@/pages/not-found";
import type { AdminUser, User } from "@shared/schema";

function Router() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userData, setUserData] = useState<User | null>(null);
  const [adminData, setAdminData] = useState<AdminUser | null>(null);
  const [isAdminView, setIsAdminView] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSwitchingToMember, setIsSwitchingToMember] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [location] = useLocation();

  // Check for existing session on load
  useEffect(() => {
    const verifySession = async () => {
      const sessionToken = localStorage.getItem('sessionToken');
      
      if (!sessionToken) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionToken }),
        });

        if (response.ok) {
          const data = await response.json();
          
          if (data.type === 'member') {
            setUserData(data);
            setUserEmail(data.email);
            setIsAuthenticated(true);
          } else if (data.type === 'admin') {
            setAdminData(data);
            setIsAdminAuthenticated(true);
          }
        } else {
          // Clear invalid session
          localStorage.removeItem('sessionToken');
        }
      } catch (error) {
        // Clear invalid session on error
        localStorage.removeItem('sessionToken');
      }
      
      setIsLoading(false);
    };

    verifySession();
  }, []);

  const handleLogin = (email: string, user?: User) => {
    setUserEmail(email);
    setUserData(user || null);
    setIsAuthenticated(true);
  };

  const handleAdminLogin = (data: AdminUser) => {
    setAdminData(data);
    setIsAdminAuthenticated(true);
  };

  // Show logout animation
  if (isLoggingOut) {
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
          
          <h3 className="text-xl font-semibold text-golf-green mb-2">Logging Out...</h3>
          <p className="text-muted-foreground">Thank you for visiting Packanack Golf Club</p>
        </div>
      </div>
    );
  }

  // Show switching to member view animation
  if (isSwitchingToMember) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-8">
            {/* Rotating rings animation with admin colors */}
            <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-4 border-blue-500 border-r-transparent rounded-full animate-spin animation-delay-200"></div>
            <div className="absolute inset-4 border-4 border-slate-500 border-b-transparent rounded-full animate-spin animation-delay-400"></div>
            
            {/* Admin shield icon in center */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-white rounded-full border-2 border-blue-600 shadow-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4a2 2 0 012-2h11.668a2 2 0 012 2v6.854c0 2.264-1.487 4.262-3.685 4.847L10 17l-4.149-1.299C3.653 15.116 2.166 13.118 2.166 10.854V4zm9.334 6a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          
          <h3 className="text-xl font-semibold text-blue-600 mb-2">Switching to Member View...</h3>
          <p className="text-muted-foreground">Preparing your member experience</p>
        </div>
      </div>
    );
  }

  // Show loading while verifying session
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-golf-green-soft via-white to-golf-green-light flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 border-4 border-golf-green border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-4 border-golf-green-light border-r-transparent rounded-full animate-spin animation-delay-200"></div>
            <div className="absolute inset-4 border-4 border-gold border-b-transparent rounded-full animate-spin animation-delay-400"></div>
            
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-white rounded-full border-2 border-golf-green shadow-lg">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-white to-gray-100 flex items-center justify-center">
                  <div className="w-1 h-1 bg-golf-green rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
          
          <h3 className="text-xl font-semibold text-golf-green mb-2">Loading...</h3>
          <p className="text-muted-foreground">Verifying your session</p>
        </div>
      </div>
    );
  }

  // Check if current path is admin route
  const isAdminRoute = location.startsWith('/admin');

  // Admin authentication flow
  if (isAdminRoute && !isAdminAuthenticated) {
    return <AuthAdmin onLogin={handleAdminLogin} />;
  }

  // Member authentication flow
  if (!isAdminRoute && !isAuthenticated) {
    return <AuthLogin onLogin={handleLogin} />;
  }

  const handleSwitchToMember = async () => {
    setIsSwitchingToMember(true);
    
    // Show switching animation for 1.5 seconds
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Set member authentication as true with admin email
    setUserEmail(adminData?.email || "admin@packanackgolf.com");
    setIsAuthenticated(true);
    setIsAdminView(true);
    setIsSwitchingToMember(false);
    // Navigate to member dashboard
    window.location.href = "/";
  };

  const handleSwitchToAdmin = () => {
    setIsAdminView(false);
    window.location.href = "/admin";
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    // Call logout API
    const sessionToken = localStorage.getItem('sessionToken');
    if (sessionToken) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionToken }),
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
      localStorage.removeItem('sessionToken');
    }
    
    // Show logout animation for 1.5 seconds
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsAuthenticated(false);
    setIsAdminAuthenticated(false);
    setUserEmail("");
    setUserData(null);
    setAdminData(null);
    setIsAdminView(false);
    setIsLoggingOut(false);
  };

  // Admin interface
  if (isAdminRoute && isAdminAuthenticated) {
    return (
      <div className="flex min-h-screen bg-background">
        <AdminNavigation 
          adminEmail={adminData?.email} 
          onSwitchToMember={handleSwitchToMember}
        />
        <main className="flex-1 lg:ml-64">
          <Switch>
            <Route path="/admin">{() => <AdminDashboard adminEmail={adminData?.email} />}</Route>
            <Route path="/admin/tee-times">{() => <AdminTeeTimes />}</Route>
            <Route path="/admin/orders">{() => <AdminOrders />}</Route>
            <Route path="/admin/members">{() => <AdminMembers />}</Route>
            <Route path="/admin/conditions">{() => <AdminConditions />}</Route>
            <Route path="/admin/events">{() => <div>Admin Events</div>}</Route>
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
    );
  }

  // Member interface
  return (
    <div className="flex min-h-screen bg-background">
      <Navigation 
        userEmail={userEmail}
        userData={userData}
        isAdminView={isAdminView}
        onSwitchToAdmin={handleSwitchToAdmin}
        onLogout={handleLogout}
      />
      <main className="flex-1 lg:ml-64">
        <Switch>
          <Route path="/">{() => <Dashboard userEmail={userEmail} user={userData || undefined} />}</Route>
          <Route path="/tee-times">{() => <TeeTimes userData={userData || undefined} />}</Route>
          <Route path="/dining">{() => <Dining userData={userData || undefined} />}</Route>
          <Route path="/conditions" component={Conditions} />
          <Route path="/events" component={Events} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

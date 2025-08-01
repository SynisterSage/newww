import { useState } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navigation from "@/components/navigation";
import MobileNav from "@/components/mobile-nav";
import { AuthLogin } from "@/components/auth-login";
import { AuthAdmin } from "@/components/auth-admin";
import AdminNavigation from "@/components/admin-navigation";
import Dashboard from "@/pages/dashboard";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminMembers from "@/pages/admin/members";
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
  const [location] = useLocation();

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

  const handleSwitchToMember = () => {
    // Set member authentication as true with admin email
    setUserEmail(adminData?.email || "admin@packanackgolf.com");
    setIsAuthenticated(true);
    setIsAdminView(true);
    // Navigate to member dashboard
    window.location.href = "/";
  };

  const handleSwitchToAdmin = () => {
    setIsAdminView(false);
    window.location.href = "/admin";
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    // Show logout animation for 1.5 seconds
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsAuthenticated(false);
    setUserEmail("");
    setUserData(null);
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
        <main className="flex-1 lg:ml-64 pb-16 lg:pb-0">
          <Switch>
            <Route path="/admin">{() => <AdminDashboard adminEmail={adminData?.email} />}</Route>
            <Route path="/admin/tee-times">{() => <div>Admin Tee Times</div>}</Route>
            <Route path="/admin/orders">{() => <div>Admin Orders</div>}</Route>
            <Route path="/admin/members">{() => <AdminMembers />}</Route>
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
      <main className="flex-1 lg:ml-64 pb-16 lg:pb-0">
        <Switch>
          <Route path="/">{() => <Dashboard userEmail={userEmail} user={userData} />}</Route>
          <Route path="/tee-times" component={TeeTimes} />
          <Route path="/dining" component={Dining} />
          <Route path="/conditions" component={Conditions} />
          <Route path="/events" component={Events} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <MobileNav />
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

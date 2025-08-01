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
import TeeTimes from "@/pages/tee-times";
import Dining from "@/pages/dining";
import Conditions from "@/pages/conditions";
import Events from "@/pages/events";
import NotFound from "@/pages/not-found";
import type { AdminUser } from "@shared/schema";

function Router() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [adminData, setAdminData] = useState<AdminUser | null>(null);
  const [isAdminView, setIsAdminView] = useState(false);
  const [location] = useLocation();

  const handleLogin = (email: string) => {
    setUserEmail(email);
    setIsAuthenticated(true);
  };

  const handleAdminLogin = (data: AdminUser) => {
    setAdminData(data);
    setIsAdminAuthenticated(true);
  };

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
            <Route path="/admin/members">{() => <div>Admin Members</div>}</Route>
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
        isAdminView={isAdminView}
        onSwitchToAdmin={handleSwitchToAdmin}
      />
      <main className="flex-1 lg:ml-64 pb-16 lg:pb-0">
        <Switch>
          <Route path="/">{() => <Dashboard userEmail={userEmail} />}</Route>
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

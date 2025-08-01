import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navigation from "@/components/navigation";
import MobileNav from "@/components/mobile-nav";
import { AuthLogin } from "@/components/auth-login";
import Dashboard from "@/pages/dashboard";
import TeeTimes from "@/pages/tee-times";
import Dining from "@/pages/dining";
import CourseConditions from "@/pages/course-conditions";
import Events from "@/pages/events";
import NotFound from "@/pages/not-found";

function Router() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const handleLogin = (email: string) => {
    setUserEmail(email);
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return <AuthLogin onLogin={handleLogin} />;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Navigation userEmail={userEmail} />
      <main className="flex-1 lg:ml-64 pb-16 lg:pb-0">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/tee-times" component={TeeTimes} />
          <Route path="/dining" component={Dining} />
          <Route path="/course-conditions" component={CourseConditions} />
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

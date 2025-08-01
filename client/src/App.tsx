import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navigation from "@/components/navigation";
import MobileNav from "@/components/mobile-nav";
import Dashboard from "@/pages/dashboard";
import TeeTimes from "@/pages/tee-times";
import Dining from "@/pages/dining";
import GPS from "@/pages/gps";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="flex min-h-screen bg-background">
      <Navigation />
      <main className="flex-1 lg:ml-64 pb-16 lg:pb-0">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/tee-times" component={TeeTimes} />
          <Route path="/dining" component={Dining} />
          <Route path="/gps" component={GPS} />
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

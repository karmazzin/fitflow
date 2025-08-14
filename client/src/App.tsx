import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import Setup from "@/pages/setup";
import Overview from "@/pages/overview";
import Workout from "@/pages/workout";
import Complete from "@/pages/complete";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/setup" component={Setup} />
      <Route path="/overview" component={Overview} />
      <Route path="/workout/:dayType" component={Workout} />
      <Route path="/complete" component={Complete} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <TooltipProvider>
      <div className="min-h-screen bg-app-background">
        <Toaster />
        <Router />
      </div>
    </TooltipProvider>
  );
}

export default App;

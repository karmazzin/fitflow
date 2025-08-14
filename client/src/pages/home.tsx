import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Home() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Check if user has completed setup
    const hasCompletedSetup = localStorage.getItem("fitflow-setup-complete");
    
    if (hasCompletedSetup) {
      setLocation("/overview");
    } else {
      setLocation("/setup");
    }
  }, [setLocation]);

  return (
    <div className="min-h-screen bg-app-background flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">FitFlow</h1>
        <p className="text-neutral">Loading...</p>
      </div>
    </div>
  );
}

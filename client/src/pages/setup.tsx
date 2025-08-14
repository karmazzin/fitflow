import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Dumbbell, RefreshCw } from "lucide-react";

export default function Setup() {
  const [, setLocation] = useLocation();
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [autoProgression, setAutoProgression] = useState(true);

  const handleCompleteSetup = () => {
    // Save setup data to localStorage
    const setupData = {
      startDate,
      currentWeek,
      autoProgression,
      completedAt: new Date().toISOString(),
    };
    
    localStorage.setItem("fitflow-setup", JSON.stringify(setupData));
    localStorage.setItem("fitflow-setup-complete", "true");
    
    setLocation("/overview");
  };

  const incrementWeek = () => {
    if (currentWeek < 12) setCurrentWeek(currentWeek + 1);
  };

  const decrementWeek = () => {
    if (currentWeek > 1) setCurrentWeek(currentWeek - 1);
  };

  return (
    <div className="min-h-screen bg-app-background p-5 pt-12 pb-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Welcome to FitFlow</h1>
        <p className="text-neutral text-lg">Your progressive training companion</p>
      </div>

      <div className="space-y-6 max-w-md mx-auto">
        {/* Step 1: Start Date */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center text-text-primary">
              <Calendar className="text-primary mr-3 h-5 w-5" />
              Training Start Date
            </h3>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input-field"
            />
          </CardContent>
        </Card>

        {/* Step 2: Current Week */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center text-text-primary">
              <Dumbbell className="text-primary mr-3 h-5 w-5" />
              Current Training Week
            </h3>
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="icon"
                onClick={decrementWeek}
                disabled={currentWeek <= 1}
                className="w-12 h-12 rounded-xl"
              >
                <span className="text-neutral">−</span>
              </Button>
              <div className="text-center">
                <span className="text-2xl font-bold text-text-primary">{currentWeek}</span>
                <p className="text-sm text-neutral">Week</p>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={incrementWeek}
                disabled={currentWeek >= 12}
                className="w-12 h-12 rounded-xl"
              >
                <span className="text-neutral">+</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Step 3: Auto Progression */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center text-text-primary">
              <RefreshCw className="text-primary mr-3 h-5 w-5" />
              Auto Week Progression
            </h3>
            <div className="flex items-center justify-between">
              <span className="text-text-primary">Automatically advance weeks</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={autoProgression}
                  onChange={(e) => setAutoProgression(e.target.checked)}
                />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </CardContent>
        </Card>
      </div>

      <Button 
        onClick={handleCompleteSetup}
        className="w-full mt-8 max-w-md mx-auto block btn-primary"
      >
        Start Training Program
      </Button>
    </div>
  );
}

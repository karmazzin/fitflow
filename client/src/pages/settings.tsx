import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Download, RotateCcw } from "lucide-react";
import { useWorkout } from "@/hooks/use-workout";

export default function Settings() {
  const [, setLocation] = useLocation();
  const { currentWeek, setCurrentWeek } = useWorkout();
  const [autoProgression, setAutoProgression] = useState(true);
  const [workoutReminders, setWorkoutReminders] = useState(true);
  const [restDayAlerts, setRestDayAlerts] = useState(false);

  useEffect(() => {
    // Load settings from localStorage
    const setupData = localStorage.getItem("fitflow-setup");
    if (setupData) {
      const setup = JSON.parse(setupData);
      setAutoProgression(setup.autoProgression || true);
    }
    
    const settings = localStorage.getItem("fitflow-settings");
    if (settings) {
      const userSettings = JSON.parse(settings);
      setWorkoutReminders(userSettings.workoutReminders ?? true);
      setRestDayAlerts(userSettings.restDayAlerts ?? false);
    }
  }, []);

  const handleBackToOverview = () => {
    setLocation("/overview");
  };

  const incrementWeek = () => {
    if (currentWeek < 12) {
      const newWeek = currentWeek + 1;
      setCurrentWeek(newWeek);
      updateSetupData({ currentWeek: newWeek });
    }
  };

  const decrementWeek = () => {
    if (currentWeek > 1) {
      const newWeek = currentWeek - 1;
      setCurrentWeek(newWeek);
      updateSetupData({ currentWeek: newWeek });
    }
  };

  const updateSetupData = (updates: any) => {
    const setupData = JSON.parse(localStorage.getItem("fitflow-setup") || "{}");
    const updatedData = { ...setupData, ...updates };
    localStorage.setItem("fitflow-setup", JSON.stringify(updatedData));
  };

  const updateSettings = (updates: any) => {
    const settings = JSON.parse(localStorage.getItem("fitflow-settings") || "{}");
    const updatedSettings = { ...settings, ...updates };
    localStorage.setItem("fitflow-settings", JSON.stringify(updatedSettings));
  };

  const handleAutoProgressionChange = (checked: boolean) => {
    setAutoProgression(checked);
    updateSetupData({ autoProgression: checked });
  };

  const handleWorkoutRemindersChange = (checked: boolean) => {
    setWorkoutReminders(checked);
    updateSettings({ workoutReminders: checked });
  };

  const handleRestDayAlertsChange = (checked: boolean) => {
    setRestDayAlerts(checked);
    updateSettings({ restDayAlerts: checked });
  };

  const handleExportData = () => {
    const allData = {
      setup: JSON.parse(localStorage.getItem("fitflow-setup") || "{}"),
      settings: JSON.parse(localStorage.getItem("fitflow-settings") || "{}"),
      completedWorkouts: JSON.parse(localStorage.getItem("fitflow-completed-workouts") || "[]"),
      exportedAt: new Date().toISOString(),
    };
    
    const dataStr = JSON.stringify(allData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `fitflow-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  const handleResetProgress = () => {
    if (confirm("Are you sure you want to reset all progress? This action cannot be undone.")) {
      localStorage.removeItem("fitflow-completed-workouts");
      localStorage.removeItem("fitflow-last-workout");
      setCurrentWeek(1);
      updateSetupData({ currentWeek: 1 });
      alert("Progress has been reset successfully.");
    }
  };

  return (
    <div className="min-h-screen bg-app-background p-5 pt-12">
      {/* Header */}
      <div className="flex items-center mb-8">
        <Button
          variant="outline"
          size="icon"
          onClick={handleBackToOverview}
          className="w-10 h-10 bg-muted border-muted text-text-primary hover:bg-muted/80 mr-4"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-bold text-text-primary">Settings</h1>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6 max-w-md mx-auto">
        {/* Training Settings */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-text-primary mb-4">Training Program</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-text-primary">Current Week</span>
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={decrementWeek}
                    disabled={currentWeek <= 1}
                    className="w-8 h-8 p-0"
                  >
                    <span className="text-xs">−</span>
                  </Button>
                  <span className="text-lg font-bold text-text-primary w-8 text-center">{currentWeek}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={incrementWeek}
                    disabled={currentWeek >= 12}
                    className="w-8 h-8 p-0"
                  >
                    <span className="text-xs">+</span>
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-text-primary">Auto Progression</span>
                  <p className="text-neutral text-sm">Advance weeks automatically</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={autoProgression}
                    onChange={(e) => handleAutoProgressionChange(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-text-primary mb-4">Notifications</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-text-primary">Workout Reminders</span>
                  <p className="text-neutral text-sm">Daily training notifications</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={workoutReminders}
                    onChange={(e) => handleWorkoutRemindersChange(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-text-primary">Rest Day Alerts</span>
                  <p className="text-neutral text-sm">Recovery day reminders</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={restDayAlerts}
                    onChange={(e) => handleRestDayAlertsChange(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data & Privacy */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-text-primary mb-4">Data & Privacy</h3>
            <div className="space-y-3">
              <Button
                variant="ghost"
                onClick={handleExportData}
                className="w-full justify-between text-left p-3 h-auto"
              >
                <span className="text-text-primary">Export Workout Data</span>
                <Download className="h-4 w-4 text-neutral" />
              </Button>
              <Button
                variant="ghost"
                onClick={handleResetProgress}
                className="w-full justify-between text-left p-3 h-auto text-destructive hover:text-destructive"
              >
                <span>Reset All Progress</span>
                <RotateCcw className="h-4 w-4 text-neutral" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* About */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-text-primary mb-4">About</h3>
            <div className="space-y-2 text-sm text-neutral">
              <p>FitFlow v2.1.0</p>
              <p>Progressive training companion for structured workouts</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

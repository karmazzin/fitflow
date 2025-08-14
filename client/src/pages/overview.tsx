import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Settings, ChevronRight, CheckCircle, PlayCircle, Clock, Flame, Trophy } from "lucide-react";
import { useWorkout } from "@/hooks/use-workout";

export default function Overview() {
  const [, setLocation] = useLocation();
  const { currentWeek, totalWorkouts, streak, getTrainingDays } = useWorkout();
  const [trainingDays, setTrainingDays] = useState<Array<{
    type: string;
    name: string;
    exercises: number;
    duration: string;
  }>>([]);

  useEffect(() => {
    setTrainingDays(getTrainingDays());
  }, [currentWeek]);

  const handleStartWorkout = (dayType: string) => {
    setLocation(`/workout/${dayType}`);
  };

  const openSettings = () => {
    setLocation("/settings");
  };

  const weekProgress = (currentWeek / 7) * 100;

  const getDayStatus = (dayType: string) => {
    const completedWorkouts = JSON.parse(localStorage.getItem("fitflow-completed-workouts") || "[]");
    const todayKey = `${currentWeek}-${dayType}-${new Date().toDateString()}`;
    
    if (completedWorkouts.includes(todayKey)) {
      return { status: "completed", icon: CheckCircle, color: "text-success", text: "Completed" };
    }
    
    // Check if this is the next scheduled workout
    const lastCompletedDay = completedWorkouts[completedWorkouts.length - 1];
    if (!lastCompletedDay || shouldShowAsReady(dayType, lastCompletedDay)) {
      return { status: "ready", icon: PlayCircle, color: "text-primary", text: "Ready to start" };
    }
    
    return { status: "scheduled", icon: Clock, color: "text-neutral", text: "Scheduled" };
  };

  const shouldShowAsReady = (dayType: string, lastCompleted: string) => {
    // Simple logic: show first uncompleted day as ready
    return true;
  };

  const getBorderColor = (status: string) => {
    switch (status) {
      case "completed": return "border-l-success";
      case "ready": return "border-l-primary";
      default: return "border-l-muted";
    }
  };

  return (
    <div className="min-h-screen bg-app-background">
      {/* Header */}
      <div className="bg-secondary text-white p-5 pt-12">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold">Week {currentWeek}</h1>
            <p className="text-blue-200">Progressive Training Program</p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={openSettings}
            className="w-10 h-10 bg-blue-700 border-blue-700 text-white hover:bg-blue-600"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Progress Bar */}
        <div className="bg-blue-700 rounded-full h-2 mb-4">
          <div 
            className="bg-primary rounded-full h-2 transition-all duration-300" 
            style={{ width: `${Math.min(weekProgress, 100)}%` }}
          />
        </div>
        <p className="text-sm text-blue-200">{currentWeek} of 7 weeks completed</p>
      </div>

      {/* Training Days Grid */}
      <div className="p-5">
        <h2 className="text-lg font-semibold mb-4 text-text-primary">This Week's Training</h2>
        
        <div className="space-y-4">
          {trainingDays.map((day) => {
            const dayStatus = getDayStatus(day.type);
            const StatusIcon = dayStatus.icon;
            
            return (
              <Card 
                key={day.type}
                className={`cursor-pointer hover:shadow-md transition-shadow border-l-4 ${getBorderColor(dayStatus.status)}`}
                onClick={() => handleStartWorkout(day.type)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-text-primary">{day.name}</h3>
                      <p className="text-neutral text-sm">{day.exercises} exercises • {day.duration} min</p>
                      <div className="flex items-center mt-2">
                        <StatusIcon className={`${dayStatus.color} mr-2 h-4 w-4`} />
                        <span className={`${dayStatus.color} text-sm`}>{dayStatus.text}</span>
                      </div>
                    </div>
                    <ChevronRight className="text-neutral h-5 w-5" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Flame className="text-primary text-2xl mb-2 h-8 w-8 mx-auto" />
              <p className="text-2xl font-bold text-text-primary">{totalWorkouts}</p>
              <p className="text-neutral text-sm">Workouts Done</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Trophy className="text-success text-2xl mb-2 h-8 w-8 mx-auto" />
              <p className="text-2xl font-bold text-text-primary">{streak}</p>
              <p className="text-neutral text-sm">Day Streak</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Share } from "lucide-react";
import { workoutData } from "@/lib/workout-data";

export default function Complete() {
  const [, setLocation] = useLocation();
  const [workoutStats, setWorkoutStats] = useState<{
    duration: number;
    exercisesCompleted: number;
    totalExercises: number;
    caloriesBurned: number;
    dayType: string;
    week: number;
    completedAt: string;
  } | null>(null);

  useEffect(() => {
    const stats = localStorage.getItem("fitflow-last-workout");
    if (stats) {
      setWorkoutStats(JSON.parse(stats));
    }
  }, []);

  const handleBackToOverview = () => {
    setLocation("/overview");
  };

  const handleShareWorkout = () => {
    if (navigator.share && workoutStats) {
      navigator.share({
        title: "FitFlow - Тренировка завершена!",
        text: `Только что завершил тренировку длительностью ${formatTime(workoutStats.duration)} с ${workoutStats.exercisesCompleted} упражнениями!`,
        url: window.location.origin,
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      const shareText = `Только что завершил тренировку ${workoutStats ? formatTime(workoutStats.duration) : ''} с FitFlow! 💪`;
      navigator.clipboard.writeText(shareText);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getNextWorkoutInfo = () => {
    if (!workoutStats) return { day: "Следующая тренировка", exercises: "8" };
    
    const dayMap: { [key: string]: string } = { "A": "B", "B": "C", "C": "A" };
    const nameMap: { [key: string]: string } = { 
      "A": "День A", 
      "B": "День B", 
      "C": "День C" 
    };
    
    const nextDay = dayMap[workoutStats.dayType] || "A";
    const nextDayData = workoutData.trainingDays.find(day => day.type === nextDay);
    
    return {
      day: nameMap[nextDay] || "День A",
      exercises: nextDayData?.exercises.toString() || "5"
    };
  };

  const getCurrentWorkoutExercises = () => {
    if (!workoutStats) return [];
    
    const dayType = workoutStats.dayType;
    const workout = workoutData.workouts[dayType as keyof typeof workoutData.workouts];
    
    if (!workout) return [];
    
    return workout.exercises.slice(0, Math.min(4, workout.exercises.length));
  };

  const nextWorkout = getNextWorkoutInfo();

  if (!workoutStats) {
    return (
      <div className="min-h-screen bg-app-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-neutral">Загрузка результатов тренировки...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-background p-5 pt-12 text-center">
      {/* Success Animation Area */}
      <div className="mb-8">
        <div className="w-24 h-24 bg-success rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="text-white h-12 w-12" />
        </div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">Тренировка завершена!</h1>
        <p className="text-neutral">Отличная работа! Вы завершили {workoutStats.dayType === "A" ? "День A" : workoutStats.dayType === "B" ? "День B" : "День C"}</p>
      </div>

      {/* Workout Statistics */}
      <div className="space-y-4 mb-8 max-w-md mx-auto">
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-text-primary">{formatTime(workoutStats.duration)}</p>
                <p className="text-neutral text-sm">Время</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">{workoutStats.exercisesCompleted}</p>
                <p className="text-neutral text-sm">Упражнения</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">{workoutStats.caloriesBurned}</p>
                <p className="text-neutral text-sm">Калории</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exercise Summary */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-text-primary mb-4 text-left">Выполненные упражнения</h3>
            <div className="space-y-3">
              {getCurrentWorkoutExercises().map((exercise, index) => (
                <div key={exercise.id} className="flex items-center justify-between">
                  <span className="text-text-primary text-sm">{exercise.name}</span>
                  <span className="text-success">
                    <CheckCircle className="inline h-4 w-4 mr-1" />
                    <span className="text-xs">Завершено</span>
                  </span>
                </div>
              ))}
              {getCurrentWorkoutExercises().length === 0 && (
                <div className="text-center text-neutral py-4">
                  <p>Данные о упражнениях недоступны</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Next Workout Preview */}
        <div className="bg-gradient-to-r from-primary to-orange-500 rounded-xl p-6 text-white">
          <h3 className="font-semibold mb-2">Следующая тренировка</h3>
          <p className="mb-3">{nextWorkout.day} • {nextWorkout.exercises} упражнений</p>
          <p className="text-sm opacity-90">Рекомендуемый отдых: 1-2 дня</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 max-w-md mx-auto">
        <Button 
          onClick={handleBackToOverview}
          className="w-full btn-primary"
        >
          Вернуться к обзору
        </Button>
        <Button 
          variant="outline"
          onClick={handleShareWorkout}
          className="w-full btn-secondary"
        >
          <Share className="mr-2 h-4 w-4" />
          Поделиться тренировкой
        </Button>
      </div>
    </div>
  );
}

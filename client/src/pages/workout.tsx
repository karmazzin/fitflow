import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pause, Play } from "lucide-react";
import { useWorkout } from "@/hooks/use-workout";
import { useTimer } from "@/hooks/use-timer";
import ExerciseCard from "@/components/exercise-card";
import SwipeableContainer from "@/components/swipeable-container";

export default function Workout() {
  const [match, params] = useRoute("/workout/:dayType");
  const [, setLocation] = useLocation();
  const { getWorkoutByDay, currentWeek } = useWorkout();
  const { time, start, pause, reset } = useTimer();
  
  // Three-phase workout state
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0); // 0=warm-up, 1=main, 2=cool-down
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [workoutData, setWorkoutData] = useState<{
    name: string;
    type: string;
    warmUp: Array<{
      id: string;
      name: string;
      phase: string;
      instructions: string[];
      imageUrl: string;
      videoUrl: string;
      weekFormulas: Record<string, string>;
    }>;
    mainTraining: Array<{
      id: string;
      name: string;
      phase: string;
      instructions: string[];
      imageUrl: string;
      videoUrl: string;
      weekFormulas: Record<string, string>;
    }>;
    coolDown: Array<{
      id: string;
      name: string;
      phase: string;
      instructions: string[];
      imageUrl: string;
      videoUrl: string;
      weekFormulas: Record<string, string>;
    }>;
  } | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [workoutStarted, setWorkoutStarted] = useState(false);

  // Workout phase configuration
  const phases = ['warmUp', 'mainTraining', 'coolDown'] as const;
  const phaseNames = ['Warm-up', 'Main Training', 'Cool-down'] as const;
  
  // Get current phase data
  const currentPhaseName = phaseNames[currentPhaseIndex];
  const currentPhaseKey = phases[currentPhaseIndex];
  const currentPhaseExercises = workoutData?.[currentPhaseKey] || [];
  const currentExercise = currentPhaseExercises[currentExerciseIndex];

  // Calculate totals
  const totalExercises = (workoutData?.warmUp?.length || 0) + 
                        (workoutData?.mainTraining?.length || 0) + 
                        (workoutData?.coolDown?.length || 0);
  
  // Calculate current overall exercise index for progress
  const getOverallIndex = () => {
    let index = 0;
    for (let i = 0; i < currentPhaseIndex; i++) {
      const phaseKey = phases[i];
      index += workoutData?.[phaseKey]?.length || 0;
    }
    index += currentExerciseIndex;
    return index;
  };

  useEffect(() => {
    if (params?.dayType) {
      const workout = getWorkoutByDay(params.dayType);
      setWorkoutData(workout);
    }
  }, [params?.dayType]);

  const handleStartWorkout = () => {
    setWorkoutStarted(true);
    start();
  };

  const handleBackToOverview = () => {
    pause();
    setLocation("/overview");
  };

  const handlePauseWorkout = () => {
    if (isPaused) {
      start();
    } else {
      pause();
    }
    setIsPaused(!isPaused);
  };

  const handleNextExercise = () => {
    if (currentExerciseIndex < currentPhaseExercises.length - 1) {
      // Move to next exercise in current phase
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    } else if (currentPhaseIndex < phases.length - 1) {
      // Move to next phase
      setCurrentPhaseIndex(currentPhaseIndex + 1);
      setCurrentExerciseIndex(0);
    } else {
      // Complete workout
      completeWorkout();
    }
  };

  const handlePrevExercise = () => {
    if (currentExerciseIndex > 0) {
      // Move to previous exercise in current phase
      setCurrentExerciseIndex(currentExerciseIndex - 1);
    } else if (currentPhaseIndex > 0) {
      // Move to previous phase
      const prevPhaseIndex = currentPhaseIndex - 1;
      const prevPhaseKey = phases[prevPhaseIndex];
      const prevPhaseExercises = workoutData?.[prevPhaseKey] || [];
      setCurrentPhaseIndex(prevPhaseIndex);
      setCurrentExerciseIndex(prevPhaseExercises.length - 1);
    }
  };

  const completeWorkout = () => {
    pause();
    
    // Save workout completion
    const completedWorkouts = JSON.parse(localStorage.getItem("fitflow-completed-workouts") || "[]");
    const workoutKey = `${currentWeek}-${params?.dayType}-${new Date().toDateString()}`;
    completedWorkouts.push(workoutKey);
    localStorage.setItem("fitflow-completed-workouts", JSON.stringify(completedWorkouts));
    
    // Save workout stats
    const workoutStats = {
      duration: time,
      exercisesCompleted: totalExercises,
      totalExercises: totalExercises,
      caloriesBurned: Math.floor((time / 60) * 8), // Rough estimate: 8 cal/min
      dayType: params?.dayType,
      week: currentWeek,
      completedAt: new Date().toISOString(),
    };
    localStorage.setItem("fitflow-last-workout", JSON.stringify(workoutStats));
    
    setLocation("/complete");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Navigation helpers
  const canGoNext = currentPhaseIndex < phases.length - 1 || currentExerciseIndex < currentPhaseExercises.length - 1;
  const canGoPrev = currentPhaseIndex > 0 || currentExerciseIndex > 0;
  const isLast = currentPhaseIndex === phases.length - 1 && currentExerciseIndex === currentPhaseExercises.length - 1;

  if (!workoutData) {
    return (
      <div className="min-h-screen bg-app-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-neutral">Loading workout...</p>
        </div>
      </div>
    );
  }

  if (!currentExercise) {
    return (
      <div className="min-h-screen bg-app-background flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">No Exercise Data</h2>
          <p className="text-muted-foreground mb-6">Unable to load exercise for Day {params?.dayType}</p>
          <Button onClick={() => setLocation('/overview')}>
            Back to Overview
          </Button>
        </div>
      </div>
    );
  }

  const exerciseProgress = ((getOverallIndex() + 1) / totalExercises) * 100;

  return (
    <div className="min-h-screen bg-app-background">
      {/* Workout Header */}
      <div className="bg-secondary text-white p-5 pt-12 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handleBackToOverview}
            className="w-10 h-10 bg-blue-700 border-blue-700 text-white hover:bg-blue-600"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="text-center">
            <h1 className="font-bold">{workoutData.name}</h1>
            <p className="text-blue-200 text-sm">Week {currentWeek} • {currentPhaseName}</p>
          </div>
          {workoutStarted ? (
            <Button
              variant="outline"
              size="icon"
              onClick={handlePauseWorkout}
              className="w-10 h-10 bg-blue-700 border-blue-700 text-white hover:bg-blue-600"
            >
              {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </Button>
          ) : (
            <div className="w-10 h-10"></div>
          )}
        </div>
        
        {/* Phase Progress Indicator */}
        <div className="flex space-x-2 mb-4">
          {phases.map((phase, index) => (
            <div key={phase} className="flex-1 relative">
              <div className={`h-1 rounded-full transition-colors ${
                index < currentPhaseIndex ? 'bg-primary' :
                index === currentPhaseIndex ? 'bg-primary/60' : 'bg-blue-700'
              }`} />
              <div className={`text-xs text-center mt-1 transition-colors ${
                index === currentPhaseIndex ? 'text-primary font-semibold' : 'text-blue-200'
              }`}>
                {phaseNames[index]}
              </div>
            </div>
          ))}
        </div>
        
        {/* Exercise Progress */}
        <div className="flex items-center justify-between text-sm">
          <span>Exercise {getOverallIndex() + 1} of {totalExercises}</span>
          <span>{formatTime(time)}</span>
        </div>
        <div className="bg-blue-700 rounded-full h-2 mt-2">
          <div 
            className="bg-primary rounded-full h-2 transition-all duration-300" 
            style={{ width: `${exerciseProgress}%` }}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Exercise Card Container */}
        <div className="flex-1 relative overflow-hidden">
          {!workoutStarted ? (
            // Start Screen
            <div className="flex items-center justify-center h-full p-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Ready to start your workout?</h2>
                <p className="text-muted-foreground mb-8">
                  Today's workout includes {currentPhaseName} with {currentPhaseExercises.length} exercises
                </p>
                <Button onClick={handleStartWorkout} className="btn-primary text-lg px-8 py-4">
                  Start {currentPhaseName}
                </Button>
              </div>
            </div>
          ) : (
            // Workout in Progress
            <SwipeableContainer
              onSwipeLeft={handleNextExercise}
              onSwipeRight={handlePrevExercise}
              currentIndex={getOverallIndex()}
              totalItems={totalExercises}
            >
              <ExerciseCard
                exercise={currentExercise}
                week={currentWeek}
                onComplete={handleNextExercise}
                onSkip={handleNextExercise}
                isActive={true}
              />
            </SwipeableContainer>
          )}
        </div>

        {/* Bottom Controls */}
        {workoutStarted && (
          <div className="bg-background/90 backdrop-blur-sm border-t p-4 flex-shrink-0">
            <div className="flex space-x-3">
              <Button
                onClick={handlePauseWorkout}
                variant="outline"
                className="flex-1"
              >
                {isPaused ? 'Resume' : 'Pause'}
              </Button>
              <Button
                onClick={handleNextExercise}
                className="flex-1 btn-primary"
                disabled={!canGoNext && !isLast}
              >
                {isLast ? 'Complete Workout' : 'Next Exercise'}
              </Button>
            </div>

            {/* Exercise Progress Indicators */}
            <div className="flex justify-center mt-4">
              <div className="flex space-x-1">
                {Array.from({ length: totalExercises }).map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === getOverallIndex() ? 'bg-primary' : 
                      index < getOverallIndex() ? 'bg-primary/60' : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
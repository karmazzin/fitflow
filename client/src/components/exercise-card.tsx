import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Pause, SkipForward, CheckCircle } from "lucide-react";

interface Exercise {
  id: string;
  name: string;
  phase: string;
  instructions: string[];
  imageUrl: string;
  videoUrl?: string;
  weekFormulas: Record<string, string>;
}

interface ExerciseCardProps {
  exercise: Exercise;
  week: number;
  onComplete: () => void;
  onSkip: () => void;
  isActive: boolean;
}

export default function ExerciseCard({ exercise, week, onComplete, onSkip, isActive }: ExerciseCardProps) {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Video URL - use the exercise's individual video URL or fallback to stub URL
  const videoUrl = exercise.videoUrl || "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

  const getWeekFormula = () => {
    if (exercise.weekFormulas && exercise.weekFormulas[week.toString()]) {
      return exercise.weekFormulas[week.toString()];
    }
    
    // Default formulas based on week
    const defaultFormulas = {
      1: "3 sets × 8-10 reps @ RPE 6-7",
      2: "3 sets × 10-12 reps @ RPE 6-7", 
      3: "4 sets × 8-10 reps @ RPE 7-8",
      4: "4 sets × 12-15 reps @ RPE 7-8",
      5: "4 sets × 10-12 reps @ RPE 8-9",
      6: "5 sets × 8-10 reps @ RPE 8-9",
      7: "5 sets × 12-15 reps @ RPE 9",
    };
    
    return defaultFormulas[week as keyof typeof defaultFormulas] || "3 sets × 10 reps";
  };

  const getRestTime = () => {
    if (week <= 2) return "60-90 seconds between sets";
    if (week <= 4) return "90-120 seconds between sets";
    return "120-180 seconds between sets";
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
      setCurrentTime(current);
      setVideoProgress((current / duration) * 100);
    }
  };

  const handleVideoLoadedMetadata = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration);
    }
  };

  const handleVideoEnded = () => {
    setIsVideoPlaying(false);
    setVideoProgress(0);
    setCurrentTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isActive) {
    return (
      <Card className="h-full opacity-50">
        <div className="relative bg-gray-900 rounded-t-xl overflow-hidden" style={{ height: "40%" }}>
          <video
            src={videoUrl}
            className="w-full h-full object-cover"
            preload="metadata"
            muted
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Play className="text-white h-4 w-4 ml-0.5" />
            </div>
          </div>
        </div>
        <CardContent className="p-6">
          <h3 className="text-lg font-bold text-text-primary">{exercise.name}</h3>
          <p className="text-neutral">Next Exercise</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full shadow-lg">
      {/* Video Section */}
      <div className="relative bg-gray-900 rounded-t-xl overflow-hidden" style={{ height: "40%" }}>
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-cover"
          onTimeUpdate={handleVideoTimeUpdate}
          onLoadedMetadata={handleVideoLoadedMetadata}
          onEnded={handleVideoEnded}
          onPlay={() => setIsVideoPlaying(true)}
          onPause={() => setIsVideoPlaying(false)}
          playsInline
          preload="metadata"
        />
        
        {/* Play/Pause Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
          <Button
            size="lg"
            onClick={handlePlayPause}
            className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition-all"
          >
            {isVideoPlaying ? (
              <Pause className="text-white h-6 w-6" />
            ) : (
              <Play className="text-white h-6 w-6 ml-1" />
            )}
          </Button>
        </div>
        
        {/* Video Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
          <div className="flex items-center justify-between text-white text-sm">
            <span>{formatTime(currentTime)}</span>
            <div className="flex-1 mx-4">
              <div className="bg-gray-600 rounded-full h-1">
                <div 
                  className="bg-primary rounded-full h-1 transition-all" 
                  style={{ width: `${videoProgress}%` }}
                />
              </div>
            </div>
            <span>{formatTime(videoDuration)}</span>
          </div>
        </div>
      </div>

      {/* Exercise Info */}
      <CardContent className="flex-1 p-6 flex flex-col">
        <h3 className="text-xl font-bold text-text-primary mb-2">{exercise.name}</h3>
        
        {/* Week-specific Formula */}
        <div className="bg-primary bg-opacity-10 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-text-primary mb-2">Week {week} Formula</h4>
          <p className="text-text-primary">{getWeekFormula()}</p>
          <p className="text-neutral text-sm mt-1">{getRestTime()}</p>
        </div>

        {/* Instructions */}
        <div className="flex-1">
          <h4 className="font-medium text-text-primary mb-3">Instructions</h4>
          <ul className="space-y-2 text-text-primary text-sm">
            {exercise.instructions?.map((instruction: string, index: number) => (
              <li key={index} className="flex items-start">
                <span className="text-primary mr-2">•</span>
                {instruction}
              </li>
            )) || (
              <>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  Hold dumbbell vertically at chest level with both hands
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  Feet shoulder-width apart, toes slightly out
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  Lower until thighs parallel to ground
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  Push through heels to return to start
                </li>
              </>
            )}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            onClick={onSkip}
            className="flex-1 btn-secondary"
          >
            <SkipForward className="mr-2 h-4 w-4" />
            Skip
          </Button>
          <Button
            onClick={onComplete}
            className="flex-1 btn-primary"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Complete Set
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

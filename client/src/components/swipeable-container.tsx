import { useState, useRef, ReactNode } from "react";

interface SwipeableContainerProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  currentIndex: number;
  totalItems: number;
}

export default function SwipeableContainer({ 
  children, 
  onSwipeLeft, 
  onSwipeRight, 
  currentIndex, 
  totalItems 
}: SwipeableContainerProps) {
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isSwipeInProgress, setIsSwipeInProgress] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    // Prevent swipe on interactive elements
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('[role="button"]') || target.closest('video')) {
      return;
    }
    
    setIsSwipeInProgress(true);
    setHasMoved(false);
    setStartX(e.touches[0].clientX);
    setCurrentX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwipeInProgress) return;
    
    setCurrentX(e.touches[0].clientX);
    const deltaX = e.touches[0].clientX - startX;
    
    // Mark as moved if there's significant movement
    if (Math.abs(deltaX) > 10) {
      setHasMoved(true);
    }
    
    // Only apply visual feedback for significant movement
    if (containerRef.current && Math.abs(deltaX) > 20) {
      containerRef.current.style.transform = `translateX(${deltaX}px)`;
      containerRef.current.style.opacity = `${1 - Math.abs(deltaX) / 400}`;
    }
  };

  const handleTouchEnd = () => {
    if (!isSwipeInProgress) return;
    
    const deltaX = currentX - startX;
    const threshold = 80;
    const minSwipeDistance = 80;
    
    // Only trigger swipe if there was actual movement AND the user moved enough
    if (hasMoved && Math.abs(deltaX) > threshold && Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX > 0 && onSwipeRight && currentIndex > 0) {
        onSwipeRight();
      } else if (deltaX < 0 && onSwipeLeft && currentIndex < totalItems - 1) {
        onSwipeLeft();
      }
    }
    
    // Reset container position
    if (containerRef.current) {
      containerRef.current.style.transform = 'translateX(0)';
      containerRef.current.style.opacity = '1';
    }
    
    setIsSwipeInProgress(false);
    setHasMoved(false);
    setStartX(0);
    setCurrentX(0);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Prevent swipe on interactive elements
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('[role="button"]') || target.closest('video')) {
      return;
    }
    
    setIsSwipeInProgress(true);
    setHasMoved(false);
    setStartX(e.clientX);
    setCurrentX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isSwipeInProgress) return;
    
    setCurrentX(e.clientX);
    const deltaX = e.clientX - startX;
    
    // Mark as moved if there's significant movement
    if (Math.abs(deltaX) > 10) {
      setHasMoved(true);
    }
    
    // Only apply visual feedback for significant movement
    if (containerRef.current && Math.abs(deltaX) > 20) {
      containerRef.current.style.transform = `translateX(${deltaX}px)`;
      containerRef.current.style.opacity = `${1 - Math.abs(deltaX) / 400}`;
    }
  };

  const handleMouseUp = () => {
    if (!isSwipeInProgress) return;
    
    const deltaX = currentX - startX;
    const threshold = 80;
    const minSwipeDistance = 80;
    
    // Only trigger swipe if there was actual movement AND the user moved enough
    if (hasMoved && Math.abs(deltaX) > threshold && Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX > 0 && onSwipeRight && currentIndex > 0) {
        onSwipeRight();
      } else if (deltaX < 0 && onSwipeLeft && currentIndex < totalItems - 1) {
        onSwipeLeft();
      }
    }
    
    // Reset container position
    if (containerRef.current) {
      containerRef.current.style.transform = 'translateX(0)';
      containerRef.current.style.opacity = '1';
    }
    
    setIsSwipeInProgress(false);
    setHasMoved(false);
    setStartX(0);
    setCurrentX(0);
  };

  return (
    <div
      ref={containerRef}
      className="exercise-card transition-transform duration-300 ease-out"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ userSelect: 'none' }}
    >
      {children}
    </div>
  );
}

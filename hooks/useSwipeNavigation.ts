import { useRef, useState } from 'react';

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeDown?: () => void;
}

export const useSwipeNavigation = ({ onSwipeLeft, onSwipeRight, onSwipeDown }: SwipeHandlers) => {
  const touchStart = useRef<{x: number, y: number} | null>(null);
  const touchEnd = useRef<{x: number, y: number} | null>(null);
  const [direction, setDirection] = useState<'left' | 'right' | 'none'>('none');

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEnd.current = { x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY };
  };

  const handleTouchEnd = () => {
    if (!touchStart.current || !touchEnd.current) return;

    const xDiff = touchStart.current.x - touchEnd.current.x;
    const yDiff = touchStart.current.y - touchEnd.current.y;
    const minSwipeDistance = 50;

    // Horizontal Swipe
    if (Math.abs(xDiff) > Math.abs(yDiff)) {
      if (Math.abs(xDiff) > minSwipeDistance) {
        if (xDiff > 0 && onSwipeLeft) {
          setDirection('left');
          onSwipeLeft();
        } else if (xDiff < 0 && onSwipeRight) {
          setDirection('right');
          onSwipeRight();
        }
      }
    } 
    // Vertical Swipe (Down to close)
    else {
      // Swipe up is negative yDiff, Swipe down is positive yDiff (start < end) ???
      // Actually: yDiff = start - end. 
      // Swipe Down: startY < endY -> yDiff is negative.
      if (yDiff < -100 && onSwipeDown) {
        onSwipeDown();
      }
    }

    touchStart.current = null;
    touchEnd.current = null;
  };

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    direction,
    setDirection
  };
};
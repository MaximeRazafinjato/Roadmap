import { useState, useCallback, useRef } from 'react';
import { addDays } from 'date-fns';

interface UseTimelinePanOptions {
  onPan?: (deltaX: number) => void;
}

export const useTimelinePan = ({ onPan }: UseTimelinePanOptions = {}) => {
  const [isPanning, setIsPanning] = useState(false);
  const [centerDate, setCenterDate] = useState(new Date());
  const panStartX = useRef<number>(0);
  const panStartDate = useRef<Date>(new Date());

  // Start panning
  const startPan = useCallback(
    (event: React.MouseEvent | MouseEvent) => {
      setIsPanning(true);
      panStartX.current = event.clientX;
      panStartDate.current = centerDate;

      // Prevent text selection while panning
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'grabbing';
    },
    [centerDate]
  );

  // Handle pan movement - throttled for better performance
  const handlePanMove = useCallback(
    (event: MouseEvent) => {
      if (!isPanning) return;

      const deltaX = event.clientX - panStartX.current;
      onPan?.(deltaX);

      // Calculate new center date based on pan distance
      // Adjust sensitivity based on viewport width for smoother pan
      const pixelsPerDay = 15; // Increased for less sensitivity
      const daysMoved = -deltaX / pixelsPerDay;
      const newCenterDate = addDays(panStartDate.current, daysMoved);

      // Use requestAnimationFrame for smoother updates
      requestAnimationFrame(() => {
        setCenterDate(newCenterDate);
      });
    },
    [isPanning, onPan]
  );

  // End panning
  const endPan = useCallback(() => {
    setIsPanning(false);
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
  }, []);

  // Pan to specific date
  const panToDate = useCallback((date: Date) => {
    setCenterDate(date);
  }, []);

  // Pan by a specific number of days
  const panByDays = useCallback((days: number) => {
    setCenterDate((prev) => addDays(prev, days));
  }, []);

  // Pan to today
  const panToToday = useCallback(() => {
    setCenterDate(new Date());
  }, []);

  return {
    isPanning,
    centerDate,
    startPan,
    handlePanMove,
    endPan,
    panToDate,
    panByDays,
    panToToday,
  };
};

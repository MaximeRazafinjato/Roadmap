import { useState, useCallback, useEffect } from 'react';
import { clamp, ZOOM_LEVELS } from '../utils/timeline-utils';

interface UseTimelineZoomOptions {
  initialZoom?: number;
  minZoom?: number;
  maxZoom?: number;
  zoomStep?: number;
}

export const useTimelineZoom = ({
  initialZoom = ZOOM_LEVELS.MONTH,
  minZoom = ZOOM_LEVELS.YEAR,
  maxZoom = ZOOM_LEVELS.DAY,
  zoomStep = 0.1,
}: UseTimelineZoomOptions = {}) => {
  const [zoomLevel, setZoomLevel] = useState(initialZoom);
  
  // Zoom in
  const zoomIn = useCallback(() => {
    setZoomLevel((prev) => clamp(prev + zoomStep, minZoom, maxZoom));
  }, [zoomStep, minZoom, maxZoom]);
  
  // Zoom out
  const zoomOut = useCallback(() => {
    setZoomLevel((prev) => clamp(prev - zoomStep, minZoom, maxZoom));
  }, [zoomStep, minZoom, maxZoom]);
  
  // Reset zoom
  const resetZoom = useCallback(() => {
    setZoomLevel(initialZoom);
  }, [initialZoom]);
  
  // Set zoom to specific level
  const setZoom = useCallback((level: number) => {
    setZoomLevel(clamp(level, minZoom, maxZoom));
  }, [minZoom, maxZoom]);
  
  // Handle wheel zoom
  const handleWheel = useCallback((event: WheelEvent) => {
    if (!event.ctrlKey && !event.metaKey) return;
    
    event.preventDefault();
    const delta = -Math.sign(event.deltaY) * zoomStep;
    setZoomLevel((prev) => clamp(prev + delta, minZoom, maxZoom));
  }, [zoomStep, minZoom, maxZoom]);
  
  // Attach wheel event listener
  useEffect(() => {
    const handleWheelWrapper = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        handleWheel(e);
      }
    };
    
    window.addEventListener('wheel', handleWheelWrapper, { passive: false });
    
    return () => {
      window.removeEventListener('wheel', handleWheelWrapper);
    };
  }, [handleWheel]);
  
  return {
    zoomLevel,
    zoomIn,
    zoomOut,
    resetZoom,
    setZoom,
    canZoomIn: zoomLevel < maxZoom,
    canZoomOut: zoomLevel > minZoom,
  };
};
import { useState, useCallback } from 'react';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import type { Step } from '../types/entities';
import type { TimelineViewport } from '../utils/timeline-utils';
import { calculateNewDates } from '../utils/timeline-utils';

interface UseTimelineDragOptions {
  onStepMove?: (step: Step, newDates: { startDate: Date; endDate: Date }) => void;
}

export const useTimelineDrag = ({ onStepMove }: UseTimelineDragOptions = {}) => {
  const [draggedStep, setDraggedStep] = useState<Step | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Handle drag start
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const step = event.active.data.current?.step as Step;
    if (step) {
      setDraggedStep(step);
      setIsDragging(true);
    }
  }, []);
  
  // Handle drag end
  const handleDragEnd = useCallback((event: DragEndEvent, viewport: TimelineViewport) => {
    const step = event.active.data.current?.step as Step;
    
    if (step && event.delta) {
      const newDates = calculateNewDates(
        step,
        event.delta.x,
        viewport
      );
      
      onStepMove?.(step, newDates);
    }
    
    setDraggedStep(null);
    setIsDragging(false);
  }, [onStepMove]);
  
  // Handle drag cancel
  const handleDragCancel = useCallback(() => {
    setDraggedStep(null);
    setIsDragging(false);
  }, []);
  
  return {
    draggedStep,
    isDragging,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  };
};
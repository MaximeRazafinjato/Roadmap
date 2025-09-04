import { useState, useCallback } from 'react';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import type { Project } from '../types/entities';
import type { TimelineViewport } from '../utils/timeline-utils';
import { calculateNewDates } from '../utils/timeline-utils';

interface UseTimelineDragOptions {
  onProjectMove?: (project: Project, newDates: { startDate: Date; endDate: Date }) => void;
}

export const useTimelineDrag = ({ onProjectMove }: UseTimelineDragOptions = {}) => {
  const [draggedProject, setDraggedProject] = useState<Project | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Handle drag start
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const project = event.active.data.current?.project as Project;
    if (project) {
      setDraggedProject(project);
      setIsDragging(true);
    }
  }, []);
  
  // Handle drag end
  const handleDragEnd = useCallback((event: DragEndEvent, viewport: TimelineViewport) => {
    const project = event.active.data.current?.project as Project;
    
    if (project && event.delta) {
      const newDates = calculateNewDates(
        project,
        event.delta.x,
        viewport
      );
      
      onProjectMove?.(project, newDates);
    }
    
    setDraggedProject(null);
    setIsDragging(false);
  }, [onProjectMove]);
  
  // Handle drag cancel
  const handleDragCancel = useCallback(() => {
    setDraggedProject(null);
    setIsDragging(false);
  }, []);
  
  return {
    draggedProject,
    isDragging,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  };
};
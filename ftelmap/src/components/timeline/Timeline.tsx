import { useRef, useEffect, useState, useMemo } from 'react';
import { Box, Paper, Typography, IconButton, ButtonGroup } from '@mui/material';
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  CenterFocusWeak as CenterIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { DndContext } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Step } from '../../types/entities';
import { TimelineStep } from './TimelineStep';
import { useTimelineZoom } from '../../hooks/use-timeline-zoom';
import { useTimelinePan } from '../../hooks/use-timeline-pan';
import { useTimelineDrag } from '../../hooks/use-timeline-drag';
import {
  calculateStepPosition,
  calculateViewportDates,
  generateTimeMarkers,
  isStepVisible,
  calculateResizedDates,
  TIMELINE_HEIGHT,
  type TimelineViewport,
} from '../../utils/timeline-utils';

interface TimelineProps {
  steps: Step[];
  onStepUpdate?: (step: Step, updates: Partial<Step>) => void;
  onStepEdit?: (step: Step) => void;
  onStepDelete?: (step: Step) => void;
  onStepAdd?: () => void;
}

export const Timeline = ({
  steps,
  onStepUpdate,
  onStepEdit,
  onStepDelete,
  onStepAdd,
}: TimelineProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(1200);

  // Hooks pour la gestion de la timeline
  const { zoomLevel, zoomIn, zoomOut, resetZoom, canZoomIn, canZoomOut } = useTimelineZoom();
  const { centerDate, isPanning, startPan, handlePanMove, endPan, panToToday } = useTimelinePan();
  const { isDragging, handleDragStart, handleDragEnd, handleDragCancel } = useTimelineDrag({
    onStepMove: (step, newDates) => {
      onStepUpdate?.(step, {
        startDate: newDates.startDate.toISOString(),
        endDate: newDates.endDate.toISOString(),
      });
    },
  });

  // Calcul du viewport
  const viewport: TimelineViewport = useMemo(() => {
    const { startDate, endDate } = calculateViewportDates(centerDate, zoomLevel, containerWidth);
    return {
      startDate,
      endDate,
      width: containerWidth,
      zoomLevel,
    };
  }, [centerDate, zoomLevel, containerWidth]);

  // Calcul des marqueurs de temps
  const timeMarkers = useMemo(() => {
    return generateTimeMarkers(viewport);
  }, [viewport]);

  // Filtrer et positionner les projets visibles
  const visibleProjects = useMemo(() => {
    return steps
      .filter((step) => isStepVisible(step, viewport))
      .map((step) => ({
        step,
        position: calculateStepPosition(step, viewport),
      }));
  }, [steps, viewport]);

  // Mise à jour de la largeur du container
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Gestion des événements de pan avec la souris
  useEffect(() => {
    if (isPanning) {
      const handleMouseMove = (e: MouseEvent) => handlePanMove(e);
      const handleMouseUp = () => endPan();

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isPanning, handlePanMove, endPan]);

  // État pour suivre le projet en cours de redimensionnement
  const [resizingStep, setResizingStep] = useState<string | null>(null);

  // Gestion du redimensionnement des projets
  const handleProjectResize = (step: Project, deltaX: number, side: 'left' | 'right') => {
    if (!resizingStep) {
      setResizingStep(step.id);
    }

    const newDates = calculateResizedDates(step, deltaX, side, viewport);
    onStepUpdate?.(step, {
      startDate: newDates.startDate.toISOString(),
      endDate: newDates.endDate.toISOString(),
    });
  };

  // Réinitialiser l'état de redimensionnement quand on relâche la souris
  useEffect(() => {
    const handleMouseUp = () => {
      if (resizingStep) {
        setResizingStep(null);
      }
    };

    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, [resizingStep]);

  // Gestion du drag & drop
  const handleDragEndWrapper = (event: DragEndEvent) => {
    handleDragEnd(event, viewport);
  };

  // Ligne "Aujourd'hui"
  const todayPosition = useMemo(() => {
    const today = new Date();
    if (today >= viewport.startDate && today <= viewport.endDate) {
      const scale =
        (today.getTime() - viewport.startDate.getTime()) /
        (viewport.endDate.getTime() - viewport.startDate.getTime());
      return scale * containerWidth;
    }
    return null;
  }, [viewport, containerWidth]);

  return (
    <Paper
      elevation={0}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      {/* Barre d'outils */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Typography variant="h6" fontWeight="600">
          Timeline des Projets
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {format(centerDate, 'MMMM yyyy', { locale: fr })}
          </Typography>

          <ButtonGroup size="small" variant="outlined">
            <IconButton onClick={zoomOut} disabled={!canZoomOut} size="small" title="Dézoomer">
              <ZoomOutIcon />
            </IconButton>
            <IconButton onClick={resetZoom} size="small" title="Réinitialiser le zoom">
              <CenterIcon />
            </IconButton>
            <IconButton onClick={zoomIn} disabled={!canZoomIn} size="small" title="Zoomer">
              <ZoomInIcon />
            </IconButton>
          </ButtonGroup>

          <IconButton onClick={panToToday} size="small" color="primary" title="Aller à aujourd'hui">
            Aujourd'hui
          </IconButton>

          {onStepAdd && (
            <IconButton onClick={onStepAdd} color="primary" size="small" title="Ajouter un projet">
              <AddIcon />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Zone de la timeline */}
      <Box
        ref={containerRef}
        sx={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          cursor: isPanning ? 'grabbing' : 'grab',
          bgcolor: 'grey.50',
        }}
        onMouseDown={(e) => {
          // Ne pas démarrer le pan si on clique sur un projet
          if ((e.target as HTMLElement).closest('[data-step]')) return;
          startPan(e);
        }}
      >
        {/* Grille temporelle */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 40,
            borderBottom: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
            zIndex: 2,
          }}
        >
          {timeMarkers.map((marker, index) => (
            <Box
              key={index}
              sx={{
                position: 'absolute',
                left: marker.x,
                top: 0,
                bottom: 0,
                borderLeft: 1,
                borderColor: marker.isMajor ? 'divider' : 'grey.200',
                borderWidth: marker.isMajor ? 2 : 1,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  position: 'absolute',
                  left: 4,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  whiteSpace: 'nowrap',
                  fontWeight: marker.isMajor ? 600 : 400,
                  color: marker.isMajor ? 'text.primary' : 'text.secondary',
                }}
              >
                {marker.label}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Pistes de la timeline */}
        <Box
          sx={{
            position: 'absolute',
            top: 40,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        >
          {/* Piste haute */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: TIMELINE_HEIGHT,
              borderBottom: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }}
          >
            <Typography
              variant="caption"
              sx={{
                position: 'absolute',
                left: 16,
                top: 8,
                color: 'text.secondary',
                fontWeight: 500,
              }}
            >
              Position Haute
            </Typography>
          </Box>

          {/* Piste basse */}
          <Box
            sx={{
              position: 'absolute',
              top: TIMELINE_HEIGHT,
              left: 0,
              right: 0,
              height: TIMELINE_HEIGHT,
              bgcolor: 'grey.50',
            }}
          >
            <Typography
              variant="caption"
              sx={{
                position: 'absolute',
                left: 16,
                top: 8,
                color: 'text.secondary',
                fontWeight: 500,
              }}
            >
              Position Basse
            </Typography>
          </Box>

          {/* Ligne verticale pour aujourd'hui */}
          {todayPosition !== null && (
            <Box
              sx={{
                position: 'absolute',
                left: todayPosition,
                top: 0,
                bottom: 0,
                width: 2,
                bgcolor: 'error.main',
                opacity: 0.5,
                zIndex: 3,
                pointerEvents: 'none',
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  position: 'absolute',
                  left: 4,
                  top: -20,
                  color: 'error.main',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                }}
              >
                Aujourd'hui
              </Typography>
            </Box>
          )}

          {/* Projets */}
          <DndContext
            onDragStart={handleDragStart}
            onDragEnd={handleDragEndWrapper}
            onDragCancel={handleDragCancel}
          >
            {visibleProjects.map(({ step, position }) => (
              <Box key={step.id} data-step sx={{ position: 'absolute' }}>
                <TimelineStep
                  step={step}
                  position={position}
                  onEdit={onStepEdit}
                  onDelete={onStepDelete}
                  onResize={handleProjectResize}
                  isDragging={isDragging}
                  isResizing={resizingStep === step.id}
                />
              </Box>
            ))}
          </DndContext>
        </Box>
      </Box>
    </Paper>
  );
};

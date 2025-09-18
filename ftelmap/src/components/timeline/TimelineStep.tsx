import { useState, useRef } from 'react';
import { Box, Typography, Tooltip, IconButton } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { Step } from '../../types/entities';
import { formatDuration, RESIZE_HANDLE_WIDTH, PROJECT_HEIGHT } from '../../utils/timeline-utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface TimelineStepProps {
  step: Step;
  position: {
    left: number;
    width: number;
    top: number;
    height: number;
  };
  onEdit?: (step: Step) => void;
  onDelete?: (step: Step) => void;
  onResize?: (step: Step, deltaX: number, side: 'left' | 'right') => void;
  isResizing?: boolean;
  isDragging?: boolean;
}

export const TimelineStep = ({
  step,
  position,
  onEdit,
  onDelete,
  onResize,
  isResizing = false,
  isDragging = false,
}: TimelineStepProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [localResizing, setLocalResizing] = useState(false);
  const resizeStartX = useRef<number>(0);

  // Configuration du drag & drop - désactivé lors du redimensionnement local
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: step.id,
    data: { step },
    disabled: isResizing || localResizing,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  // Gestion du redimensionnement
  const handleResizeStart = (e: React.MouseEvent, side: 'left' | 'right') => {
    e.stopPropagation();
    e.preventDefault();
    setLocalResizing(true);
    resizeStartX.current = e.clientX;

    const handleMouseMove = (e: MouseEvent) => {
      e.stopPropagation();
      const deltaX = e.clientX - resizeStartX.current;
      onResize?.(step, deltaX, side);
      resizeStartX.current = e.clientX;
    };

    const handleMouseUp = (e: MouseEvent) => {
      e.stopPropagation();
      setLocalResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Calcul de la durée
  const duration = formatDuration(new Date(step.startDate), new Date(step.endDate));

  // Formatage des dates pour le tooltip
  const startDateFormatted = format(new Date(step.startDate), 'd MMMM yyyy', { locale: fr });
  const endDateFormatted = format(new Date(step.endDate), 'd MMMM yyyy', { locale: fr });

  // Ne pas afficher le tooltip lors du redimensionnement
  const tooltipContent = localResizing ? (
    ''
  ) : (
    <Box>
      <Typography variant="body2" fontWeight="bold">
        {step.title}
      </Typography>
      {step.description && (
        <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
          {step.description}
        </Typography>
      )}
      <Typography variant="caption" display="block" sx={{ mt: 1 }}>
        {startDateFormatted} - {endDateFormatted}
      </Typography>
      <Typography variant="caption" display="block">
        Durée: {duration}
      </Typography>
    </Box>
  );

  return (
    <Tooltip title={tooltipContent} placement="top" arrow disableHoverListener={localResizing}>
      <Box
        ref={setNodeRef}
        {...(!localResizing ? attributes : {})}
        {...(!localResizing ? listeners : {})}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        sx={{
          position: 'absolute',
          left: position.left,
          top: position.top,
          width: position.width,
          height: PROJECT_HEIGHT,
          backgroundColor: step.backgroundColor,
          color: step.textColor,
          borderRadius: 1,
          border: '2px solid',
          borderColor: isDragging || localResizing ? 'primary.main' : 'transparent',
          cursor: localResizing ? 'ew-resize' : isDragging ? 'grabbing' : 'grab',
          transition: isDragging || isResizing || localResizing ? 'none' : 'all 0.2s ease',
          opacity: isDragging ? 0.7 : 1,
          boxShadow: isDragging || localResizing ? 4 : isHovered ? 2 : 1,
          display: 'flex',
          alignItems: 'center',
          px: 2,
          overflow: 'hidden',
          userSelect: 'none',
          zIndex: isDragging || localResizing ? 1000 : isHovered ? 10 : 1,
          ...style,
        }}
      >
        {/* Poignée de redimensionnement gauche */}
        <Box
          onMouseDown={(e) => handleResizeStart(e, 'left')}
          sx={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: RESIZE_HANDLE_WIDTH,
            cursor: 'ew-resize',
            backgroundColor: localResizing ? 'rgba(0,0,0,0.2)' : 'transparent',
            transition: 'background-color 0.2s',
            '&:hover': {
              backgroundColor: 'rgba(0,0,0,0.1)',
            },
          }}
        />

        {/* Contenu de l'étape */}
        <Box sx={{ flex: 1, overflow: 'hidden', pr: isHovered ? 8 : 0 }}>
          <Typography
            variant="body2"
            fontWeight="600"
            noWrap
            sx={{
              fontSize: position.width < 100 ? '0.75rem' : '0.875rem',
            }}
          >
            {step.title}
          </Typography>
          {position.width > 150 && (
            <Typography
              variant="caption"
              noWrap
              sx={{
                opacity: 0.8,
                fontSize: '0.7rem',
              }}
            >
              {duration}
            </Typography>
          )}
        </Box>

        {/* Actions */}
        {isHovered && !isDragging && !isResizing && (
          <Box
            sx={{
              position: 'absolute',
              right: 8,
              display: 'flex',
              gap: 0.5,
            }}
          >
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(step);
              }}
              sx={{
                padding: '4px',
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: step.textColor,
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.3)',
                },
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(step);
              }}
              sx={{
                padding: '4px',
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: step.textColor,
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.3)',
                },
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        )}

        {/* Poignée de redimensionnement droite */}
        <Box
          onMouseDown={(e) => handleResizeStart(e, 'right')}
          sx={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: RESIZE_HANDLE_WIDTH,
            cursor: 'ew-resize',
            backgroundColor: localResizing ? 'rgba(0,0,0,0.2)' : 'transparent',
            transition: 'background-color 0.2s',
            '&:hover': {
              backgroundColor: 'rgba(0,0,0,0.1)',
            },
          }}
        />
      </Box>
    </Tooltip>
  );
};

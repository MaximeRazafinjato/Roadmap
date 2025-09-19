import { useState, useRef, useCallback, useEffect, memo } from 'react';
import { Box, Typography, Tooltip, IconButton } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import type { Step } from '../../types/entities';
import { formatDuration, RESIZE_HANDLE_WIDTH, PROJECT_HEIGHT } from '../../utils/timeline-utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface TimelineStepResizableProps {
  step: Step;
  position: {
    left: number;
    width: number;
    top: number;
    height: number;
  };
  onEdit?: (step: Step) => void;
  onDelete?: (step: Step) => void;
  onResize?: (step: Step, newPosition: { left: number; width: number }) => void;
  onDrag?: (step: Step, deltaX: number) => void;
  isSelected?: boolean;
}

export const TimelineStepResizable = memo(({
  step,
  position,
  onEdit,
  onDelete,
  onResize,
  onDrag,
  isSelected = false,
}: TimelineStepResizableProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeSide, setResizeSide] = useState<'left' | 'right' | null>(null);

  // Position temporaire pour la prévisualisation
  const [tempPosition, setTempPosition] = useState<{ left: number; width: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const startX = useRef<number>(0);
  const startLeft = useRef<number>(position.left);
  const startWidth = useRef<number>(position.width);

  // Utiliser la position temporaire si elle existe, sinon la position normale
  const displayPosition = tempPosition || position;

  // Mise à jour des refs quand la position change
  useEffect(() => {
    // Ne mettre à jour que si on n'est pas en train d'interagir
    if (!isDragging && !isResizing && !tempPosition) {
      startLeft.current = position.left;
      startWidth.current = position.width;
    }
  }, [position, isDragging, isResizing, tempPosition]);

  // Gestion du drag
  const handleMouseDownDrag = useCallback(
    (e: React.MouseEvent) => {
      // Ne pas démarrer le drag si on clique sur les boutons ou les poignées
      if ((e.target as HTMLElement).closest('[data-no-drag]')) return;

      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
      startX.current = e.clientX;
      startLeft.current = position.left;
    },
    [position.left]
  );

  // Gestion du resize
  const handleMouseDownResize = useCallback(
    (e: React.MouseEvent, side: 'left' | 'right') => {
      e.preventDefault();
      e.stopPropagation();
      setIsResizing(true);
      setResizeSide(side);
      startX.current = e.clientX;
      startLeft.current = position.left;
      startWidth.current = position.width;
    },
    [position]
  );

  // Gestion du mouvement de souris
  useEffect(() => {
    if (!isDragging && !isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX.current;

      if (isDragging) {
        // Mettre à jour la position temporaire pour la prévisualisation
        setTempPosition({
          left: startLeft.current + deltaX,
          width: startWidth.current,
        });
      } else if (isResizing && resizeSide) {
        let newLeft = startLeft.current;
        let newWidth = startWidth.current;

        if (resizeSide === 'left') {
          newLeft = startLeft.current + deltaX;
          newWidth = startWidth.current - deltaX;
        } else if (resizeSide === 'right') {
          newWidth = startWidth.current + deltaX;
        }

        // Appliquer une largeur minimale et prévisualiser
        if (newWidth >= 50) {
          setTempPosition({ left: newLeft, width: newWidth });
        }
      }
    };

    const handleMouseUp = () => {
      // Appliquer le changement final
      if (tempPosition) {
        if (isDragging) {
          const deltaX = tempPosition.left - startLeft.current;
          onDrag?.(step, deltaX);
        } else if (isResizing) {
          onResize?.(step, tempPosition);
        }

        // Mettre à jour les refs avec la nouvelle position
        startLeft.current = tempPosition.left;
        startWidth.current = tempPosition.width;
      }

      setIsDragging(false);
      setIsResizing(false);
      setResizeSide(null);
      // Garder la position temporaire jusqu'à ce que la nouvelle position arrive
      // pour éviter le flash
      setTimeout(() => setTempPosition(null), 50);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, resizeSide, step, onDrag, onResize, tempPosition]);

  // Calcul de la durée
  const duration = formatDuration(new Date(step.startDate), new Date(step.endDate));

  // Formatage des dates pour le tooltip
  const startDateFormatted = format(new Date(step.startDate), 'd MMMM yyyy', { locale: fr });
  const endDateFormatted = format(new Date(step.endDate), 'd MMMM yyyy', { locale: fr });

  const getCursor = () => {
    if (isDragging) return 'grabbing';
    if (isResizing) return 'ew-resize';
    return 'grab';
  };

  return (
    <>
      {/* Fantôme de la position originale pendant le drag/resize */}
      {(isDragging || isResizing) && tempPosition && (
        <Box
          sx={{
            position: 'absolute',
            left: position.left,
            top: position.top,
            width: position.width,
            height: PROJECT_HEIGHT,
            backgroundColor: step.backgroundColor,
            opacity: 0.3,
            borderRadius: 1,
            border: '2px dashed',
            borderColor: step.backgroundColor,
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
      )}

      <Tooltip
        title={
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
        }
        placement="top"
        arrow
        disableHoverListener={isDragging || isResizing}
      >
        <Box
          ref={containerRef}
          onMouseDown={handleMouseDownDrag}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          sx={{
            position: 'absolute',
            left: displayPosition.left,
            top: position.top,
            width: displayPosition.width,
            height: PROJECT_HEIGHT,
            backgroundColor: step.backgroundColor,
            color: step.textColor,
            borderRadius: 1,
            border: '2px solid',
            borderColor: isDragging || isResizing || isSelected ? 'primary.main' : 'transparent',
            cursor: getCursor(),
            transition: isDragging || isResizing ? 'none' : 'all 0.2s ease',
            opacity: isDragging || isResizing ? 0.9 : 1,
            boxShadow: isDragging || isResizing ? '0 4px 20px rgba(0,0,0,0.2)' : isHovered ? 2 : 1,
            filter: isDragging || isResizing ? 'brightness(1.1)' : 'none',
            display: 'flex',
            alignItems: 'center',
            px: 2,
            overflow: 'hidden',
            userSelect: 'none',
            zIndex: isDragging || isResizing ? 1000 : isHovered ? 10 : 1,
          }}
        >
          {/* Poignée de redimensionnement gauche */}
          <Box
            data-no-drag
            onMouseDown={(e) => handleMouseDownResize(e, 'left')}
            sx={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: RESIZE_HANDLE_WIDTH,
              cursor: 'ew-resize',
              backgroundColor:
                isResizing && resizeSide === 'left' ? 'rgba(0,0,0,0.2)' : 'transparent',
              transition: 'background-color 0.2s',
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.1)',
              },
              zIndex: 2,
            }}
          />

          {/* Contenu de l'étape */}
          <Box sx={{ flex: 1, overflow: 'hidden', pr: isHovered ? 8 : 0 }}>
            <Typography
              variant="body2"
              fontWeight="600"
              noWrap
              sx={{
                fontSize: displayPosition.width < 100 ? '0.75rem' : '0.875rem',
              }}
            >
              {step.title}
            </Typography>
            {displayPosition.width > 150 && (
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
              data-no-drag
              sx={{
                position: 'absolute',
                right: 8,
                display: 'flex',
                gap: 0.5,
                zIndex: 3,
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
            data-no-drag
            onMouseDown={(e) => handleMouseDownResize(e, 'right')}
            sx={{
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              width: RESIZE_HANDLE_WIDTH,
              cursor: 'ew-resize',
              backgroundColor:
                isResizing && resizeSide === 'right' ? 'rgba(0,0,0,0.2)' : 'transparent',
              transition: 'background-color 0.2s',
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.1)',
              },
              zIndex: 2,
            }}
          />
        </Box>
      </Tooltip>
    </>
  );
}, (prevProps, nextProps) => {
  // Comparaison personnalisée pour éviter les re-rendus inutiles
  return (
    prevProps.step.id === nextProps.step.id &&
    prevProps.step.title === nextProps.step.title &&
    prevProps.step.startDate === nextProps.step.startDate &&
    prevProps.step.endDate === nextProps.step.endDate &&
    prevProps.step.backgroundColor === nextProps.step.backgroundColor &&
    prevProps.step.textColor === nextProps.step.textColor &&
    prevProps.position.left === nextProps.position.left &&
    prevProps.position.width === nextProps.position.width &&
    prevProps.position.top === nextProps.position.top &&
    prevProps.isSelected === nextProps.isSelected
  );
});

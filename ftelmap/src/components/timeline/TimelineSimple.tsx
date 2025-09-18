import { useRef, useEffect, useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  ButtonGroup,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  CenterFocusWeak as CenterIcon,
  Add as AddIcon,
  Download as DownloadIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  Code as JsonIcon,
  Web as HtmlIcon,
  Description as MarkdownIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Step } from '../../types/entities';
import { TimelineStepResizable } from './TimelineStepResizable';
import { useTimelineZoom } from '../../hooks/use-timeline-zoom';
import { useTimelinePan } from '../../hooks/use-timeline-pan';
import { TimelineExportService } from '../../services/timeline-export-service';
import {
  calculateStepsPositions,
  calculateViewportDates,
  generateTimeMarkers,
  isStepVisible,
  pixelToDate,
  dateToPixel,
  TIMELINE_PADDING_TOP,
  PROJECT_HEIGHT,
  type TimelineViewport,
} from '../../utils/timeline-utils';

interface TimelineSimpleProps {
  steps: Step[];
  onStepUpdate?: (step: Step, updates: Partial<Step>) => void;
  onStepEdit?: (step: Step) => void;
  onStepDelete?: (step: Step) => void;
  onStepAdd?: () => void;
  onStepAddWithDates?: (startDate: Date, endDate: Date) => void;
}

export const TimelineSimple = ({
  steps,
  onStepUpdate,
  onStepEdit,
  onStepDelete,
  onStepAdd,
  onStepAddWithDates,
}: TimelineSimpleProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(1200);
  const [selectedStep, setSelectedStep] = useState<string | null>(null);

  // État pour la sélection de dates
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<number | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<number | null>(null);

  // État pour le menu d'export
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);

  // État local pour les projets avec mises à jour optimistes
  const [localSteps, setLocalSteps] = useState<Step[]>(steps || []);

  // Synchroniser avec les projets externes
  useEffect(() => {
    setLocalSteps(steps || []);
  }, [steps]);

  // Hooks pour la gestion de la timeline
  const { zoomLevel, zoomIn, zoomOut, resetZoom, canZoomIn, canZoomOut } = useTimelineZoom();
  const { centerDate, isPanning, startPan, handlePanMove, endPan, panToToday } = useTimelinePan();

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

  // Filtrer et positionner les projets visibles avec gestion des chevauchements
  const visibleSteps = useMemo(() => {
    const visible = localSteps.filter((step) => isStepVisible(step, viewport));
    const positions = calculateStepsPositions(visible, viewport);

    return visible.map((step) => ({
      step,
      position: positions.get(step.id) || {
        left: 0,
        width: 100,
        top: TIMELINE_PADDING_TOP,
        height: PROJECT_HEIGHT,
      },
    }));
  }, [localSteps, viewport]);

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

  // Gestion du drag des projets avec mise à jour optimiste
  const handleStepDrag = (step: Step, deltaX: number) => {
    const currentPos = visibleSteps.find((p) => p.step.id === step.id)?.position;
    if (!currentPos) return;

    const newLeft = currentPos.left + deltaX;
    const newStartDate = pixelToDate(newLeft, viewport);
    const newEndDate = pixelToDate(newLeft + currentPos.width, viewport);

    // Mise à jour optimiste locale immédiate
    const updatedStep = {
      ...step,
      startDate: newStartDate.toISOString(),
      endDate: newEndDate.toISOString(),
    };

    setLocalSteps((prev) => prev.map((p) => (p.id === step.id ? updatedStep : p)));

    // Puis envoyer la mise à jour au serveur
    onStepUpdate?.(step, {
      startDate: newStartDate.toISOString(),
      endDate: newEndDate.toISOString(),
    });
  };

  // Gestion du redimensionnement des projets avec mise à jour optimiste
  const handleStepResize = (step: Step, newPosition: { left: number; width: number }) => {
    const newStartDate = pixelToDate(newPosition.left, viewport);
    const newEndDate = pixelToDate(newPosition.left + newPosition.width, viewport);

    // Mise à jour optimiste locale immédiate
    const updatedStep = {
      ...step,
      startDate: newStartDate.toISOString(),
      endDate: newEndDate.toISOString(),
    };

    setLocalSteps((prev) => prev.map((p) => (p.id === step.id ? updatedStep : p)));

    // Puis envoyer la mise à jour au serveur
    onStepUpdate?.(step, {
      startDate: newStartDate.toISOString(),
      endDate: newEndDate.toISOString(),
    });
  };

  // Ligne "Aujourd'hui"
  const todayPosition = useMemo(() => {
    const today = new Date();
    if (today >= viewport.startDate && today <= viewport.endDate) {
      return dateToPixel(today, viewport);
    }
    return null;
  }, [viewport]);

  // Gestionnaires d'export
  const handleExportMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setExportMenuAnchor(event.currentTarget);
  };

  const handleExportMenuClose = () => {
    setExportMenuAnchor(null);
  };

  const handleExport = async (exportFormat: string) => {
    try {
      const filename = `timeline_${format(new Date(), 'yyyy-MM-dd')}`;

      switch (exportFormat) {
        case 'png':
          if (timelineRef.current) {
            await TimelineExportService.exportAsPNG(timelineRef.current, `${filename}.png`);
          }
          break;
        case 'svg':
          if (timelineRef.current) {
            await TimelineExportService.exportAsSVG(timelineRef.current, `${filename}.svg`);
          }
          break;
        case 'pdf':
          if (timelineRef.current) {
            await TimelineExportService.exportAsPDF(timelineRef.current, `${filename}.pdf`);
          }
          break;
        case 'excel':
          TimelineExportService.exportAsExcel(localSteps, `${filename}.xlsx`);
          break;
        case 'csv':
          TimelineExportService.exportAsCSV(localSteps, `${filename}.csv`);
          break;
        case 'msstep':
          TimelineExportService.exportAsMSProjectXML(localSteps, `${filename}.xml`);
          break;
        case 'json':
          TimelineExportService.exportAsJSON(localSteps, `${filename}.json`);
          break;
        case 'html':
          TimelineExportService.exportAsHTMLGantt(localSteps, `${filename}.html`);
          break;
        case 'markdown':
          TimelineExportService.exportAsMarkdown(localSteps, `${filename}.md`);
          break;
      }

      handleExportMenuClose();
    } catch (error) {
      console.error("Erreur lors de l'export:", error);
    }
  };

  return (
    <Paper
      ref={timelineRef}
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
        <Box>
          <Typography variant="h6" fontWeight="600">
            Timeline des Étapes
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Maintenez Shift + Glissez pour créer une nouvelle étape
          </Typography>
        </Box>

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

          <IconButton onClick={handleExportMenuOpen} size="small" title="Exporter la timeline">
            <DownloadIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Zone de la timeline */}
      <Box
        ref={containerRef}
        sx={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          cursor: isSelecting ? 'crosshair' : isPanning ? 'grabbing' : 'grab',
          bgcolor: 'grey.50',
        }}
        onMouseDown={(e) => {
          // Ne pas démarrer le pan si on clique sur un projet
          if ((e.target as HTMLElement).closest('[data-step]')) return;

          // Si on tient Shift, on démarre une sélection
          if (e.shiftKey) {
            const rect = containerRef.current?.getBoundingClientRect();
            if (!rect) return;

            const x = e.clientX - rect.left;
            setIsSelecting(true);
            setSelectionStart(x);
            setSelectionEnd(x);
            e.preventDefault();
          } else {
            startPan(e);
          }
        }}
        onMouseMove={(e) => {
          if (isSelecting && selectionStart !== null) {
            const rect = containerRef.current?.getBoundingClientRect();
            if (!rect) return;

            const x = e.clientX - rect.left;
            setSelectionEnd(x);
          }
        }}
        onMouseUp={(e) => {
          if (isSelecting && selectionStart !== null && selectionEnd !== null) {
            const minX = Math.min(selectionStart, selectionEnd);
            const maxX = Math.max(selectionStart, selectionEnd);

            // Ne créer un projet que si la sélection est assez large (au moins 20px)
            if (maxX - minX > 20) {
              const startDate = pixelToDate(minX, viewport);
              const endDate = pixelToDate(maxX, viewport);
              onStepAddWithDates?.(startDate, endDate);
            }

            // Réinitialiser la sélection
            setIsSelecting(false);
            setSelectionStart(null);
            setSelectionEnd(null);
          }
        }}
        onClick={() => setSelectedStep(null)}
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
          {timeMarkers.map((marker) => (
            <Box
              key={marker.date.getTime()}
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

        {/* Zone des projets */}
        <Box
          sx={{
            position: 'absolute',
            top: 40,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'background.paper',
          }}
        >
          {/* Zone de sélection */}
          {isSelecting && selectionStart !== null && selectionEnd !== null && (
            <Box
              sx={{
                position: 'absolute',
                left: Math.min(selectionStart, selectionEnd),
                width: Math.abs(selectionEnd - selectionStart),
                top: TIMELINE_PADDING_TOP,
                height: PROJECT_HEIGHT,
                bgcolor: 'primary.main',
                opacity: 0.2,
                border: 2,
                borderStyle: 'dashed',
                borderColor: 'primary.main',
                zIndex: 4,
                pointerEvents: 'none',
              }}
            />
          )}

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
          {visibleSteps.map(({ step, position }) => (
            <Box
              key={step.id}
              data-step
              sx={{ position: 'absolute' }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedStep(step.id);
              }}
            >
              <TimelineStepResizable
                step={step}
                position={position}
                onEdit={onStepEdit}
                onDelete={onStepDelete}
                onResize={handleStepResize}
                onDrag={handleStepDrag}
                isSelected={selectedStep === step.id}
              />
            </Box>
          ))}
        </Box>
      </Box>

      {/* Menu d'export */}
      <Menu
        anchorEl={exportMenuAnchor}
        open={Boolean(exportMenuAnchor)}
        onClose={handleExportMenuClose}
      >
        <MenuItem onClick={() => handleExport('png')}>
          <ListItemIcon>
            <ImageIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export PNG</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleExport('svg')}>
          <ListItemIcon>
            <ImageIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export SVG</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleExport('pdf')}>
          <ListItemIcon>
            <PdfIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export PDF</ListItemText>
        </MenuItem>

        <Divider />

        <MenuItem onClick={() => handleExport('excel')}>
          <ListItemIcon>
            <ExcelIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export Excel</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleExport('csv')}>
          <ListItemIcon>
            <ExcelIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export CSV</ListItemText>
        </MenuItem>

        <Divider />

        <MenuItem onClick={() => handleExport('msstep')}>
          <ListItemIcon>
            <ExcelIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export MS Project XML</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleExport('json')}>
          <ListItemIcon>
            <JsonIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export JSON</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleExport('html')}>
          <ListItemIcon>
            <HtmlIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export HTML Gantt</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleExport('markdown')}>
          <ListItemIcon>
            <MarkdownIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export Markdown</ListItemText>
        </MenuItem>
      </Menu>
    </Paper>
  );
};

import { scaleTime } from 'd3-scale';
import { addDays, differenceInDays, startOfDay, endOfDay, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Project } from '../types/entities';

export interface TimelineViewport {
  startDate: Date;
  endDate: Date;
  width: number;
  zoomLevel: number; // 1 = normal, >1 = zoomed in, <1 = zoomed out
}

export interface ProjectPosition {
  left: number;
  width: number;
  top: number;
  height: number;
}

// Constantes pour la timeline
export const TIMELINE_HEIGHT = 120; // Hauteur de chaque piste
export const PROJECT_HEIGHT = 60; // Hauteur d'un projet
export const PROJECT_MARGIN = 10; // Marge entre les projets
export const TRACK_PADDING = 20; // Padding vertical dans une piste
export const MIN_PROJECT_WIDTH = 50; // Largeur minimale d'un projet
export const RESIZE_HANDLE_WIDTH = 10; // Largeur de la zone de redimensionnement

// Niveaux de zoom prédéfinis
export const ZOOM_LEVELS = {
  YEAR: 0.25,    // Vue année
  QUARTER: 0.5,  // Vue trimestre
  MONTH: 1,      // Vue mois (par défaut)
  WEEK: 2,       // Vue semaine
  DAY: 4,        // Vue jour
} as const;

// Calcule l'échelle de temps pour convertir dates en pixels
export function createTimeScale(viewport: TimelineViewport) {
  return scaleTime()
    .domain([viewport.startDate, viewport.endDate])
    .range([0, viewport.width]);
}

// Calcule la position d'un projet sur la timeline
export function calculateProjectPosition(
  project: Project,
  viewport: TimelineViewport
): ProjectPosition {
  const scale = createTimeScale(viewport);
  const projectStart = new Date(project.startDate);
  const projectEnd = new Date(project.endDate);
  
  const left = scale(projectStart);
  const right = scale(projectEnd);
  const width = Math.max(right - left, MIN_PROJECT_WIDTH);
  
  // Position verticale selon la piste (0 = haut, 1 = bas)
  const top = project.position === 0 
    ? TRACK_PADDING 
    : TIMELINE_HEIGHT + TRACK_PADDING;
  
  return {
    left,
    width,
    top,
    height: PROJECT_HEIGHT,
  };
}

// Convertit une position X en date
export function pixelToDate(x: number, viewport: TimelineViewport): Date {
  const scale = createTimeScale(viewport);
  return scale.invert(x);
}

// Convertit une date en position X
export function dateToPixel(date: Date, viewport: TimelineViewport): number {
  const scale = createTimeScale(viewport);
  return scale(date);
}

// Calcule les nouvelles dates d'un projet après déplacement
export function calculateNewDates(
  project: Project,
  deltaX: number,
  viewport: TimelineViewport
): { startDate: Date; endDate: Date } {
  const duration = differenceInDays(new Date(project.endDate), new Date(project.startDate));
  const scale = createTimeScale(viewport);
  
  const currentLeft = scale(new Date(project.startDate));
  const newLeft = currentLeft + deltaX;
  const newStartDate = scale.invert(newLeft);
  const newEndDate = addDays(newStartDate, duration);
  
  return {
    startDate: startOfDay(newStartDate),
    endDate: endOfDay(newEndDate),
  };
}

// Calcule les nouvelles dates lors du redimensionnement
export function calculateResizedDates(
  project: Project,
  deltaX: number,
  side: 'left' | 'right',
  viewport: TimelineViewport
): { startDate: Date; endDate: Date } {
  const scale = createTimeScale(viewport);
  const currentStart = new Date(project.startDate);
  const currentEnd = new Date(project.endDate);
  
  if (side === 'left') {
    const currentLeft = scale(currentStart);
    const newLeft = currentLeft + deltaX;
    const newStartDate = scale.invert(newLeft);
    
    // S'assurer que la durée minimale est d'un jour
    if (newStartDate >= currentEnd) {
      return {
        startDate: addDays(currentEnd, -1),
        endDate: currentEnd,
      };
    }
    
    return {
      startDate: startOfDay(newStartDate),
      endDate: currentEnd,
    };
  } else {
    const currentRight = scale(currentEnd);
    const newRight = currentRight + deltaX;
    const newEndDate = scale.invert(newRight);
    
    // S'assurer que la durée minimale est d'un jour
    if (newEndDate <= currentStart) {
      return {
        startDate: currentStart,
        endDate: addDays(currentStart, 1),
      };
    }
    
    return {
      startDate: currentStart,
      endDate: endOfDay(newEndDate),
    };
  }
}

// Calcule la plage de dates visible selon le niveau de zoom
export function calculateViewportDates(
  centerDate: Date,
  zoomLevel: number,
  width: number
): { startDate: Date; endDate: Date } {
  // Base: 1 pixel = 1 jour au zoom 1
  const daysVisible = width / zoomLevel / 10; // Ajuster le facteur selon les besoins
  const halfDays = Math.floor(daysVisible / 2);
  
  return {
    startDate: addDays(centerDate, -halfDays),
    endDate: addDays(centerDate, halfDays),
  };
}

// Génère les marqueurs de temps pour la grille
export function generateTimeMarkers(viewport: TimelineViewport): Array<{
  date: Date;
  label: string;
  x: number;
  isMajor: boolean;
}> {
  const markers: Array<{
    date: Date;
    label: string;
    x: number;
    isMajor: boolean;
  }> = [];
  
  const scale = createTimeScale(viewport);
  const daysDiff = differenceInDays(viewport.endDate, viewport.startDate);
  
  // Adapter la granularité selon le zoom
  let step: number;
  let formatStr: string;
  let isMajorCheck: (date: Date) => boolean;
  
  if (daysDiff > 365) {
    // Afficher par mois
    step = 30;
    formatStr = 'MMM yyyy';
    isMajorCheck = (date) => date.getMonth() === 0; // Janvier
  } else if (daysDiff > 90) {
    // Afficher par semaine
    step = 7;
    formatStr = 'd MMM';
    isMajorCheck = (date) => date.getDate() === 1; // Premier du mois
  } else if (daysDiff > 30) {
    // Afficher par 3 jours
    step = 3;
    formatStr = 'd MMM';
    isMajorCheck = (date) => date.getDay() === 1; // Lundi
  } else {
    // Afficher par jour
    step = 1;
    formatStr = 'd MMM';
    isMajorCheck = (date) => date.getDay() === 1; // Lundi
  }
  
  let currentDate = new Date(viewport.startDate);
  while (currentDate <= viewport.endDate) {
    markers.push({
      date: new Date(currentDate),
      label: format(currentDate, formatStr, { locale: fr }),
      x: scale(currentDate),
      isMajor: isMajorCheck(currentDate),
    });
    currentDate = addDays(currentDate, step);
  }
  
  return markers;
}

// Vérifie si un projet est visible dans le viewport
export function isProjectVisible(project: Project, viewport: TimelineViewport): boolean {
  const projectStart = new Date(project.startDate);
  const projectEnd = new Date(project.endDate);
  
  return !(projectEnd < viewport.startDate || projectStart > viewport.endDate);
}

// Clamp une valeur entre min et max
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// Formate une durée en jours
export function formatDuration(startDate: Date, endDate: Date): string {
  const days = differenceInDays(endDate, startDate) + 1;
  
  if (days === 1) return '1 jour';
  if (days < 7) return `${days} jours`;
  if (days < 30) return `${Math.floor(days / 7)} semaine${days >= 14 ? 's' : ''}`;
  if (days < 365) return `${Math.floor(days / 30)} mois`;
  
  const years = Math.floor(days / 365);
  const remainingMonths = Math.floor((days % 365) / 30);
  
  if (remainingMonths === 0) {
    return `${years} an${years > 1 ? 's' : ''}`;
  }
  
  return `${years} an${years > 1 ? 's' : ''} et ${remainingMonths} mois`;
}
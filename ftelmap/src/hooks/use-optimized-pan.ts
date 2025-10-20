import { useState, useCallback, useRef, useEffect } from 'react';

interface UseOptimizedPanOptions {
  onPan?: (deltaX: number, deltaY: number) => void;
  onPanEnd?: () => void;
}

export const useOptimizedPan = ({ onPan, onPanEnd }: UseOptimizedPanOptions = {}) => {
  const [isPanning, setIsPanning] = useState(false);
  const panStartX = useRef<number>(0);
  const panStartY = useRef<number>(0);
  const rafId = useRef<number | null>(null);
  const lastDeltaX = useRef<number>(0);
  const lastDeltaY = useRef<number>(0);
  const isDirty = useRef<boolean>(false);

  // Animation frame loop pour un pan fluide
  const updatePan = useCallback(() => {
    if (!isDirty.current) {
      rafId.current = requestAnimationFrame(updatePan);
      return;
    }

    onPan?.(lastDeltaX.current, lastDeltaY.current);
    isDirty.current = false;
    rafId.current = requestAnimationFrame(updatePan);
  }, [onPan]);

  // Démarrer le pan
  const startPan = useCallback(
    (event: React.MouseEvent | MouseEvent) => {
      event.preventDefault();
      setIsPanning(true);
      panStartX.current = event.clientX;
      panStartY.current = event.clientY;
      lastDeltaX.current = 0;
      lastDeltaY.current = 0;
      isDirty.current = false;

      // Désactiver la sélection de texte pendant le pan
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'grabbing';

      // Démarrer la boucle d'animation
      rafId.current = requestAnimationFrame(updatePan);
    },
    [updatePan]
  );

  // Gérer le mouvement pendant le pan
  const handlePanMove = useCallback(
    (event: MouseEvent) => {
      if (!isPanning) return;

      // Calculer le delta et marquer comme dirty pour la prochaine frame
      lastDeltaX.current = event.clientX - panStartX.current;
      lastDeltaY.current = event.clientY - panStartY.current;
      isDirty.current = true;
    },
    [isPanning]
  );

  // Terminer le pan
  const endPan = useCallback(() => {
    if (!isPanning) return;

    setIsPanning(false);
    document.body.style.userSelect = '';
    document.body.style.cursor = '';

    // Arrêter la boucle d'animation
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }

    onPanEnd?.();
  }, [isPanning, onPanEnd]);

  // Nettoyer les event listeners au démontage
  useEffect(() => {
    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  return {
    isPanning,
    startPan,
    handlePanMove,
    endPan,
  };
};

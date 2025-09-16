import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Alert,
  AlertTitle,
  Skeleton,
  Fade,
  Dialog,
  Stack,
  Typography,
  Button,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useSteps, useUpdateStep, useDeleteStep } from '../hooks/use-steps';
import { TimelineSimple } from '../components/timeline/TimelineSimple';
import StepForm from '../components/StepForm';
import type { Step, UpdateStepForm } from '../types/entities';
import { useAuth } from '../contexts/auth-context';

const TimelinePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: steps, isLoading, error } = useSteps();
  const updateStep = useUpdateStep();
  const deleteStep = useDeleteStep();
  
  const [openStepDialog, setOpenStepDialog] = useState(false);
  const [editingStep, setEditingStep] = useState<Step | null>(null);
  const [deleteConfirmStep, setDeleteConfirmStep] = useState<Step | null>(null);
  
  // Gestion de la mise à jour d'une étape
  const handleStepUpdate = async (step: Step, updates: Partial<Step>) => {
    const updateData: UpdateStepForm = {
      id: step.id,
      title: updates.title ?? step.title,
      description: updates.description ?? step.description,
      startDate: updates.startDate ?? step.startDate,
      endDate: updates.endDate ?? step.endDate,
      backgroundColor: updates.backgroundColor ?? step.backgroundColor,
      textColor: updates.textColor ?? step.textColor,
      ownerId: step.ownerId,
    };
    
    await updateStep.mutateAsync(updateData);
  };
  
  // Gestion de l'édition d'une étape
  const handleStepEdit = (step: Step) => {
    setEditingStep(step);
    setOpenStepDialog(true);
  };
  
  // Gestion de la suppression d'une étape
  const handleStepDelete = (step: Step) => {
    setDeleteConfirmStep(step);
  };
  
  const confirmDelete = async () => {
    if (deleteConfirmStep) {
      await deleteStep.mutateAsync(deleteConfirmStep.id);
      setDeleteConfirmStep(null);
    }
  };
  
  // Gestion de l'ajout d'une étape
  const handleStepAdd = () => {
    setEditingStep(null);
    setOpenStepDialog(true);
  };
  
  // Gestion de l'ajout d'une étape avec dates préremplies
  const handleStepAddWithDates = (startDate: Date, endDate: Date) => {
    const newStep: Partial<Step> = {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };
    setEditingStep(newStep as Step);
    setOpenStepDialog(true);
  };
  
  // Fermeture du dialogue
  const handleCloseDialog = () => {
    setOpenStepDialog(false);
    setEditingStep(null);
  };
  
  if (isLoading) {
    return (
      <Box sx={{ height: '100vh', p: 3 }}>
        <Skeleton variant="text" width={300} height={40} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height="calc(100% - 60px)" sx={{ borderRadius: 2 }} />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Fade in={true}>
        <Alert severity="error" sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
          <AlertTitle>Erreur de chargement de la timeline</AlertTitle>
          Impossible de charger les étapes. Veuillez réessayer plus tard.
        </Alert>
      </Fade>
    );
  }
  
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* En-tête */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Timeline des Étapes
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Visualisez et gérez vos étapes sur une frise chronologique interactive
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleStepAdd}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1.5,
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Nouvelle Étape
          </Button>
        </Stack>
        
        {/* Timeline */}
        <Box sx={{ flex: 1, minHeight: 0 }}>
          {steps && steps.length > 0 ? (
            <TimelineSimple
              steps={steps}
              onStepUpdate={handleStepUpdate}
              onStepEdit={handleStepEdit}
              onStepDelete={handleStepDelete}
              onStepAdd={handleStepAdd}
              onStepAddWithDates={handleStepAddWithDates}
            />
          ) : (
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 2,
                borderColor: 'divider',
                borderStyle: 'dashed',
                borderRadius: 2,
                bgcolor: 'grey.50',
              }}
            >
              <Box textAlign="center">
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Aucune étape pour le moment
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  Créez votre première étape pour commencer à utiliser la timeline
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleStepAdd}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                  }}
                >
                  Créer une Étape
                </Button>
              </Box>
            </Box>
          )}
        </Box>
        
        {/* Dialogue de formulaire d'étape */}
        <Dialog
          open={openStepDialog}
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
        >
          <StepForm
            step={editingStep}
            onClose={handleCloseDialog}
            ownerId={user?.id || ''}
          />
        </Dialog>
        
        {/* Dialogue de confirmation de suppression */}
        <Dialog
          open={!!deleteConfirmStep}
          onClose={() => setDeleteConfirmStep(null)}
          maxWidth="xs"
          fullWidth
        >
          <Box p={3}>
            <Typography variant="h6" gutterBottom>
              Confirmer la suppression
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Êtes-vous sûr de vouloir supprimer l'étape "{deleteConfirmStep?.title}" ?
              Cette action est irréversible.
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button
                onClick={() => setDeleteConfirmStep(null)}
                variant="outlined"
              >
                Annuler
              </Button>
              <Button
                onClick={confirmDelete}
                variant="contained"
                color="error"
              >
                Supprimer
              </Button>
            </Stack>
          </Box>
        </Dialog>
      </Box>
  );
};

export default TimelinePage;
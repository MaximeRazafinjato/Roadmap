import { useState } from 'react';
import { Box, Dialog, Stack, Typography, Button } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useSteps, useUpdateStep, useDeleteStep } from '../hooks/use-steps';
import { TimelineSimple } from '../components/timeline/TimelineSimple';
import StepForm from '../components/StepForm';
import { PageLayout } from '../components/PageLayout';
import type { Step, UpdateStepForm } from '../types/entities';
import { useAuth } from '../hooks/use-auth-context';

const TimelinePage = () => {
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

  const actions = (
    <Button
      variant="contained"
      size="small"
      startIcon={<AddIcon />}
      onClick={handleStepAdd}
      sx={{
        borderRadius: 1.5,
        px: 2,
        py: 0.75,
        textTransform: 'none',
        fontWeight: 600,
      }}
    >
      Nouvelle Étape
    </Button>
  );

  return (
    <PageLayout
      title="Timeline des Étapes"
      loading={isLoading}
      error={error ? 'Impossible de charger les étapes. Veuillez réessayer plus tard.' : null}
      actions={actions}
      fullHeight
    >
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
      <Dialog open={openStepDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <StepForm step={editingStep} onClose={handleCloseDialog} ownerId={user?.id || ''} />
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
            Êtes-vous sûr de vouloir supprimer l'étape "{deleteConfirmStep?.title}" ? Cette action
            est irréversible.
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button onClick={() => setDeleteConfirmStep(null)} variant="outlined">
              Annuler
            </Button>
            <Button onClick={confirmDelete} variant="contained" color="error">
              Supprimer
            </Button>
          </Stack>
        </Box>
      </Dialog>
    </PageLayout>
  );
};

export default TimelinePage;

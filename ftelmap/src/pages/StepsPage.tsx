import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  IconButton,
  Stack,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CalendarToday as CalendarIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useSteps, useDeleteStep } from '../hooks/use-steps';
import StepForm from '../components/StepForm';
import { PageLayout } from '../components/PageLayout';
import type { Step } from '../types/entities';

const StepsPage = () => {
  const navigate = useNavigate();
  const { data: steps, isLoading, error } = useSteps();
  const deleteStep = useDeleteStep();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedStep, setSelectedStep] = useState<Step | null>(null);

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette étape ?')) {
      await deleteStep.mutateAsync(id);
    }
  };

  const handleView = (id: string) => {
    navigate(`/steps/${id}`);
  };

  const actions = (
    <Button
      variant="contained"
      size="small"
      startIcon={<AddIcon />}
      onClick={() => setShowCreateForm(true)}
      sx={{
        borderRadius: 1.5,
        textTransform: 'none',
        fontWeight: 600,
        px: 2,
        py: 0.75,
      }}
    >
      Créer une Nouvelle Étape
    </Button>
  );

  const formatDuration = (startDate: string, endDate: string): string => {
    const days = Math.ceil(
      (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (days < 7) return `${days} jours`;
    if (days < 30) return `${Math.round(days / 7)} semaines`;
    return `${Math.round(days / 30)} mois`;
  };

  return (
    <PageLayout
      title="Étapes du projet"
      loading={isLoading}
      error={error ? 'Échec du chargement des étapes' : null}
      actions={actions}
    >
      {showCreateForm && (
        <StepForm
          step={selectedStep}
          onClose={() => {
            setShowCreateForm(false);
            setSelectedStep(null);
          }}
        />
      )}

      {steps && steps.length > 0 ? (
        <Grid container spacing={3}>
          {steps.map((step) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={step.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  borderTop: `4px solid ${step.backgroundColor}`,
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
                onClick={() => handleView(step.id)}
              >
                <CardContent sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {/* Header */}
                  <Box mb={2}>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      sx={{
                        mb: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {step.title}
                    </Typography>
                    <Chip
                      label="Étape"
                      size="small"
                      sx={{
                        backgroundColor: step.backgroundColor,
                        color: step.textColor,
                        height: 20,
                      }}
                    />
                  </Box>

                  {/* Description */}
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 2,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      flex: 1,
                      minHeight: '3em',
                    }}
                  >
                    {step.description || 'Pas de description'}
                  </Typography>

                  {/* Meta Information */}
                  <Stack spacing={1} mb={2}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <CalendarIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        {new Date(step.startDate).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <ScheduleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        {formatDuration(step.startDate, step.endDate)}
                      </Typography>
                    </Stack>
                    {step.location && (
                      <Typography variant="caption" color="text.secondary">
                        📍 {step.location}
                      </Typography>
                    )}
                    {step.budget && (
                      <Typography variant="caption" color="text.secondary">
                        💰 {step.budget.toLocaleString('fr-FR')} €
                      </Typography>
                    )}
                  </Stack>

                  {/* Actions */}
                  <Stack direction="row" spacing={1} onClick={(e) => e.stopPropagation()}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={() => {
                        setSelectedStep(step);
                        setShowCreateForm(true);
                      }}
                      sx={{
                        flex: 1,
                        textTransform: 'none',
                        borderRadius: 2,
                      }}
                    >
                      Modifier
                    </Button>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(step.id)}
                      disabled={deleteStep.isPending}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '400px',
            gap: 2,
          }}
        >
          <Typography variant="h6" color="text.secondary">
            Aucune étape trouvée
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Créez votre première étape pour commencer !
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowCreateForm(true)}
            sx={{ mt: 2 }}
          >
            Créer une Étape
          </Button>
        </Box>
      )}
    </PageLayout>
  );
};

export default StepsPage;

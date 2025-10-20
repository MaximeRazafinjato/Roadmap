import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, Grid, Paper, Typography, Stack, Chip } from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CalendarToday as CalendarIcon,
  AccessTime as AccessTimeIcon,
  Palette as PaletteIcon,
} from '@mui/icons-material';
import { useStep } from '../hooks/use-steps';
import { PageLayout } from '../components/PageLayout';
import { RichTextViewer } from '../components/RichTextViewer';
import { getDepartmentLabel, getDepartmentColor } from '../constants/departments';

const StepDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: step, isLoading, error } = useStep(id);

  if (!step && !isLoading) {
    return <PageLayout title="Étape introuvable" error="Étape introuvable" />;
  }

  const breadcrumbs = [{ label: 'Étapes', path: '/steps' }, { label: step?.title || 'Détail' }];

  const actions = (
    <Button
      variant="outlined"
      size="small"
      startIcon={<ArrowBackIcon />}
      onClick={() => navigate('/steps')}
      sx={{
        borderRadius: 1.5,
        textTransform: 'none',
        fontWeight: 600,
        px: 2,
        py: 0.75,
      }}
    >
      Retour aux Étapes
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
      title={step?.title || 'Détail de l’étape'}
      loading={isLoading}
      error={error ? 'Échec du chargement des détails de l’étape' : null}
      actions={actions}
      breadcrumbs={breadcrumbs}
    >
      {step && (
        <Stack spacing={3}>
          {/* Header with step info */}
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Stack direction="row" spacing={2} alignItems="center" mb={2}>
              <Chip
                label="Étape"
                sx={{
                  backgroundColor: step.backgroundColor,
                  color: step.textColor,
                  fontWeight: 'bold',
                }}
              />
            </Stack>

            <Typography variant="h6" gutterBottom color="text.secondary">
              Description
            </Typography>
            <Box sx={{ mb: 3 }}>
              {step.description ? (
                <RichTextViewer content={step.description} />
              ) : (
                <Typography variant="body1" color="text.secondary">
                  Aucune description disponible
                </Typography>
              )}
            </Box>
          </Paper>

          {/* Details Grid */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <CalendarIcon sx={{ fontSize: 20 }} />
                  Informations temporelles
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Date de début
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {new Date(step.startDate).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Date de fin
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {new Date(step.endDate).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                    >
                      <AccessTimeIcon sx={{ fontSize: 16 }} />
                      Durée
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {formatDuration(step.startDate, step.endDate)}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <PaletteIcon sx={{ fontSize: 20 }} />
                  Apparence
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      Couleurs
                    </Typography>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Arrière-plan
                        </Typography>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            backgroundColor: step.backgroundColor,
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 1,
                            mt: 0.5,
                          }}
                        />
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ mt: 0.5, display: 'block' }}
                        >
                          {step.backgroundColor}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Texte
                        </Typography>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            backgroundColor: step.textColor,
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 1,
                            mt: 0.5,
                          }}
                        />
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ mt: 0.5, display: 'block' }}
                        >
                          {step.textColor}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
          </Grid>

          {/* Timeline Preview */}
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Aperçu de la Timeline
            </Typography>
            <Box
              sx={{
                position: 'relative',
                height: 120,
                backgroundColor: 'grey.50',
                borderRadius: 2,
                p: 3,
                mt: 2,
                overflow: 'hidden',
              }}
            >
              {/* Timeline line */}
              <Box
                sx={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: '50%',
                  height: 2,
                  backgroundColor: 'divider',
                  transform: 'translateY(-50%)',
                }}
              />
              {/* Step block */}
              <Box
                sx={{
                  position: 'absolute',
                  left: 24,
                  right: 24,
                  top: 20,
                  backgroundColor: step.backgroundColor,
                  color: step.textColor,
                  p: 2,
                  borderRadius: 1.5,
                  boxShadow: 2,
                }}
              >
                <Typography variant="subtitle2" fontWeight="bold">
                  {step.title}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  {new Date(step.startDate).toLocaleDateString('fr-FR')} -{' '}
                  {new Date(step.endDate).toLocaleDateString('fr-FR')}
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Metadata */}
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Métadonnées
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Créé le
                </Typography>
                <Typography variant="body1">
                  {new Date(step.createdAt).toLocaleString('fr-FR')}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Dernière modification
                </Typography>
                <Typography variant="body1">
                  {new Date(step.updatedAt).toLocaleString('fr-FR')}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Pôles associés
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {step.associatedDepartments && step.associatedDepartments.length > 0 ? (
                    step.associatedDepartments.map((dept) => (
                      <Chip
                        key={dept}
                        label={getDepartmentLabel(dept)}
                        sx={{
                          backgroundColor: getDepartmentColor(dept),
                          color: '#FFFFFF',
                          fontWeight: 500,
                        }}
                      />
                    ))
                  ) : (
                    <Typography variant="body1" color="text.secondary">
                      Aucun pôle associé
                    </Typography>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Stack>
      )}
    </PageLayout>
  );
};

export default StepDetailPage;

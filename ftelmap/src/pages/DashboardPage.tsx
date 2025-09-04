import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Paper,
  Skeleton,
  Alert,
  AlertTitle,
  Chip,
  Stack,
  Button,
  LinearProgress,
  Avatar,
  IconButton,
  Fade,
  Grow,
} from '@mui/material';
import {
  PlayArrow as PlayArrowIcon,
  CheckCircle as CheckCircleIcon,
  Add as AddIcon,
  ArrowForward as ArrowForwardIcon,
  TrendingUp as TrendingUpIcon,
  Folder as FolderIcon,
} from '@mui/icons-material';
import { useProjects } from '../hooks/use-projects';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend?: number;
}

const StatCard = ({ title, value, icon, color, trend }: StatCardProps) => (
  <Grow in={true} timeout={600}>
    <Card
      elevation={0}
      sx={{
        height: '100%',
        border: 1,
        borderColor: 'divider',
        position: 'relative',
        overflow: 'visible',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 3,
          borderColor: color,
        },
      }}
    >
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Avatar
              sx={{
                bgcolor: `${color}.50`,
                color: `${color}.main`,
                width: 48,
                height: 48,
              }}
            >
              {icon}
            </Avatar>
            {trend !== undefined && (
              <Chip
                size="small"
                icon={<TrendingUpIcon />}
                label={`${trend > 0 ? '+' : ''}${trend}%`}
                color={trend > 0 ? 'success' : 'error'}
                variant="outlined"
              />
            )}
          </Stack>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight="bold" color={color}>
              {value}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  </Grow>
);

const DashboardPage = () => {
  const navigate = useNavigate();
  const { data: projects, isLoading, error } = useProjects();

  const projectsOnTop = projects?.filter(p => p.position === 0).length || 0;
  const projectsOnBottom = projects?.filter(p => p.position === 1).length || 0;
  // const upcomingProjects = projects?.filter(p => new Date(p.startDate) > new Date()).length || 0;
  const activeProjects = projects?.filter(p => {
    const now = new Date();
    return new Date(p.startDate) <= now && new Date(p.endDate) >= now;
  }).length || 0;

  if (isLoading) {
    return (
      <Box>
        <Skeleton variant="text" width={200} height={40} sx={{ mb: 2 }} />
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(4, 1fr)',
            },
            gap: 3,
          }}
        >
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="rectangular" height={140} sx={{ borderRadius: 2 }} />
          ))}
        </Box>
        <Skeleton variant="rectangular" height={400} sx={{ mt: 4, borderRadius: 2 }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Fade in={true}>
        <Alert severity="error" sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
          <AlertTitle>Erreur de chargement du tableau de bord</AlertTitle>
          Impossible de charger les données du tableau de bord. Veuillez réessayer plus tard.
        </Alert>
      </Fade>
    );
  }

  return (
    <Fade in={true}>
      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Tableau de bord
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Vue d'ensemble de votre système de gestion de projets
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/projects')}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1.5,
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Nouveau Projet
          </Button>
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(4, 1fr)',
            },
            gap: 3,
            mb: 4,
          }}
        >
          <StatCard
            title="Total des Projets"
            value={projects?.length || 0}
            icon={<FolderIcon />}
            color="primary"
            trend={12}
          />
          <StatCard
            title="Projets Actifs"
            value={activeProjects}
            icon={<PlayArrowIcon />}
            color="success"
            trend={8}
          />
          <StatCard
            title="Position Haute"
            value={projectsOnTop}
            icon={<TrendingUpIcon />}
            color="warning"
          />
          <StatCard
            title="Position Basse"
            value={projectsOnBottom}
            icon={<CheckCircleIcon />}
            color="info"
          />
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: 3,
            border: 1,
            borderColor: 'divider',
            borderRadius: 2,
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6" fontWeight="600">
              Projets Récents
            </Typography>
            <Button
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate('/projects')}
              sx={{ textTransform: 'none' }}
            >
              Voir Tout
            </Button>
          </Stack>

          {projects && projects.length > 0 ? (
            <Stack spacing={2}>
              {projects.slice(0, 5).map((project, index) => (
                <Fade key={project.id} in={true} timeout={300 * (index + 1)}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: 'action.hover',
                        transform: 'translateX(8px)',
                      },
                    }}
                    onClick={() => navigate(`/projects/${project.id}`)}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: project.backgroundColor, color: project.textColor }}>
                          {project.title.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" fontWeight="600">
                            {project.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Stack>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Chip
                          label={project.position === 0 ? 'Haut' : 'Bas'}
                          size="small"
                          variant="filled"
                          sx={{ bgcolor: project.backgroundColor, color: project.textColor }}
                        />
                        <IconButton size="small" color="primary">
                          <ArrowForwardIcon />
                        </IconButton>
                      </Stack>
                    </Stack>
                    {(() => {
                      const now = new Date();
                      const start = new Date(project.startDate);
                      const end = new Date(project.endDate);
                      const total = end.getTime() - start.getTime();
                      const elapsed = Math.max(0, Math.min(now.getTime() - start.getTime(), total));
                      const progress = total > 0 ? Math.round((elapsed / total) * 100) : 0;
                      
                      return now >= start && now <= end ? (
                        <Box mt={2}>
                          <Stack direction="row" justifyContent="space-between" mb={1}>
                            <Typography variant="caption" color="text.secondary">
                              Progression
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {progress}%
                            </Typography>
                          </Stack>
                          <LinearProgress
                            variant="determinate"
                            value={progress}
                            sx={{
                              height: 6,
                              borderRadius: 3,
                              bgcolor: 'grey.200',
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 3,
                                bgcolor: project.backgroundColor,
                              },
                            }}
                          />
                        </Box>
                      ) : null;
                    })()}
                  </Paper>
                </Fade>
              ))}
            </Stack>
          ) : (
            <Paper
              elevation={0}
              sx={{
                p: 4,
                textAlign: 'center',
                bgcolor: 'grey.50',
                border: 2,
                borderColor: 'divider',
                borderStyle: 'dashed',
                borderRadius: 2,
              }}
            >
              <FolderIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Aucun projet pour le moment
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Créez votre premier projet pour commencer
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/projects')}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                }}
              >
                Créer un Projet
              </Button>
            </Paper>
          )}
        </Paper>
      </Box>
    </Fade>
  );
};

export default DashboardPage;
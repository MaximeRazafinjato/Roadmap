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
  AttachMoney as AttachMoneyIcon,
  PlayArrow as PlayArrowIcon,
  CheckCircle as CheckCircleIcon,
  Add as AddIcon,
  ArrowForward as ArrowForwardIcon,
  TrendingUp as TrendingUpIcon,
  Folder as FolderIcon,
} from '@mui/icons-material';
import { useProjects } from '../hooks/use-projects';
import { ProjectStatus } from '../types/entities';

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

  const projectsByStatus = projects?.reduce((acc, project) => {
    acc[project.status] = (acc[project.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const totalBudget = projects?.reduce((sum, project) => sum + project.budget, 0) || 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case ProjectStatus.Planning:
        return 'info';
      case ProjectStatus.InProgress:
        return 'warning';
      case ProjectStatus.Completed:
        return 'success';
      case ProjectStatus.OnHold:
        return 'error';
      default:
        return 'default';
    }
  };

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
          <AlertTitle>Error Loading Dashboard</AlertTitle>
          Failed to load dashboard data. Please try again later.
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
              Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Overview of your project management system
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
            New Project
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
            title="Total Projects"
            value={projects?.length || 0}
            icon={<FolderIcon />}
            color="primary"
            trend={12}
          />
          <StatCard
            title="Total Budget"
            value={`$${totalBudget.toLocaleString('en-US', { minimumFractionDigits: 0 })}`}
            icon={<AttachMoneyIcon />}
            color="success"
            trend={8}
          />
          <StatCard
            title="In Progress"
            value={projectsByStatus[ProjectStatus.InProgress] || 0}
            icon={<PlayArrowIcon />}
            color="warning"
          />
          <StatCard
            title="Completed"
            value={projectsByStatus[ProjectStatus.Completed] || 0}
            icon={<CheckCircleIcon />}
            color="success"
            trend={25}
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
              Recent Projects
            </Typography>
            <Button
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate('/projects')}
              sx={{ textTransform: 'none' }}
            >
              View All
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
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {project.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" fontWeight="600">
                            {project.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Budget: ${project.budget.toLocaleString()}
                          </Typography>
                        </Box>
                      </Stack>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Chip
                          label={project.status}
                          color={getStatusColor(project.status)}
                          size="small"
                          variant="filled"
                        />
                        <IconButton size="small" color="primary">
                          <ArrowForwardIcon />
                        </IconButton>
                      </Stack>
                    </Stack>
                    {project.status === ProjectStatus.InProgress && (
                      <Box mt={2}>
                        <Stack direction="row" justifyContent="space-between" mb={1}>
                          <Typography variant="caption" color="text.secondary">
                            Progress
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            65%
                          </Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={65}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            bgcolor: 'grey.200',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 3,
                            },
                          }}
                        />
                      </Box>
                    )}
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
                No projects yet
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Create your first project to get started
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
                Create Project
              </Button>
            </Paper>
          )}
        </Paper>
      </Box>
    </Fade>
  );
};

export default DashboardPage;
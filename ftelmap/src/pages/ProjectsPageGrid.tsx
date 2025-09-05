import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { viewMode as viewModeCookie } from '../lib/cookies';
import { 
  Box, 
  Card,
  CardContent,
  Grid,
  Typography,
  IconButton,
  Button,
  Chip,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
  Stack,
  LinearProgress,
  Paper,
  Menu,
  MenuItem,
  Divider,
  Avatar,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  GridView as GridViewIcon,
  ViewList as ListIcon,
  MoreVert as MoreVertIcon,
  CalendarToday as CalendarIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as PendingIcon,
  PlayArrow as InProgressIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { useProjects, useDeleteProject } from '../hooks/use-projects';
import ProjectForm from '../components/ProjectForm';
import type { Project } from '../types/entities';

const ProjectsPageGrid = () => {
  const navigate = useNavigate();
  const { data: projects, isLoading, error } = useProjects();
  const deleteProject = useDeleteProject();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(viewModeCookie.get());
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedProjectMenu, setSelectedProjectMenu] = useState<string | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'inprogress' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'progress'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Save view mode preference when it changes
  useEffect(() => {
    viewModeCookie.set(viewMode);
  }, [viewMode]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
      await deleteProject.mutateAsync(id);
    }
    handleCloseMenu();
  };

  const handleView = (id: string) => {
    navigate(`/projects/${id}`);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, projectId: string) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedProjectMenu(projectId);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedProjectMenu(null);
  };

  const calculateProgress = (startDate: Date, endDate: Date): number => {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const now = new Date().getTime();
    
    if (now < start) return 0;
    if (now > end) return 100;
    
    const total = end - start;
    const elapsed = now - start;
    return Math.round((elapsed / total) * 100);
  };

  const getProjectStatus = (startDate: Date, endDate: Date): { label: string; color: 'default' | 'primary' | 'success' | 'warning' | 'error' } => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (now < start) return { label: 'À venir', color: 'default' };
    if (now > end) return { label: 'Terminé', color: 'success' };
    return { label: 'En cours', color: 'primary' };
  };

  const formatDuration = (startDate: Date, endDate: Date): string => {
    const days = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
    if (days < 7) return `${days} jours`;
    if (days < 30) return `${Math.round(days / 7)} semaines`;
    return `${Math.round(days / 30)} mois`;
  };

  // Filter and sort projects
  const filteredAndSortedProjects = projects?.filter(project => {
    // Search filter
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    let matchesStatus = true;
    const now = new Date();
    const start = new Date(project.startDate);
    const end = new Date(project.endDate);
    
    switch (statusFilter) {
      case 'upcoming':
        matchesStatus = now < start;
        break;
      case 'inprogress':
        matchesStatus = now >= start && now <= end;
        break;
      case 'completed':
        matchesStatus = now > end;
        break;
    }
    
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    let compareValue = 0;
    
    switch (sortBy) {
      case 'name':
        compareValue = a.title.localeCompare(b.title);
        break;
      case 'date':
        compareValue = new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        break;
      case 'progress':
        const progressA = calculateProgress(a.startDate, a.endDate);
        const progressB = calculateProgress(b.startDate, b.endDate);
        compareValue = progressA - progressB;
        break;
    }
    
    return sortOrder === 'asc' ? compareValue : -compareValue;
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Typography>Chargement des projets...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Typography color="error">Échec du chargement des projets</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Gestion des Projets
        </Typography>
        <Stack direction="row" spacing={2}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, newMode) => newMode && setViewMode(newMode)}
            size="small"
          >
            <ToggleButton value="grid">
              <Tooltip title="Vue grille">
                <GridViewIcon />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="list">
              <Tooltip title="Vue liste">
                <ListIcon />
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowCreateForm(true)}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Nouveau Projet
          </Button>
        </Stack>
      </Stack>

      {/* Filters Bar */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          {/* Search Bar */}
          <TextField
            placeholder="Rechercher un projet..."
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flex: 1, minWidth: 200 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchTerm('')}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />

          {/* Status Filter */}
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Statut</InputLabel>
            <Select
              value={statusFilter}
              label="Statut"
              onChange={(e: SelectChangeEvent) => setStatusFilter(e.target.value as any)}
              startAdornment={
                <InputAdornment position="start">
                  <FilterIcon sx={{ color: 'text.secondary', ml: 1 }} />
                </InputAdornment>
              }
            >
              <MenuItem value="all">Tous</MenuItem>
              <MenuItem value="upcoming">À venir</MenuItem>
              <MenuItem value="inprogress">En cours</MenuItem>
              <MenuItem value="completed">Terminés</MenuItem>
            </Select>
          </FormControl>

          {/* Sort By */}
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Trier par</InputLabel>
            <Select
              value={sortBy}
              label="Trier par"
              onChange={(e: SelectChangeEvent) => setSortBy(e.target.value as any)}
              startAdornment={
                <InputAdornment position="start">
                  <SortIcon sx={{ color: 'text.secondary', ml: 1 }} />
                </InputAdornment>
              }
            >
              <MenuItem value="name">Nom</MenuItem>
              <MenuItem value="date">Date de début</MenuItem>
              <MenuItem value="progress">Progression</MenuItem>
            </Select>
          </FormControl>

          {/* Sort Order */}
          <ToggleButtonGroup
            value={sortOrder}
            exclusive
            onChange={(_, newOrder) => newOrder && setSortOrder(newOrder)}
            size="small"
          >
            <ToggleButton value="asc">
              <Tooltip title="Croissant">
                <Typography variant="body2">↑</Typography>
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="desc">
              <Tooltip title="Décroissant">
                <Typography variant="body2">↓</Typography>
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>

          {/* Clear Filters */}
          {(searchTerm || statusFilter !== 'all' || sortBy !== 'date' || sortOrder !== 'desc') && (
            <Button
              size="small"
              startIcon={<ClearIcon />}
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setSortBy('date');
                setSortOrder('desc');
              }}
              sx={{ textTransform: 'none' }}
            >
              Réinitialiser
            </Button>
          )}
        </Stack>
      </Paper>

      {/* Statistics Bar */}
      <Stack direction="row" spacing={2} mb={3}>
        <Paper sx={{ p: 2, flex: 1, borderRadius: 2 }}>
          <Typography variant="body2" color="text.secondary">Total</Typography>
          <Typography variant="h5" fontWeight="bold">{projects?.length || 0}</Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1, borderRadius: 2 }}>
          <Typography variant="body2" color="text.secondary">En cours</Typography>
          <Typography variant="h5" fontWeight="bold" color="primary">
            {projects?.filter(p => {
              const now = new Date();
              return new Date(p.startDate) <= now && new Date(p.endDate) >= now;
            }).length || 0}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1, borderRadius: 2 }}>
          <Typography variant="body2" color="text.secondary">À venir</Typography>
          <Typography variant="h5" fontWeight="bold" color="text.secondary">
            {projects?.filter(p => new Date(p.startDate) > new Date()).length || 0}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1, borderRadius: 2 }}>
          <Typography variant="body2" color="text.secondary">Terminés</Typography>
          <Typography variant="h5" fontWeight="bold" color="success.main">
            {projects?.filter(p => new Date(p.endDate) < new Date()).length || 0}
          </Typography>
        </Paper>
      </Stack>

      {/* Project Form Modal */}
      {showCreateForm && (
        <ProjectForm
          project={selectedProject}
          onClose={() => {
            setShowCreateForm(false);
            setSelectedProject(null);
          }}
        />
      )}

      {/* Projects Grid/List */}
      {filteredAndSortedProjects && filteredAndSortedProjects.length > 0 ? (
        viewMode === 'grid' ? (
          <Grid container spacing={3}>
            {filteredAndSortedProjects.map((project) => {
              const status = getProjectStatus(project.startDate, project.endDate);
              const progress = calculateProgress(project.startDate, project.endDate);
              
              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={project.id}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 3,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      borderTop: `4px solid ${project.backgroundColor || '#2563eb'}`,
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4,
                      }
                    }}
                    onClick={() => handleView(project.id)}
                  >
                    <CardContent sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
                      {/* Header */}
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
                        <Box flex={1}>
                          <Typography 
                            variant="h6" 
                            fontWeight="bold"
                            sx={{ 
                              mb: 0.5,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                            }}
                          >
                            {project.title}
                          </Typography>
                          <Chip 
                            label={status.label} 
                            size="small" 
                            color={status.color}
                            sx={{ height: 20 }}
                          />
                        </Box>
                        <IconButton 
                          size="small"
                          onClick={(e) => handleMenuClick(e, project.id)}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </Stack>

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
                          minHeight: '3em'
                        }}
                      >
                        {project.description || 'Pas de description'}
                      </Typography>

                      {/* Progress */}
                      <Box mb={2}>
                        <Stack direction="row" justifyContent="space-between" mb={0.5}>
                          <Typography variant="caption" color="text.secondary">
                            Progression
                          </Typography>
                          <Typography variant="caption" fontWeight="bold">
                            {progress}%
                          </Typography>
                        </Stack>
                        <LinearProgress 
                          variant="determinate" 
                          value={progress}
                          sx={{ 
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: 'grey.200'
                          }}
                        />
                      </Box>

                      {/* Meta Information */}
                      <Stack spacing={1}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <CalendarIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            {new Date(project.startDate).toLocaleDateString('fr-FR', { 
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <ScheduleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            {formatDuration(project.startDate, project.endDate)}
                          </Typography>
                        </Stack>
                      </Stack>

                      {/* Actions */}
                      <Stack direction="row" spacing={1} mt={2} onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<EditIcon />}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProject(project);
                            setShowCreateForm(true);
                          }}
                          sx={{ 
                            flex: 1,
                            textTransform: 'none',
                            borderRadius: 2
                          }}
                        >
                          Modifier
                        </Button>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(project.id);
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        ) : (
          // List View
          <Stack spacing={2}>
            {filteredAndSortedProjects.map((project) => {
              const status = getProjectStatus(project.startDate, project.endDate);
              const progress = calculateProgress(project.startDate, project.endDate);
              
              return (
                <Paper
                  key={project.id}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    borderLeft: `4px solid ${project.backgroundColor || '#2563eb'}`,
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    }
                  }}
                  onClick={() => handleView(project.id)}
                >
                  <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} md={4}>
                      <Stack spacing={1}>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Typography variant="h6" fontWeight="bold">
                            {project.title}
                          </Typography>
                          <Chip 
                            label={status.label} 
                            size="small" 
                            color={status.color}
                          />
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                          {project.description || 'Pas de description'}
                        </Typography>
                      </Stack>
                    </Grid>
                    
                    <Grid item xs={12} md={3}>
                      <Stack spacing={1}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <CalendarIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                          <Typography variant="body2">
                            {new Date(project.startDate).toLocaleDateString('fr-FR')} - {new Date(project.endDate).toLocaleDateString('fr-FR')}
                          </Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <ScheduleIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {formatDuration(project.startDate, project.endDate)}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Grid>

                    <Grid item xs={12} md={3}>
                      <Box>
                        <Stack direction="row" justifyContent="space-between" mb={0.5}>
                          <Typography variant="body2" color="text.secondary">
                            Progression
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {progress}%
                          </Typography>
                        </Stack>
                        <LinearProgress 
                          variant="determinate" 
                          value={progress}
                          sx={{ 
                            height: 8,
                            borderRadius: 4
                          }}
                        />
                      </Box>
                    </Grid>

                    <Grid item xs={12} md={2}>
                      <Stack direction="row" spacing={1} justifyContent="flex-end" onClick={(e) => e.stopPropagation()}>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleView(project.id);
                          }}
                        >
                          <ViewIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProject(project);
                            setShowCreateForm(true);
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(project.id);
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
                    </Grid>
                  </Grid>
                </Paper>
              );
            })}
          </Stack>
        )
      ) : (
        <Box 
          sx={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '400px',
            gap: 2
          }}
        >
          <Typography variant="h6" color="text.secondary">
            {projects?.length === 0 ? 'Aucun projet trouvé' : 'Aucun projet ne correspond aux filtres'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {projects?.length === 0 ? 'Créez votre premier projet pour commencer !' : 'Essayez de modifier les filtres de recherche'}
          </Typography>
          {projects?.length === 0 ? (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowCreateForm(true)}
              sx={{ mt: 2 }}
            >
              Créer un Projet
            </Button>
          ) : (
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setSortBy('date');
                setSortOrder('desc');
              }}
              sx={{ mt: 2 }}
            >
              Réinitialiser les filtres
            </Button>
          )}
        </Box>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem 
          onClick={() => {
            handleView(selectedProjectMenu!);
            handleCloseMenu();
          }}
        >
          <ViewIcon sx={{ mr: 1, fontSize: 20 }} />
          Voir
        </MenuItem>
        <MenuItem 
          onClick={() => {
            const project = projects?.find(p => p.id === selectedProjectMenu);
            if (project) {
              setSelectedProject(project);
              setShowCreateForm(true);
            }
            handleCloseMenu();
          }}
        >
          <EditIcon sx={{ mr: 1, fontSize: 20 }} />
          Modifier
        </MenuItem>
        <Divider />
        <MenuItem 
          onClick={() => {
            handleDelete(selectedProjectMenu!);
          }}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon sx={{ mr: 1, fontSize: 20 }} />
          Supprimer
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ProjectsPageGrid;
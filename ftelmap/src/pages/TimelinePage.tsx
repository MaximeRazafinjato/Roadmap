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
import { useProjects, useUpdateProject, useDeleteProject } from '../hooks/use-projects';
import { TimelineSimple } from '../components/timeline/TimelineSimple';
import ProjectForm from '../components/ProjectForm';
import type { Project, UpdateProjectForm } from '../types/entities';
import { useAuth } from '../contexts/auth-context';

const TimelinePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: projects, isLoading, error } = useProjects();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  
  const [openProjectDialog, setOpenProjectDialog] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteConfirmProject, setDeleteConfirmProject] = useState<Project | null>(null);
  
  // Gestion de la mise à jour d'un projet
  const handleProjectUpdate = async (project: Project, updates: Partial<Project>) => {
    const updateData: UpdateProjectForm = {
      id: project.id,
      title: updates.title ?? project.title,
      description: updates.description ?? project.description,
      startDate: updates.startDate ?? project.startDate,
      endDate: updates.endDate ?? project.endDate,
      backgroundColor: updates.backgroundColor ?? project.backgroundColor,
      textColor: updates.textColor ?? project.textColor,
      position: updates.position ?? project.position,
      ownerId: project.ownerId,
    };
    
    await updateProject.mutateAsync(updateData);
  };
  
  // Gestion de l'édition d'un projet
  const handleProjectEdit = (project: Project) => {
    setEditingProject(project);
    setOpenProjectDialog(true);
  };
  
  // Gestion de la suppression d'un projet
  const handleProjectDelete = (project: Project) => {
    setDeleteConfirmProject(project);
  };
  
  const confirmDelete = async () => {
    if (deleteConfirmProject) {
      await deleteProject.mutateAsync(deleteConfirmProject.id);
      setDeleteConfirmProject(null);
    }
  };
  
  // Gestion de l'ajout d'un projet
  const handleProjectAdd = () => {
    setEditingProject(null);
    setOpenProjectDialog(true);
  };
  
  // Fermeture du dialogue
  const handleCloseDialog = () => {
    setOpenProjectDialog(false);
    setEditingProject(null);
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
          Impossible de charger les projets. Veuillez réessayer plus tard.
        </Alert>
      </Fade>
    );
  }
  
  return (
    <Fade in={true}>
      <Box sx={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
        {/* En-tête */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Timeline des Projets
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Visualisez et gérez vos projets sur une frise chronologique interactive
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleProjectAdd}
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
        
        {/* Timeline */}
        <Box sx={{ flex: 1, minHeight: 0 }}>
          {projects && projects.length > 0 ? (
            <TimelineSimple
              projects={projects}
              onProjectUpdate={handleProjectUpdate}
              onProjectEdit={handleProjectEdit}
              onProjectDelete={handleProjectDelete}
              onProjectAdd={handleProjectAdd}
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
                  Aucun projet pour le moment
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  Créez votre premier projet pour commencer à utiliser la timeline
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleProjectAdd}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                  }}
                >
                  Créer un Projet
                </Button>
              </Box>
            </Box>
          )}
        </Box>
        
        {/* Dialogue de formulaire de projet */}
        <Dialog
          open={openProjectDialog}
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
        >
          <ProjectForm
            project={editingProject}
            onClose={handleCloseDialog}
            ownerId={user?.id || ''}
          />
        </Dialog>
        
        {/* Dialogue de confirmation de suppression */}
        <Dialog
          open={!!deleteConfirmProject}
          onClose={() => setDeleteConfirmProject(null)}
          maxWidth="xs"
          fullWidth
        >
          <Box p={3}>
            <Typography variant="h6" gutterBottom>
              Confirmer la suppression
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Êtes-vous sûr de vouloir supprimer le projet "{deleteConfirmProject?.title}" ?
              Cette action est irréversible.
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button
                onClick={() => setDeleteConfirmProject(null)}
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
    </Fade>
  );
};

export default TimelinePage;
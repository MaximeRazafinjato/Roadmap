import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, handleApiError } from '../lib/api-client';
import type { Project, CreateProjectForm, UpdateProjectForm } from '../types/entities';

const PROJECTS_KEY = 'projects';

// Fetch all projects
export const useProjects = () => {
  return useQuery({
    queryKey: [PROJECTS_KEY],
    queryFn: async () => {
      const response = await apiClient.get<Project[]>('/projects');
      return response.data;
    },
  });
};

// Fetch single project
export const useProject = (id?: string) => {
  return useQuery({
    queryKey: [PROJECTS_KEY, id],
    queryFn: async () => {
      if (!id) throw new Error('Project ID is required');
      const response = await apiClient.get<Project>(`/projects/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

// Create project
export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateProjectForm) => {
      const response = await apiClient.post<Project>('/projects', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROJECTS_KEY] });
    },
    onError: (error) => {
      console.error('Failed to create project:', handleApiError(error));
    },
  });
};

// Update project
export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateProjectForm) => {
      const response = await apiClient.put<Project>(`/projects/${data.id}`, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [PROJECTS_KEY] });
      queryClient.invalidateQueries({ queryKey: [PROJECTS_KEY, data.id] });
    },
    onError: (error) => {
      console.error('Failed to update project:', handleApiError(error));
    },
  });
};

// Delete project
export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/projects/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROJECTS_KEY] });
    },
    onError: (error) => {
      console.error('Failed to delete project:', handleApiError(error));
    },
  });
};
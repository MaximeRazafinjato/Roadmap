import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, handleApiError } from '../lib/api-client';
import type { Step, CreateStepForm, UpdateStepForm } from '../types/entities';

const STEPS_KEY = 'steps';

// Fetch all steps
export const useSteps = () => {
  return useQuery({
    queryKey: [STEPS_KEY],
    queryFn: async () => {
      const response = await apiClient.get<Step[]>('/steps');
      return response.data;
    },
  });
};

// Fetch single step
export const useStep = (id?: string) => {
  return useQuery({
    queryKey: [STEPS_KEY, id],
    queryFn: async () => {
      if (!id) throw new Error('Step ID is required');
      const response = await apiClient.get<Step>(`/steps/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

// Create step
export const useCreateStep = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateStepForm) => {
      const response = await apiClient.post<Step>('/steps', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [STEPS_KEY] });
    },
    onError: (error) => {
      console.error('Failed to create step:', handleApiError(error));
    },
  });
};

// Update step
export const useUpdateStep = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateStepForm) => {
      const response = await apiClient.put<Step>(`/steps/${data.id}`, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [STEPS_KEY] });
      queryClient.invalidateQueries({ queryKey: [STEPS_KEY, data.id] });
    },
    onError: (error) => {
      console.error('Failed to update step:', handleApiError(error));
    },
  });
};

// Delete step
export const useDeleteStep = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/steps/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [STEPS_KEY] });
    },
    onError: (error) => {
      console.error('Failed to delete step:', handleApiError(error));
    },
  });
};
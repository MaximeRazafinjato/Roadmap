import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';

interface HealthStatus {
  status: string;
  timestamp: string;
  services: {
    api: string;
    database: string;
  };
}

export const useHealth = () => {
  return useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const response = await apiClient.get<HealthStatus>('/health');
      return response.data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

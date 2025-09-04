import type { AxiosResponse } from 'axios';
import { apiClient } from './api-client';

export const api = {
  get: <T = any>(url: string, params?: any): Promise<AxiosResponse<T>> => apiClient.get<T>(url, params),
  post: <T = any>(url: string, data?: any): Promise<AxiosResponse<T>> => apiClient.post<T>(url, data),
  put: <T = any>(url: string, data?: any): Promise<AxiosResponse<T>> => apiClient.put<T>(url, data),
  delete: <T = any>(url: string): Promise<AxiosResponse<T>> => apiClient.delete<T>(url),
  patch: <T = any>(url: string, data?: any): Promise<AxiosResponse<T>> => apiClient.patch<T>(url, data),
};
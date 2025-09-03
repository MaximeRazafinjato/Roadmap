import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig } from 'axios';
import { TokenStorage } from './token-storage';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5095/api';

class ApiClient {
  private instance: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (error?: unknown) => void;
  }> = [];

  constructor() {
    this.instance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.instance.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = TokenStorage.getToken();
        if (token && TokenStorage.isTokenValid()) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor with token refresh
    this.instance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // If already refreshing, add to queue
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then(() => {
              const token = TokenStorage.getToken();
              if (token && originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              return this.instance(originalRequest);
            }).catch(err => {
              return Promise.reject(err);
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          const refreshToken = TokenStorage.getRefreshToken();
          
          if (refreshToken) {
            try {
              // Try to refresh token
              const response = await this.instance.post('/auth/refresh', {
                refreshToken,
              });

              const { token, refreshToken: newRefreshToken, expiresIn } = response.data.data;

              TokenStorage.setTokenData({
                token,
                refreshToken: newRefreshToken,
                expiresAt: Date.now() + (expiresIn * 1000),
              });

              // Process failed queue
              this.processQueue(null);

              // Retry original request
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              return this.instance(originalRequest);

            } catch (refreshError) {
              // Refresh failed, clear tokens and redirect
              this.processQueue(refreshError);
              TokenStorage.clearTokens();
              this.redirectToLogin();
              return Promise.reject(refreshError);
            } finally {
              this.isRefreshing = false;
            }
          } else {
            // No refresh token available
            TokenStorage.clearTokens();
            this.redirectToLogin();
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private processQueue(error: unknown) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });

    this.failedQueue = [];
  }

  private redirectToLogin() {
    // Only redirect if we're not already on a public page
    const currentPath = window.location.pathname;
    const publicPaths = ['/login', '/register', '/forgot-password'];
    
    if (!publicPaths.includes(currentPath)) {
      window.location.href = '/login';
    }
  }

  get<T>(url: string, params?: any) {
    return this.instance.get<T>(url, { params });
  }

  post<T>(url: string, data?: any) {
    return this.instance.post<T>(url, data);
  }

  put<T>(url: string, data?: any) {
    return this.instance.put<T>(url, data);
  }

  delete<T>(url: string) {
    return this.instance.delete<T>(url);
  }

  patch<T>(url: string, data?: any) {
    return this.instance.patch<T>(url, data);
  }
}

export const apiClient = new ApiClient();

export const handleApiError = (error: unknown): string => {
  if (error instanceof AxiosError) {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.message) {
      return error.message;
    }
  }
  return 'An unexpected error occurred';
};
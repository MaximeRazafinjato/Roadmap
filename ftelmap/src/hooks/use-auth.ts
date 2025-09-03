import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth as useAuthContext } from '../contexts/auth-context';
import { AuthService } from '../services/auth-service';
import type { LoginRequest, RegisterRequest } from '../types/auth';

// Re-export the main useAuth hook from context
export { useAuth } from '../contexts/auth-context';

// Query keys
export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
} as const;

// Hook for login mutation
export function useLogin() {
  const { login } = useAuthContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginRequest) => login(credentials),
    onSuccess: () => {
      // Invalidate user-related queries
      queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
  });
}

// Hook for registration mutation
export function useRegister() {
  const { register } = useAuthContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterRequest) => register(data),
    onSuccess: () => {
      // Invalidate user-related queries
      queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
  });
}

// Hook for logout mutation
export function useLogout() {
  const { logout } = useAuthContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await logout();
    },
    onSuccess: () => {
      // Clear all cached data on logout
      queryClient.clear();
    },
  });
}

// Hook for change password mutation
export function useChangePassword() {
  return useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      AuthService.changePassword(currentPassword, newPassword),
  });
}

// Hook for password reset request
export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: (email: string) => AuthService.requestPasswordReset(email),
  });
}

// Hook for password reset
export function useResetPassword() {
  return useMutation({
    mutationFn: ({ token, newPassword }: { token: string; newPassword: string }) =>
      AuthService.resetPassword(token, newPassword),
  });
}

// Hook for email verification
export function useVerifyEmail() {
  return useMutation({
    mutationFn: (token: string) => AuthService.verifyEmail(token),
  });
}

// Hook for resending email verification
export function useResendEmailVerification() {
  return useMutation({
    mutationFn: () => AuthService.resendEmailVerification(),
  });
}

// Hook to check if user has specific role
export function useHasRole(role: string) {
  const { user } = useAuthContext();
  return user?.roles?.includes(role) ?? false;
}

// Hook to check if user has any of the specified roles
export function useHasAnyRole(roles: string[]) {
  const { user } = useAuthContext();
  return roles.some(role => user?.roles?.includes(role)) ?? false;
}

// Hook to check if user has all of the specified roles
export function useHasAllRoles(roles: string[]) {
  const { user } = useAuthContext();
  return roles.every(role => user?.roles?.includes(role)) ?? false;
}
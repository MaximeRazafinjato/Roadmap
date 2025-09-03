import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { AuthContextType, AuthUser, LoginRequest, RegisterRequest, TokenData } from '../types/auth';
import { AuthService } from '../services/auth-service';
import { TokenStorage } from '../lib/token-storage';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // Initialize with cached user if token is valid
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (TokenStorage.isTokenValid()) {
      return TokenStorage.getCachedUser();
    }
    return null;
  });
  
  // Only show loading if we need to fetch user data
  const [isLoading, setIsLoading] = useState(() => {
    // If we have a valid token but no cached user, we need to load
    return TokenStorage.isTokenValid() && !TokenStorage.getCachedUser();
  });

  const isAuthenticated = !!user && TokenStorage.isTokenValid();

  const login = useCallback(async (credentials: LoginRequest) => {
    try {
      setIsLoading(true);
      const response = await AuthService.login(credentials);
      
      // API returns with capital letters
      const tokenData: TokenData = {
        token: (response as any).Token || response.token,
        refreshToken: (response as any).RefreshToken || response.refreshToken,
        expiresAt: (response as any).Expiration ? new Date((response as any).Expiration).getTime() : Date.now() + 3600000,
      };
      
      TokenStorage.setTokenData(tokenData);
      const userData = (response as any).User || response.user;
      TokenStorage.setCachedUser(userData);
      setUser(userData);
    } catch (error) {
      TokenStorage.clearTokens();
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    try {
      setIsLoading(true);
      const response = await AuthService.register(data);
      
      // API returns with capital letters
      const tokenData: TokenData = {
        token: (response as any).Token || response.token,
        refreshToken: (response as any).RefreshToken || response.refreshToken,
        expiresAt: (response as any).Expiration ? new Date((response as any).Expiration).getTime() : Date.now() + 3600000,
      };
      
      TokenStorage.setTokenData(tokenData);
      const userData = (response as any).User || response.user;
      TokenStorage.setCachedUser(userData);
      setUser(userData);
    } catch (error) {
      TokenStorage.clearTokens();
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await AuthService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      TokenStorage.clearTokens();
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  const refreshUserToken = useCallback(async () => {
    const refreshToken = TokenStorage.getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await AuthService.refreshToken(refreshToken);
      
      const tokenData: TokenData = {
        token: response.token,
        refreshToken: response.refreshToken,
        expiresAt: Date.now() + (response.expiresIn * 1000),
      };
      
      TokenStorage.setTokenData(tokenData);
      return tokenData.token;
    } catch (error) {
      TokenStorage.clearTokens();
      setUser(null);
      throw error;
    }
  }, []);

  const initializeAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      
      if (!TokenStorage.isTokenValid()) {
        // Try to refresh the token if we have a refresh token
        const refreshToken = TokenStorage.getRefreshToken();
        if (refreshToken) {
          try {
            await refreshUserToken();
          } catch (error) {
            console.error('Token refresh failed:', error);
            TokenStorage.clearTokens();
            setUser(null);
            return;
          }
        } else {
          TokenStorage.clearTokens();
          setUser(null);
          return;
        }
      }

      // Get current user if we have a valid token
      try {
        const currentUser = await AuthService.getCurrentUser();
        TokenStorage.setCachedUser(currentUser);
        setUser(currentUser);
      } catch (error) {
        console.error('Failed to get current user:', error);
        TokenStorage.clearTokens();
        setUser(null);
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      TokenStorage.clearTokens();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [refreshUserToken]);

  // Initialize auth on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Set up token refresh interval
  useEffect(() => {
    if (!user || !isAuthenticated) {
      return;
    }

    const checkTokenInterval = setInterval(() => {
      if (TokenStorage.willTokenExpireSoon(10)) {
        refreshUserToken().catch((error) => {
          console.error('Automatic token refresh failed:', error);
          logout();
        });
      }
    }, 60000); // Check every minute

    return () => clearInterval(checkTokenInterval);
  }, [user, isAuthenticated, refreshUserToken, logout]);

  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
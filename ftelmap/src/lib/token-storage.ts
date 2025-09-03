import type { TokenData, AuthUser } from '../types/auth';

const TOKEN_KEY = 'authToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const TOKEN_EXPIRY_KEY = 'tokenExpiry';
const USER_KEY = 'cachedUser';

export class TokenStorage {
  static setTokenData(tokenData: TokenData): void {
    try {
      localStorage.setItem(TOKEN_KEY, tokenData.token);
      localStorage.setItem(TOKEN_EXPIRY_KEY, tokenData.expiresAt.toString());
      
      if (tokenData.refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, tokenData.refreshToken);
      }
    } catch (error) {
      console.error('Failed to store token data:', error);
    }
  }

  static getToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('Failed to get token:', error);
      return null;
    }
  }

  static getRefreshToken(): string | null {
    try {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Failed to get refresh token:', error);
      return null;
    }
  }

  static getTokenData(): TokenData | null {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      const expiryStr = localStorage.getItem(TOKEN_EXPIRY_KEY);

      if (!token || !expiryStr) {
        return null;
      }

      const expiresAt = parseInt(expiryStr, 10);
      
      return {
        token,
        refreshToken: refreshToken || undefined,
        expiresAt,
      };
    } catch (error) {
      console.error('Failed to get token data:', error);
      return null;
    }
  }

  static isTokenValid(): boolean {
    try {
      const tokenData = this.getTokenData();
      
      if (!tokenData) {
        return false;
      }

      // Check if token is expired (with 5 minute buffer)
      const now = Date.now();
      const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
      
      return tokenData.expiresAt > (now + bufferTime);
    } catch (error) {
      console.error('Failed to validate token:', error);
      return false;
    }
  }

  static clearTokens(): void {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(TOKEN_EXPIRY_KEY);
      localStorage.removeItem(USER_KEY);
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  }

  static setCachedUser(user: AuthUser): void {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Failed to cache user:', error);
    }
  }

  static getCachedUser(): AuthUser | null {
    try {
      const userStr = localStorage.getItem(USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Failed to get cached user:', error);
      return null;
    }
  }

  static willTokenExpireSoon(minutesBeforeExpiry: number = 5): boolean {
    try {
      const tokenData = this.getTokenData();
      
      if (!tokenData) {
        return true;
      }

      const now = Date.now();
      const warningTime = minutesBeforeExpiry * 60 * 1000;
      
      return tokenData.expiresAt <= (now + warningTime);
    } catch (error) {
      console.error('Failed to check token expiry:', error);
      return true;
    }
  }
}
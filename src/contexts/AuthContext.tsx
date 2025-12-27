import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import type { User, AuthTokens } from '../types';

interface AuthContextType {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (tokens: AuthTokens) => void;
  logout: () => void;
  refreshAccessToken: () => Promise<boolean>;
}

interface DecodedToken {
  userId: string;
  exp: number;
  iat: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'auth_tokens';
const USER_KEY = 'auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if token is expired
  const isTokenExpired = useCallback((token: string): boolean => {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const currentTime = Date.now() / 1000;
      // Add 60 second buffer
      return decoded.exp < currentTime + 60;
    } catch {
      return true;
    }
  }, []);

  // Refresh access token using refresh token
  const refreshAccessToken = useCallback(async (): Promise<boolean> => {
    const storedTokens = localStorage.getItem(TOKEN_KEY);
    if (!storedTokens) return false;

    try {
      const parsedTokens: AuthTokens = JSON.parse(storedTokens);

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: parsedTokens.refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();
      const newTokens: AuthTokens = data.tokens;

      localStorage.setItem(TOKEN_KEY, JSON.stringify(newTokens));
      setTokens(newTokens);
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      return false;
    }
  }, []);

  // Fetch user data from API
  const fetchUser = useCallback(async (accessToken: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }

      const data = await response.json();
      setUser(data.user || data);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user || data));
    } catch (error) {
      console.error('Failed to fetch user:', error);
      logout();
    }
  }, []);

  // Login function
  const login = useCallback((newTokens: AuthTokens) => {
    localStorage.setItem(TOKEN_KEY, JSON.stringify(newTokens));
    setTokens(newTokens);
    fetchUser(newTokens.accessToken);
  }, [fetchUser]);

  // Logout function
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setTokens(null);
    setUser(null);
  }, []);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const storedTokens = localStorage.getItem(TOKEN_KEY);
      const storedUser = localStorage.getItem(USER_KEY);

      if (!storedTokens) {
        setIsLoading(false);
        return;
      }

      try {
        const parsedTokens: AuthTokens = JSON.parse(storedTokens);

        // Check if access token is expired
        if (isTokenExpired(parsedTokens.accessToken)) {
          // Try to refresh
          const refreshed = await refreshAccessToken();
          if (!refreshed) {
            setIsLoading(false);
            return;
          }
        } else {
          setTokens(parsedTokens);

          // Load user from localStorage if available
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }

          // Fetch fresh user data
          await fetchUser(parsedTokens.accessToken);
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Set up token refresh interval
  useEffect(() => {
    if (!tokens) return;

    const checkTokenExpiry = () => {
      if (isTokenExpired(tokens.accessToken)) {
        refreshAccessToken();
      }
    };

    // Check every 5 minutes
    const interval = setInterval(checkTokenExpiry, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [tokens, isTokenExpired, refreshAccessToken]);

  const value: AuthContextType = {
    user,
    tokens,
    isAuthenticated: !!user && !!tokens,
    isLoading,
    login,
    logout,
    refreshAccessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

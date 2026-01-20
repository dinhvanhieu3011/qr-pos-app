import React, { createContext, useState, useContext, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  savedPassword: string | null;
  login: (password: string, savePassword: boolean, keepLoggedIn: boolean) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hardcoded password as per requirements
const HARDCODED_PASSWORD = 'hieu1970';
const KEY_SAVED_PASSWORD = 'saved_password';
const KEY_SESSION_TOKEN = 'session_token'; // Simple boolean flag or token

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [savedPassword, setSavedPassword] = useState<string | null>(null);

  useEffect(() => {
    checkLogin();
  }, []);

  const checkLogin = async () => {
    try {
      // Check for saved session
      const session = await SecureStore.getItemAsync(KEY_SESSION_TOKEN);
      if (session === 'true') {
        setIsAuthenticated(true);
      }

      // Check for saved password (regardless of session)
      const password = await SecureStore.getItemAsync(KEY_SAVED_PASSWORD);
      if (password === HARDCODED_PASSWORD) {
        setSavedPassword(password);
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (password: string, shouldSavePassword: boolean, keepLoggedIn: boolean): Promise<boolean> => {
    if (password === HARDCODED_PASSWORD) {
      setIsAuthenticated(true);
      
      try {
        // Handle Save Password
        if (shouldSavePassword) {
          await SecureStore.setItemAsync(KEY_SAVED_PASSWORD, password);
          setSavedPassword(password);
        } else {
          // If user unchecks it, we should remove it? 
          // Or just not update it. Let's strictly follow the checkbox state.
          // If user logs in with unchecked "Save Password", we remove the saved one.
          await SecureStore.deleteItemAsync(KEY_SAVED_PASSWORD);
          setSavedPassword(null);
        }

        // Handle Keep Logged In
        if (keepLoggedIn) {
          await SecureStore.setItemAsync(KEY_SESSION_TOKEN, 'true');
        } else {
          // Ensure it's cleared if not requested, though normally this is only checked on logout
          // But if they login fresh without "Keep Login", we shouldn't persist session next time
          await SecureStore.deleteItemAsync(KEY_SESSION_TOKEN);
        }
      } catch (error) {
        console.error('SecureStore error:', error);
      }

      return true;
    }
    return false;
  };

  const logout = async () => {
    setIsAuthenticated(false);
    try {
      await SecureStore.deleteItemAsync(KEY_SESSION_TOKEN);
      // We DO NOT delete the saved password on logout, so it can be used next time.
      // It is only deleted if they login again and uncheck "Save Password".
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, savedPassword, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

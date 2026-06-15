/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, type ReactNode } from 'react';
import { setAuthToken } from '../api';

type User = {
  name: string;
  email: string;
  username: string;
};

type AuthContextType = {
  token: string | null;
  currentUser: User | null;
  isLoggedIn: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_STORAGE_KEY = 'token';
const USER_STORAGE_KEY = 'currentUser';

const getStoredUser = (): User | null => {
  const storedUser = localStorage.getItem(USER_STORAGE_KEY);

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser) as User;
  } catch {
    localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => {
    const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    setAuthToken(storedToken);
    return storedToken;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() =>
    getStoredUser()
  );

  const login = (newToken: string, user: User) => {
    setToken(newToken);
    setCurrentUser(user);
    setAuthToken(newToken);
    localStorage.setItem(TOKEN_STORAGE_KEY, newToken);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  };

  const logout = () => {
    setToken(null);
    setCurrentUser(null);
    setAuthToken(null);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{ token, currentUser, isLoggedIn: Boolean(token), login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
};

export { useAuth };
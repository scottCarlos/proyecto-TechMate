import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  rol: string;
  // Agrega aquí otros campos de usuario según sea necesario
}

interface AuthData {
  token: string;
  user: User;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  setAuth: (authData: AuthData | null) => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isAgent: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<{ token: string | null; user: User | null }>(() => {
    // Initialize from localStorage if available
    if (typeof window !== 'undefined') {
      try {
        const storedAuth = localStorage.getItem('auth');
        if (storedAuth) {
          const parsed = JSON.parse(storedAuth);
          return {
            token: parsed.token || null,
            user: parsed.user || null
          };
        }
      } catch (error) {
        console.error('Error parsing auth data from localStorage:', error);
      }
    }
    return { token: null, user: null };
  });

  const setAuth = (authData: AuthData | null) => {
    if (authData) {
      localStorage.setItem('auth', JSON.stringify(authData));
      setAuthState({
        token: authData.token,
        user: authData.user
      });
    } else {
      localStorage.removeItem('auth');
      setAuthState({ token: null, user: null });
    }
  };

  const value = {
    token: authState.token,
    user: authState.user,
    setAuth,
    isAuthenticated: !!authState.token,
    isAdmin: authState.user?.rol === 'Admin',
    isAgent: authState.user?.rol === 'Agente' || authState.user?.rol === 'Admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

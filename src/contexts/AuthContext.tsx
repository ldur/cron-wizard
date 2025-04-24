
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { signIn, signOut, getCurrentUser, type AuthUser } from 'aws-amplify/auth';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: Error | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      setError(null);
      const { isSignedIn } = await signIn({ username, password });
      if (isSignedIn) {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      }
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await signOut();
      setUser(null);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout }}>
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

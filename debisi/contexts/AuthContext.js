'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useQuery, useApolloClient } from '@apollo/client';
import { GET_CURRENT_USER } from '../graphql/queries/user/user';
import { auth } from '../config/firebase';
import { onIdTokenChanged, signOut, signInWithEmailAndPassword } from 'firebase/auth';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const client = useApolloClient();
  const [currentToken, setCurrentToken] = useState(null);

  // Sync token and user state with Firebase
  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        if (!firebaseUser.emailVerified) {
          localStorage.removeItem('userToken');
          setCurrentToken(null);
          setUser(null);
          // Optional: You might want to allow them to stay "logged in" but with restricted access
          // For now, let's enforce verification
          setLoading(false);
          return;
        }

        const token = await firebaseUser.getIdToken();
        localStorage.setItem('userToken', token);
        setCurrentToken(token);
      } else {
        localStorage.removeItem('userToken');
        setCurrentToken(null);
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const { data, error, refetch, loading: queryLoading } = useQuery(GET_CURRENT_USER, {
    skip: !currentToken,
    fetchPolicy: 'network-only',
  });

  // Update local user state when backend returns current user
  useEffect(() => {
    if (currentToken) {
      if (!queryLoading) {
        if (data?.me) {
          setUser(data.me);
        } else if (error) {
          console.error('Error fetching user from backend:', error);
          // If query fails, we might still have firebase user but no backend user
          // Should we logout? For now just stop loading
        }
        setLoading(false);
      }
    }
  }, [data, error, queryLoading, currentToken]);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (!userCredential.user.emailVerified) {
        // Trigger resend modal or throw error
        const err = new Error('Please verify your email before logging in.');
        err.code = 'auth/email-not-verified';
        throw err;
      }
      return true;
    } catch (err) {
      console.error('Login error:', err);
      setLoading(false);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      // Clear local state immediately
      setCurrentToken(null);
      setUser(null);
      localStorage.removeItem('userToken');
      // clearStore clears the cache without refetching active queries
      await client.clearStore();
      toast.success("Logged out successfully");
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      toast.error("Error logging out");
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    refetchUser: refetch,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

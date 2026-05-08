import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { getCurrentUserProfile } from '../services/dataService';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchUserProfile(session.user);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (authUser) => {
    try {
      const profile = await getCurrentUserProfile(authUser.id);
      setUser({
        id: authUser.id,
        email: authUser.email,
        name: profile?.name || authUser.email?.split('@')[0],
        role: profile?.role || 'member'
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      setUser({
        id: authUser.id,
        email: authUser.email,
        name: authUser.email?.split('@')[0],
        role: 'member'
      });
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, role) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
            role: role.toLowerCase()
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        toast.success('Account created successfully! 🎉');
        return true;
      }
    } catch (error) {
      toast.error(error.message || 'Registration failed');
      return false;
    }
  };

  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        toast.error(error.message);
        return false;
      }

      if (data.user) {
        toast.success('Welcome back! 🎉');
        return true;
      }
    } catch (error) {
      toast.error(error.message || 'Login failed');
      return false;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error(error.message || 'Logout failed');
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
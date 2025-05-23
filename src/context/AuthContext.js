import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

// Configurar axios
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Configurar interceptor para agregar el token a todas las peticiones
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (token) {
        try {
          await checkAuth();
        } catch (error) {
          console.error('Error initializing auth:', error);
          // Silently clear token without calling the logout endpoint
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data);
      return response.data;
    } catch (error) {
      // Solo loguear el error si no es 401 (no autorizado)
      if (error.response?.status !== 401) {
        console.error('Error checking auth:', error.response?.data || error.message);
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', {
        email: email,
        password: password
      });
      
      const { access_token } = response.data;
      localStorage.setItem('token', access_token);
      await checkAuth();
      return true;
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.detail || 'Login failed. Please verify your credentials.');
    }
  };

  const signup = async (email, password) => {
    try {
      const response = await api.post('/auth/signup', {
        email,
        password
      });
      const { access_token } = response.data;
      localStorage.setItem('token', access_token);
      await checkAuth();
      return true;
    } catch (error) {
      console.error('Signup error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.detail || 'Error creating account. Please try with a different email.');
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        // Solo intentar logout en el servidor si hay un usuario autenticado
        if (user) {
          await api.post('/auth/logout');
        }
      }
    } catch (error) {
      // Solo loguear el error si no es 401 (no autorizado)
      if (error.response?.status !== 401) {
        console.error('Logout error:', error.response?.data || error.message);
      }
    } finally {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

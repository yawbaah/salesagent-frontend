import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API, { API_BASE } from '../api/axios';
import Store from '../api/auth-store';

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [booted, setBooted] = useState(false);
  const navigate = useNavigate();

  // ── Boot ──
  useEffect(() => {
    // Clean up any orphaned data first
    Store.cleanup();

    if (!Store.hasSession()) {
      // No nonce → not logged in, no matter what
      Store.destroy();
      setUser(null);
      setBooted(true);
      return;
    }

    // Nonce exists → try to restore
    const cached = Store.user();
    if (cached) setUser(cached);

    API.get('/auth/me/')
      .then(({ data }) => {
        setUser(data);
        Store.writeUser(data);
      })
      .catch(() => {
        Store.destroy();
        setUser(null);
      })
      .finally(() => setBooted(true));
  }, []);

  // ── Login ──
  const login = async (identifier, password) => {
    try {
      const { data } = await API.post('/auth/login/', { identifier, password });
      Store.open(data.tokens, data.user);
      setUser(data.user);
      navigate('/dashboard');
      return { success: true };
    } catch (err) {
      return {
        success: false,
        errors: err.response?.data || { detail: 'Invalid credentials' },
      };
    }
  };

  // ── Signup ──
  const signup = async (fd) => {
    try {
      const { data } = await API.post('/auth/signup/', {
        first_name: fd.firstName,
        last_name: fd.lastName,
        email: fd.email,
        phone: fd.phone,
        business_name: fd.businessName || '',
        password: fd.password,
        password_confirm: fd.passwordConfirm,
      });
      Store.open(data.tokens, data.user);
      setUser(data.user);
      navigate('/dashboard');
      return { success: true };
    } catch (err) {
      return {
        success: false,
        errors: err.response?.data || { detail: 'Something went wrong' },
      };
    }
  };

  // ── Logout ──
  const logout = () => {
    const rt = Store.refresh();

    // Kill everything synchronously
    Store.destroy();
    setUser(null);

    // Tell backend (raw axios, fire-and-forget)
    if (rt) {
      axios.post(`${API_BASE}/auth/logout/`, { refresh: rt }).catch(() => {});
    }

    // Hard reload — nukes ALL JS state
    window.location.replace('/login');
  };

  // ── Update user ──
  const updateUser = (u) => {
    setUser(u);
    Store.writeUser(u);
  };

  return (
    <Ctx.Provider
      value={{
        user,
        loading: !booted,
        isAuthenticated: booted && !!user && Store.hasSession(),
        login,
        signup,
        logout,
        updateUser,
        fetchMe: () => {
          API.get('/auth/me/')
            .then(({ data }) => updateUser(data))
            .catch(() => {});
        },
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error('useAuth must be inside AuthProvider');
  return c;
};
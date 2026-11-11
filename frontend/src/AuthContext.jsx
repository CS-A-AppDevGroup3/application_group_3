import { createContext, useContext, useEffect, useState } from 'react';
import { api, getToken, setToken, clearToken } from './api';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(getToken())); // restoring a saved session

  useEffect(() => {
    if (!getToken()) return;
    api('/auth/me')
      .then((d) => setUser(d.user))
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  async function authenticate(path, body) {
    const data = await api(path, { method: 'POST', body });
    setToken(data.token);
    setUser(data.user);
  }

  const value = {
    user,
    loading,
    login: (email, password) => authenticate('/auth/login', { email, password }),
    register: (name, email, password) => authenticate('/auth/register', { name, email, password }),
    async logout() {
      try {
        await api('/auth/logout', { method: 'POST' });
      } catch {
        /* even if the server call fails, end the local session */
      }
      clearToken();
      setUser(null);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

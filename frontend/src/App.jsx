import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <p className="center-note">Loading your session…</p>;
  return user ? children : <Navigate to="/login" replace />;
}

function GuestOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <p className="center-note">Loading your session…</p>;
  return user ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
      <Route path="/register" element={<GuestOnly><Register /></GuestOnly>} />
      <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

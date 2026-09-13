import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) {
    return (
      <div className="auth-loading">
        <p>Kraunama…</p>
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/prisijungti" replace state={{ from: location.pathname }} />;
  }
  return <>{children}</>;
}

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();
  if (loading) {
    return (
      <div className="auth-loading">
        <p>Kraunama…</p>
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/prisijungti" replace state={{ from: location.pathname }} />;
  }
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

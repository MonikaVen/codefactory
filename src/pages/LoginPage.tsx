import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export function LoginPage() {
  const { user, login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from || '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (!loading && user) return <Navigate to={from} replace />;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nepavyko prisijungti');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={onSubmit}>
        <span className="eyebrow">Paskyra</span>
        <h1>Prisijungti</h1>
        <p className="muted">Sekite pažangą ir istoriją visuose įrenginiuose.</p>
        {error && <div className="auth-error">{error}</div>}
        <label>
          El. paštas
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          Slaptažodis
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <button className="btn btn-primary" type="submit" disabled={busy}>
          {busy ? 'Jungiamasi…' : 'Prisijungti'}
        </button>
        <p className="auth-switch">
          Neturite paskyros? <Link to="/registracija">Registruotis</Link>
        </p>
        <p className="auth-hint">Demo admin: admin@ket.lt / admin123</p>
      </form>
    </div>
  );
}

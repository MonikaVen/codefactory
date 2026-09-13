import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export function RegisterPage() {
  const { user, register, loading } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (!loading && user) return <Navigate to="/" replace />;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await register(name.trim(), email.trim(), password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nepavyko užsiregistruoti');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={onSubmit}>
        <span className="eyebrow">Nauja paskyra</span>
        <h1>Registracija</h1>
        <p className="muted">Sukurkite paskyrą, kad saugotume jūsų mokymosi istoriją.</p>
        {error && <div className="auth-error">{error}</div>}
        <label>
          Vardas
          <input value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />
        </label>
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
          Slaptažodis (min. 6)
          <input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </label>
        <button className="btn btn-primary" type="submit" disabled={busy}>
          {busy ? 'Kuriama…' : 'Sukurti paskyrą'}
        </button>
        <p className="auth-switch">
          Jau turite paskyrą? <Link to="/prisijungti">Prisijungti</Link>
        </p>
      </form>
    </div>
  );
}

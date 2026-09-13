import { NavLink } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const links = [
  { to: '/', label: 'Pradžia', end: true },
  { to: '/mokytis', label: 'Mokytis' },
  { to: '/zenklai', label: 'Ženklai' },
  { to: '/testas', label: 'Testas' },
  { to: '/egzaminas', label: 'Egzaminas' },
  { to: '/pazanga', label: 'Pažanga' },
];

export function Nav() {
  const { user, logout, isAdmin, loading } = useAuth();

  return (
    <header className="nav">
      <NavLink to="/" className="nav-brand">
        <span className="nav-mark">K</span>
        <span>KET Mokykla</span>
      </NavLink>
      <nav className="nav-links" aria-label="Pagrindinė navigacija">
        {user &&
          links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              {l.label}
            </NavLink>
          ))}
        {isAdmin && (
          <NavLink to="/admin" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            Admin
          </NavLink>
        )}
      </nav>
      <div className="nav-auth">
        {loading ? null : user ? (
          <>
            <span className="nav-user">{user.name}</span>
            <button className="btn btn-ghost" type="button" onClick={logout}>
              Atsijungti
            </button>
          </>
        ) : (
          <>
            <NavLink to="/prisijungti" className="btn btn-ghost">
              Prisijungti
            </NavLink>
            <NavLink to="/registracija" className="btn btn-primary">
              Registruotis
            </NavLink>
          </>
        )}
      </div>
    </header>
  );
}

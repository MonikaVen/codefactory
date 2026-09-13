import { useEffect, useState } from 'react';
import {
  api,
  type AdminStats,
  type AdminUserRow,
  type ApiUser,
  type HistoryEvent,
  type ProgressPayload,
} from '../api/client';

export function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [detail, setDetail] = useState<{
    user: ApiUser;
    progress: ProgressPayload;
    history: HistoryEvent[];
  } | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const reload = async () => {
    setError('');
    try {
      const [s, u] = await Promise.all([api.adminStats(), api.adminUsers()]);
      setStats(s.stats);
      setUsers(u.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nepavyko įkelti');
    }
  };

  useEffect(() => {
    void reload();
  }, []);

  useEffect(() => {
    if (!selected) {
      setDetail(null);
      return;
    }
    api
      .adminUserHistory(selected)
      .then(setDetail)
      .catch((err) => setError(err instanceof Error ? err.message : 'Klaida'));
  }, [selected]);

  const patchUser = async (id: string, body: { active?: boolean; role?: 'user' | 'admin' }) => {
    setBusy(true);
    try {
      await api.adminPatchUser(id, body);
      await reload();
      if (selected === id) setDetail(await api.adminUserHistory(id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nepavyko atnaujinti');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="section-head">
        <div>
          <span className="eyebrow">Administravimas</span>
          <h1>Admin panelė</h1>
          <p>Naudotojai, pažanga ir stebima veiklos istorija.</p>
        </div>
        <button className="btn btn-ghost" type="button" onClick={() => void reload()} disabled={busy}>
          Atnaujinti
        </button>
      </div>

      {error && <div className="auth-error">{error}</div>}

      {stats && (
        <div className="stat-row">
          <div className="stat">
            <div className="label">Naudotojai</div>
            <div className="value">{stats.users}</div>
            <div className="label">Aktyvūs (7 d.): {stats.activeUsers}</div>
          </div>
          <div className="stat">
            <div className="label">Istorijos įrašai</div>
            <div className="value">{stats.historyEvents}</div>
          </div>
          <div className="stat">
            <div className="label">Testai / egzaminai</div>
            <div className="value">{stats.quizzes}</div>
          </div>
        </div>
      )}

      <div className="admin-layout">
        <div className="admin-users">
          <h2>Naudotojai</h2>
          <div className="admin-table">
            {users.map((u) => (
              <button
                key={u.id}
                type="button"
                className={`admin-user-row${selected === u.id ? ' active' : ''}${
                  !u.active ? ' inactive' : ''
                }`}
                onClick={() => setSelected(u.id)}
              >
                <div>
                  <strong>{u.name}</strong>
                  <span className="muted">
                    {u.email} · {u.role}
                    {!u.active ? ' · išjungta' : ''}
                  </span>
                </div>
                <div className="admin-user-meta">
                  <span>{u.studiedRules} tais.</span>
                  <span>{u.quizzes} test.</span>
                  <span>{u.streak} d.</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="admin-detail">
          {!detail ? (
            <p className="muted">Pasirinkite naudotoją istorijai peržiūrėti.</p>
          ) : (
            <>
              <div className="section-head" style={{ marginBottom: '1rem' }}>
                <div>
                  <h2 style={{ margin: 0 }}>{detail.user.name}</h2>
                  <p className="muted" style={{ margin: '0.25rem 0 0' }}>
                    {detail.user.email}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    className="btn btn-ghost"
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      void patchUser(detail.user.id, {
                        role: detail.user.role === 'admin' ? 'user' : 'admin',
                      })
                    }
                  >
                    {detail.user.role === 'admin' ? 'Pašalinti admin' : 'Padaryti admin'}
                  </button>
                  <button
                    className={`btn ${detail.user.active ? 'btn-danger' : 'btn-primary'}`}
                    type="button"
                    disabled={busy}
                    onClick={() => void patchUser(detail.user.id, { active: !detail.user.active })}
                  >
                    {detail.user.active ? 'Išjungti' : 'Įjungti'}
                  </button>
                </div>
              </div>

              <div className="stat-row" style={{ marginBottom: '1.25rem' }}>
                <div className="stat">
                  <div className="label">Taisyklės</div>
                  <div className="value">{detail.progress.studiedRules.length}</div>
                </div>
                <div className="stat">
                  <div className="label">Ženklai</div>
                  <div className="value">{detail.progress.masteredSigns.length}</div>
                </div>
                <div className="stat">
                  <div className="label">Serija</div>
                  <div className="value">{detail.progress.streak}</div>
                </div>
              </div>

              <h3>Veiklos istorija</h3>
              <div className="history-list">
                {detail.history.length === 0 ? (
                  <p className="muted">Istorijos dar nėra.</p>
                ) : (
                  detail.history.map((h) => (
                    <div key={h.id} className="history-item">
                      <span>
                        <strong>{h.type}</strong>
                        {h.detail ? ` · ${h.detail}` : ''}
                      </span>
                      <span className="muted">{new Date(h.createdAt).toLocaleString('lt-LT')}</span>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

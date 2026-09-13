import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, type HistoryEvent } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { chapters } from '../data/chapters';
import { examTopicWeights, examWeightsTotal, pdfCoverage } from '../data/examWeights';
import { signs } from '../data/signs';
import { useProgress } from '../hooks/useProgress';

export function ProgressPage() {
  const { user } = useAuth();
  const { progress, studiedPct, totalRules, resetProgress } = useProgress();
  const [activity, setActivity] = useState<HistoryEvent[]>([]);
  const examAttempts = progress.quizHistory.filter((h) => h.mode === 'exam');
  const bestExam = examAttempts.reduce(
    (best, h) => Math.max(best, Math.round((h.score / h.total) * 100)),
    0,
  );
  const weightsTotal = examWeightsTotal();
  const coveredCount = pdfCoverage.filter((c) => c.covered).length;

  useEffect(() => {
    if (!user) {
      setActivity([]);
      return;
    }
    let cancelled = false;
    api
      .getHistory(40)
      .then((r) => {
        if (!cancelled) setActivity(r.history);
      })
      .catch(() => {
        if (!cancelled) setActivity([]);
      });
    return () => {
      cancelled = true;
    };
  }, [user, progress.quizHistory.length, progress.studiedRules.length, progress.masteredSigns.length]);

  return (
    <div>
      <div className="section-head">
        <div>
          <span className="eyebrow">Statistika</span>
          <h1>Jūsų pažanga</h1>
          <p>
            {user
              ? 'Pažanga ir veiklos istorija sinchronizuojama su jūsų paskyra.'
              : 'Galite mokytis be paskyros — pažanga saugoma šiame įrenginyje. Prisijunkite, jei norite sinchronizuoti istoriją.'}
          </p>
          {!user && (
            <p className="muted" style={{ marginTop: '0.5rem' }}>
              <Link to="/prisijungti">Prisijungti</Link>
              {' · '}
              <Link to="/registracija">Registruotis</Link>
            </p>
          )}
        </div>
        <button className="btn btn-danger" type="button" onClick={resetProgress}>
          Nunulinti
        </button>
      </div>

      <div className="stat-row">
        <div className="stat">
          <div className="label">Taisyklės</div>
          <div className="value">{studiedPct}%</div>
          <div className="label">
            {progress.studiedRules.length}/{totalRules}
          </div>
        </div>
        <div className="stat">
          <div className="label">Ženklai</div>
          <div className="value">
            {progress.masteredSigns.length}/{signs.length}
          </div>
        </div>
        <div className="stat">
          <div className="label">Serija</div>
          <div className="value">{progress.streak} d.</div>
        </div>
        <div className="stat">
          <div className="label">Geriausias egzaminas</div>
          <div className="value">{examAttempts.length ? `${bestExam}%` : '—'}</div>
        </div>
      </div>

      <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
        Egzamino temų svoriai ({weightsTotal} %)
      </h2>
      <p style={{ color: 'var(--muted)', marginBottom: '0.85rem', fontSize: '0.92rem' }}>
        Orientaciniai svoriai mokymuisi — visada sudaro lygiai 100 %.
      </p>
      <div className="weight-list">
        {examTopicWeights.map((w) => (
          <div key={w.chapterId} className="weight-row">
            <span>{w.label}</span>
            <strong>{w.percent}%</strong>
            <div className="weight-bar">
              <span style={{ width: `${Math.min(100, w.percent * 4)}%` }} />
            </div>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
        KET PDF padengimas ({coveredCount}/{pdfCoverage.length})
      </h2>
      <p style={{ color: 'var(--muted)', marginBottom: '0.85rem', fontSize: '0.92rem' }}>
        Ne visi PDF skyriai turi testų klausimų. Trūkumus galite užpildyti pridėdami klausimą
        mokymosi kortelėje.
      </p>
      <div className="coverage-list">
        {pdfCoverage.map((row) => (
          <div key={row.pdfChapter} className={`coverage-row ${row.covered ? 'ok' : 'gap'}`}>
            <span>{row.pdfChapter}</span>
            <strong>{row.covered ? 'Yra' : 'Trūksta'}</strong>
            <span className="coverage-note">{row.note}</span>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: '1.25rem', marginBottom: '0.85rem' }}>Skyrių testai</h2>
      <div className="grid-chapters" style={{ marginBottom: '2rem' }}>
        {chapters.map((ch) => (
          <Link
            key={ch.id}
            to={`/testas?tema=${ch.id}`}
            className="chapter-tile"
            style={{ ['--tile-color' as string]: ch.color }}
          >
            <div className="roman">{ch.roman}</div>
            <h3>{ch.title}</h3>
            <div className="meta">
              {progress.chapterScores[ch.id] != null
                ? `Geriausias: ${progress.chapterScores[ch.id]}%`
                : 'Dar netestuota'}
            </div>
          </Link>
        ))}
      </div>

      <h2 style={{ fontSize: '1.25rem', marginBottom: '0.85rem' }}>Testų rezultatai</h2>
      {progress.quizHistory.length === 0 ? (
        <p className="empty">Dar nėra bandymų. Išbandykite testą arba egzaminą.</p>
      ) : (
        <div className="history-list" style={{ marginBottom: '2rem' }}>
          {progress.quizHistory.map((h, idx) => (
            <div key={`${h.date}-${idx}`} className="history-item">
              <span>
                {h.mode === 'exam' ? 'Egzaminas' : 'Testas'} · {h.score}/{h.total}
              </span>
              <span className="muted">{h.date}</span>
            </div>
          ))}
        </div>
      )}

      <h2 style={{ fontSize: '1.25rem', marginBottom: '0.85rem' }}>Veiklos istorija</h2>
      {!user ? (
        <p className="empty">
          Stebima veiklos istorija pasiekiama prisijungus.{' '}
          <Link to="/prisijungti">Prisijunkite</Link>, kad sektumėte mokymąsi visuose įrenginiuose.
        </p>
      ) : activity.length === 0 ? (
        <p className="empty">Veiklos įrašų dar nėra — mokykitės, kad atsirastų.</p>
      ) : (
        <div className="history-list">
          {activity.map((h) => (
            <div key={h.id} className="history-item">
              <span>
                <strong>{h.type}</strong>
                {h.detail ? ` · ${h.detail}` : ''}
              </span>
              <span className="muted">{new Date(h.createdAt).toLocaleString('lt-LT')}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

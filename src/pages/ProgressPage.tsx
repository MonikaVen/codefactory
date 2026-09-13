import { Link } from 'react-router-dom';
import { chapters } from '../data/chapters';
import { examTopicWeights, examWeightsTotal, pdfCoverage } from '../data/examWeights';
import { signs } from '../data/signs';
import { useProgress } from '../hooks/useProgress';

export function ProgressPage() {
  const { progress, studiedPct, totalRules, resetProgress } = useProgress();
  const examAttempts = progress.quizHistory.filter((h) => h.mode === 'exam');
  const bestExam = examAttempts.reduce(
    (best, h) => Math.max(best, Math.round((h.score / h.total) * 100)),
    0,
  );
  const weightsTotal = examWeightsTotal();
  const coveredCount = pdfCoverage.filter((c) => c.covered).length;

  return (
    <div>
      <div className="section-head">
        <div>
          <span className="eyebrow">Statistika</span>
          <h1>Jūsų pažanga</h1>
          <p>Duomenys saugomi šiame įrenginyje (localStorage).</p>
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

      <h2 style={{ fontSize: '1.25rem', marginBottom: '0.85rem' }}>Istorija</h2>
      {progress.quizHistory.length === 0 ? (
        <p className="empty">Dar nėra bandymų. Išbandykite testą arba egzaminą.</p>
      ) : (
        <div className="history-list">
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
    </div>
  );
}

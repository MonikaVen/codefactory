import { useMemo, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { SignVisual } from '../components/SignVisual';
import { getChapter } from '../data/chapters';
import { questions } from '../data/questions';
import { signs } from '../data/signs';
import type { SignCategory } from '../data/types';
import { useProgress } from '../hooks/useProgress';
import { useUserContent } from '../hooks/useUserContent';

type FormMode = 'none' | 'question' | 'sign' | 'link-q' | 'link-s';

export function ChapterPage() {
  const { chapterId } = useParams();
  const chapter = getChapter(chapterId ?? '');
  const { progress, markRuleStudied } = useProgress();
  const {
    content,
    linksFor,
    addQuestionToRule,
    linkExistingQuestion,
    addSignToRule,
    linkExistingSign,
    unlinkFromRule,
  } = useUserContent();

  const [openForm, setOpenForm] = useState<{ ruleId: string; mode: FormMode } | null>(null);

  const allQuestions = useMemo(
    () => [...questions, ...content.customQuestions],
    [content.customQuestions],
  );
  const allSigns = useMemo(() => [...signs, ...content.customSigns], [content.customSigns]);

  if (!chapter) {
    return (
      <div>
        <h1>Skyrius nerastas</h1>
        <Link className="btn btn-primary" to="/mokytis" style={{ marginTop: '1rem' }}>
          Grįžti
        </Link>
      </div>
    );
  }

  const resolveQuestions = (ruleId: string, builtin?: string[]) => {
    const linked = linksFor(ruleId).questionIds;
    const ids = [...new Set([...(builtin ?? []), ...linked])];
    return ids
      .map((id) => allQuestions.find((q) => q.id === id))
      .filter((q): q is NonNullable<typeof q> => Boolean(q));
  };

  const resolveSigns = (ruleId: string, builtin?: string[]) => {
    const linked = linksFor(ruleId).signIds;
    const ids = [...new Set([...(builtin ?? []), ...linked])];
    return ids
      .map((id) => allSigns.find((s) => s.id === id))
      .filter((s): s is NonNullable<typeof s> => Boolean(s));
  };

  const submitQuestion = (e: FormEvent<HTMLFormElement>, ruleId: string) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const options = [0, 1, 2, 3].map((i) => String(fd.get(`opt${i}`) ?? '').trim()) as [
      string,
      string,
      string,
      string,
    ];
    if (options.some((o) => !o) || !String(fd.get('question')).trim()) return;
    addQuestionToRule(ruleId, {
      question: String(fd.get('question')).trim(),
      options,
      correctIndex: Number(fd.get('correctIndex') ?? 0),
      explanation: String(fd.get('explanation') ?? '').trim() || 'Naudotojo klausimas',
      chapterId: chapter.id,
    });
    setOpenForm(null);
  };

  const submitSign = (e: FormEvent<HTMLFormElement>, ruleId: string) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get('name') ?? '').trim();
    const code = String(fd.get('code') ?? '').trim();
    if (!name || !code) return;
    addSignToRule(ruleId, {
      code,
      name,
      category: String(fd.get('category') ?? 'informaciniai') as SignCategory,
      meaning: String(fd.get('meaning') ?? '').trim() || name,
      shape: String(fd.get('shape') ?? 'rectangle') as
        | 'triangle'
        | 'circle-red'
        | 'circle-blue'
        | 'diamond'
        | 'rectangle'
        | 'octagon'
        | 'square',
    });
    setOpenForm(null);
  };

  const toggleForm = (ruleId: string, mode: FormMode) => {
    setOpenForm((prev) =>
      prev?.ruleId === ruleId && prev.mode === mode ? null : { ruleId, mode },
    );
  };

  return (
    <div>
      <div className="section-head">
        <div>
          <span className="eyebrow">Skyrius {chapter.roman}</span>
          <h1>{chapter.title}</h1>
          <p>{chapter.summary}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <Link className="btn btn-ghost" to="/mokytis">
            Visi skyriai
          </Link>
          <Link className="btn btn-primary" to={`/testas?tema=${chapter.id}`}>
            Testuoti temą
          </Link>
        </div>
      </div>

      <div className="rule-list">
        {chapter.rules.map((rule, i) => {
          const studied = progress.studiedRules.includes(rule.id);
          const relatedQs = resolveQuestions(rule.id, rule.relatedQuestionIds);
          const relatedSigns = resolveSigns(rule.id, rule.relatedSignIds);
          const mode = openForm?.ruleId === rule.id ? openForm.mode : 'none';
          const userQ = new Set(linksFor(rule.id).questionIds);
          const userS = new Set(linksFor(rule.id).signIds);

          return (
            <article
              key={rule.id}
              className={`rule-card${studied ? ' studied' : ''}`}
              style={{ animationDelay: `${i * 0.04}s` }}
            >
              <div className="rule-top">
                <span className="rule-num">§ {rule.number}</span>
                <h3>{rule.title}</h3>
              </div>
              <p className="body">{rule.text}</p>
              {rule.tip && <p className="tip">Patarimas: {rule.tip}</p>}

              <div className="card-attachments">
                {relatedQs.length > 0 && (
                  <div>
                    <h4>Klausimai ant kortelės</h4>
                    <div className="attach-list">
                      {relatedQs.map((q) => (
                        <div key={q.id} className="attach-item">
                          <div className="meta">
                            <strong>{q.question}</strong>
                            <p>
                              Atsakymas: {q.options[q.correctIndex]} — {q.explanation}
                            </p>
                            {userQ.has(q.id) && (
                              <div className="attach-actions">
                                <button
                                  type="button"
                                  className="btn btn-ghost"
                                  onClick={() => unlinkFromRule(rule.id, 'question', q.id)}
                                >
                                  Atjungti
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {relatedSigns.length > 0 && (
                  <div>
                    <h4>Ženklai ant kortelės</h4>
                    <div className="attach-list">
                      {relatedSigns.map((s) => (
                        <div key={s.id} className="attach-item">
                          <SignVisual sign={s} className="sign-visual" />
                          <div className="meta">
                            <strong>
                              {s.code} · {s.name}
                            </strong>
                            <p>{s.meaning}</p>
                            {userS.has(s.id) && (
                              <div className="attach-actions">
                                <button
                                  type="button"
                                  className="btn btn-ghost"
                                  onClick={() => unlinkFromRule(rule.id, 'sign', s.id)}
                                >
                                  Atjungti
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="attach-actions">
                  <button type="button" className="btn btn-ghost" onClick={() => toggleForm(rule.id, 'question')}>
                    + Klausimas
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={() => toggleForm(rule.id, 'sign')}>
                    + Ženklas
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={() => toggleForm(rule.id, 'link-q')}>
                    Susieti klausimą
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={() => toggleForm(rule.id, 'link-s')}>
                    Susieti ženklą
                  </button>
                </div>

                {mode === 'question' && (
                  <form className="attach-form" onSubmit={(e) => submitQuestion(e, rule.id)}>
                    <label>
                      Klausimas
                      <textarea name="question" required placeholder="Įveskite klausimą" />
                    </label>
                    <div className="row-2">
                      {[0, 1, 2, 3].map((n) => (
                        <label key={n}>
                          Variantas {n + 1}
                          <input name={`opt${n}`} required />
                        </label>
                      ))}
                    </div>
                    <label>
                      Teisingas variantas
                      <select name="correctIndex" defaultValue="0">
                        <option value="0">1</option>
                        <option value="1">2</option>
                        <option value="2">3</option>
                        <option value="3">4</option>
                      </select>
                    </label>
                    <label>
                      Paaiškinimas
                      <input name="explanation" placeholder="Trumpas paaiškinimas" />
                    </label>
                    <button className="btn btn-primary" type="submit">
                      Išsaugoti klausimą
                    </button>
                  </form>
                )}

                {mode === 'sign' && (
                  <form className="attach-form" onSubmit={(e) => submitSign(e, rule.id)}>
                    <div className="row-2">
                      <label>
                        Kodas
                        <input name="code" required placeholder="pvz. 329" />
                      </label>
                      <label>
                        Pavadinimas
                        <input name="name" required />
                      </label>
                    </div>
                    <label>
                      Reikšmė
                      <textarea name="meaning" />
                    </label>
                    <div className="row-2">
                      <label>
                        Kategorija
                        <select name="category" defaultValue="draudziamieji">
                          <option value="ispejamieji">Įspėjamieji</option>
                          <option value="pirmenybes">Pirmybės</option>
                          <option value="draudziamieji">Draudžiamieji</option>
                          <option value="nurodomieji">Nurodomieji</option>
                          <option value="informaciniai">Informaciniai</option>
                          <option value="papildomi">Papildomi</option>
                        </select>
                      </label>
                      <label>
                        Forma
                        <select name="shape" defaultValue="circle-red">
                          <option value="triangle">Trikampis</option>
                          <option value="octagon">Aštuonkampis</option>
                          <option value="diamond">Rombas</option>
                          <option value="circle-red">Raudonas apskritimas</option>
                          <option value="circle-blue">Mėlynas apskritimas</option>
                          <option value="rectangle">Stačiakampis</option>
                        </select>
                      </label>
                    </div>
                    <button className="btn btn-primary" type="submit">
                      Išsaugoti ženklą
                    </button>
                  </form>
                )}

                {mode === 'link-q' && (
                  <form
                    className="attach-form"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const id = String(new FormData(e.currentTarget).get('qid') ?? '');
                      if (id) linkExistingQuestion(rule.id, id);
                      setOpenForm(null);
                    }}
                  >
                    <label>
                      Esamas klausimas
                      <select name="qid" required defaultValue="">
                        <option value="" disabled>
                          Pasirinkite…
                        </option>
                        {allQuestions.map((q) => (
                          <option key={q.id} value={q.id}>
                            {q.question.slice(0, 90)}
                          </option>
                        ))}
                      </select>
                    </label>
                    <button className="btn btn-primary" type="submit">
                      Susieti
                    </button>
                  </form>
                )}

                {mode === 'link-s' && (
                  <form
                    className="attach-form"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const id = String(new FormData(e.currentTarget).get('sid') ?? '');
                      if (id) linkExistingSign(rule.id, id);
                      setOpenForm(null);
                    }}
                  >
                    <label>
                      Esamas ženklas
                      <select name="sid" required defaultValue="">
                        <option value="" disabled>
                          Pasirinkite…
                        </option>
                        {allSigns.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.code} · {s.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <button className="btn btn-primary" type="submit">
                      Susieti
                    </button>
                  </form>
                )}
              </div>

              <div style={{ marginTop: '1rem' }}>
                <button
                  type="button"
                  className={`btn ${studied ? 'btn-ghost' : 'btn-primary'}`}
                  onClick={() => markRuleStudied(rule.id)}
                  disabled={studied}
                >
                  {studied ? 'Išmokta' : 'Pažymėti kaip išmoktą'}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

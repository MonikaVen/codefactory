import { useCallback, useEffect, useState } from 'react';
import { api, getToken, type ProgressPayload } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { chapters } from '../data/chapters';
import type { ChapterId } from '../data/types';

const STORAGE_KEY = 'ket-mokykla-progress-v1';

export interface ProgressState {
  studiedRules: string[];
  masteredSigns: string[];
  quizHistory: { date: string; score: number; total: number; mode: string }[];
  chapterScores: Partial<Record<ChapterId, number>>;
  streak: number;
  lastStudyDate: string | null;
}

const defaultProgress: ProgressState = {
  studiedRules: [],
  masteredSigns: [],
  quizHistory: [],
  chapterScores: {},
  streak: 0,
  lastStudyDate: null,
};

function loadLocal(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultProgress };
    return { ...defaultProgress, ...JSON.parse(raw) };
  } catch {
    return { ...defaultProgress };
  }
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function toPayload(p: ProgressState): ProgressPayload {
  return {
    studiedRules: p.studiedRules,
    masteredSigns: p.masteredSigns,
    quizHistory: p.quizHistory,
    chapterScores: p.chapterScores as Record<string, number>,
    streak: p.streak,
    lastStudyDate: p.lastStudyDate,
  };
}

function fromPayload(p: ProgressPayload): ProgressState {
  return {
    studiedRules: p.studiedRules ?? [],
    masteredSigns: p.masteredSigns ?? [],
    quizHistory: p.quizHistory ?? [],
    chapterScores: (p.chapterScores ?? {}) as Partial<Record<ChapterId, number>>,
    streak: p.streak ?? 0,
    lastStudyDate: p.lastStudyDate ?? null,
  };
}

export function useProgress() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<ProgressState>(defaultProgress);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function boot() {
      if (!user || !getToken()) {
        if (!cancelled) {
          setProgress(loadLocal());
          setReady(true);
        }
        return;
      }
      try {
        const { progress: remote } = await api.getProgress();
        const next = fromPayload(remote);
        if (!cancelled) {
          setProgress(next);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
          setReady(true);
        }
      } catch {
        if (!cancelled) {
          setProgress(loadLocal());
          setReady(true);
        }
      }
    }
    setReady(false);
    void boot();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const persist = useCallback(
    async (next: ProgressState, history?: { type: string; detail: string; meta?: Record<string, unknown> }) => {
      setProgress(next);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      if (!user || !getToken()) return;
      try {
        await api.putProgress(toPayload(next));
        if (history) await api.postHistory(history.type, history.detail, history.meta);
      } catch {
        // Keep local copy if API is briefly unavailable.
      }
    },
    [user],
  );

  const markRuleStudied = useCallback(
    (ruleId: string) => {
      const base = { ...progress };
      if (base.studiedRules.includes(ruleId)) return;
      const last = base.lastStudyDate;
      const t = today();
      let streak = base.streak;
      if (last !== t) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const y = yesterday.toISOString().slice(0, 10);
        streak = last === y ? streak + 1 : 1;
      }
      void persist(
        {
          ...base,
          studiedRules: [...base.studiedRules, ruleId],
          streak,
          lastStudyDate: t,
        },
        { type: 'study', detail: `Išmokta taisyklė ${ruleId}`, meta: { ruleId } },
      );
    },
    [persist, progress],
  );

  const markSignMastered = useCallback(
    (signId: string) => {
      const base = { ...progress };
      if (base.masteredSigns.includes(signId)) return;
      void persist(
        { ...base, masteredSigns: [...base.masteredSigns, signId] },
        { type: 'sign', detail: `Išmoktas ženklas ${signId}`, meta: { signId } },
      );
    },
    [persist, progress],
  );

  const recordQuiz = useCallback(
    (score: number, total: number, mode: string, chapterId?: ChapterId) => {
      const base = { ...progress };
      const chapterScores = { ...base.chapterScores };
      if (chapterId) {
        const pct = Math.round((score / total) * 100);
        chapterScores[chapterId] = Math.max(chapterScores[chapterId] ?? 0, pct);
      }
      const t = today();
      let streak = base.streak;
      if (base.lastStudyDate !== t) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        streak = base.lastStudyDate === yesterday.toISOString().slice(0, 10) ? streak + 1 : 1;
      }
      void persist(
        {
          ...base,
          quizHistory: [{ date: t, score, total, mode }, ...base.quizHistory].slice(0, 50),
          chapterScores,
          streak,
          lastStudyDate: t,
        },
        {
          type: mode === 'exam' ? 'exam' : 'quiz',
          detail: `${mode === 'exam' ? 'Egzaminas' : 'Testas'}: ${score}/${total}`,
          meta: { score, total, mode, chapterId },
        },
      );
    },
    [persist, progress],
  );

  const resetProgress = useCallback(() => {
    void persist(
      { ...defaultProgress },
      { type: 'reset', detail: 'Pažanga nunulinta' },
    );
  }, [persist]);

  const totalRules = chapters.reduce((n, c) => n + c.rules.length, 0);
  const knownRuleIds = new Set(chapters.flatMap((c) => c.rules.map((r) => r.id)));
  const studiedCount = progress.studiedRules.filter((id) => knownRuleIds.has(id)).length;
  const studiedPct = totalRules
    ? Math.min(100, Math.round((studiedCount / totalRules) * 100))
    : 0;

  return {
    progress,
    ready,
    markRuleStudied,
    markSignMastered,
    recordQuiz,
    resetProgress,
    totalRules,
    studiedPct,
  };
}

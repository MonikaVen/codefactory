import { useCallback, useEffect, useState } from 'react';
import type { QuizQuestion, RoadSign, SignCategory } from '../data/types';

const STORAGE_KEY = 'ket-mokykla-user-content-v1';

export interface RuleLinks {
  questionIds: string[];
  signIds: string[];
}

export interface UserContentState {
  customQuestions: QuizQuestion[];
  customSigns: RoadSign[];
  ruleLinks: Record<string, RuleLinks>;
}

const empty: UserContentState = {
  customQuestions: [],
  customSigns: [],
  ruleLinks: {},
};

function load(): UserContentState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...empty };
    const parsed = JSON.parse(raw) as UserContentState;
    return {
      customQuestions: parsed.customQuestions ?? [],
      customSigns: parsed.customSigns ?? [],
      ruleLinks: parsed.ruleLinks ?? {},
    };
  } catch {
    return { ...empty };
  }
}

export function useUserContent() {
  const [content, setContent] = useState<UserContentState>(empty);

  useEffect(() => {
    setContent(load());
  }, []);

  const save = useCallback((next: UserContentState) => {
    setContent(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const linksFor = useCallback(
    (ruleId: string): RuleLinks => content.ruleLinks[ruleId] ?? { questionIds: [], signIds: [] },
    [content.ruleLinks],
  );

  const addQuestionToRule = useCallback(
    (
      ruleId: string,
      data: {
        question: string;
        options: [string, string, string, string];
        correctIndex: number;
        explanation: string;
        chapterId: QuizQuestion['chapterId'];
      },
    ) => {
      const base = load();
      const id = `uq-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const q: QuizQuestion = { id, ...data };
      const prev = base.ruleLinks[ruleId] ?? { questionIds: [], signIds: [] };
      save({
        ...base,
        customQuestions: [...base.customQuestions, q],
        ruleLinks: {
          ...base.ruleLinks,
          [ruleId]: { ...prev, questionIds: [...prev.questionIds, id] },
        },
      });
      return id;
    },
    [save],
  );

  const linkExistingQuestion = useCallback(
    (ruleId: string, questionId: string) => {
      const base = load();
      const prev = base.ruleLinks[ruleId] ?? { questionIds: [], signIds: [] };
      if (prev.questionIds.includes(questionId)) return;
      save({
        ...base,
        ruleLinks: {
          ...base.ruleLinks,
          [ruleId]: { ...prev, questionIds: [...prev.questionIds, questionId] },
        },
      });
    },
    [save],
  );

  const addSignToRule = useCallback(
    (
      ruleId: string,
      data: {
        code: string;
        name: string;
        category: SignCategory;
        meaning: string;
        shape: RoadSign['shape'];
      },
    ) => {
      const base = load();
      const id = `us-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const sign: RoadSign = { id, ...data };
      const prev = base.ruleLinks[ruleId] ?? { questionIds: [], signIds: [] };
      save({
        ...base,
        customSigns: [...base.customSigns, sign],
        ruleLinks: {
          ...base.ruleLinks,
          [ruleId]: { ...prev, signIds: [...prev.signIds, id] },
        },
      });
      return id;
    },
    [save],
  );

  const linkExistingSign = useCallback(
    (ruleId: string, signId: string) => {
      const base = load();
      const prev = base.ruleLinks[ruleId] ?? { questionIds: [], signIds: [] };
      if (prev.signIds.includes(signId)) return;
      save({
        ...base,
        ruleLinks: {
          ...base.ruleLinks,
          [ruleId]: { ...prev, signIds: [...prev.signIds, signId] },
        },
      });
    },
    [save],
  );

  const unlinkFromRule = useCallback(
    (ruleId: string, kind: 'question' | 'sign', id: string) => {
      const base = load();
      const prev = base.ruleLinks[ruleId] ?? { questionIds: [], signIds: [] };
      const next: RuleLinks =
        kind === 'question'
          ? { ...prev, questionIds: prev.questionIds.filter((x) => x !== id) }
          : { ...prev, signIds: prev.signIds.filter((x) => x !== id) };
      save({
        ...base,
        ruleLinks: { ...base.ruleLinks, [ruleId]: next },
      });
    },
    [save],
  );

  return {
    content,
    linksFor,
    addQuestionToRule,
    linkExistingQuestion,
    addSignToRule,
    linkExistingSign,
    unlinkFromRule,
  };
}

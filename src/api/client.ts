const TOKEN_KEY = 'ket-mokykla-token';

export type ApiUser = {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  active: boolean;
  createdAt: string;
};

export type ProgressPayload = {
  studiedRules: string[];
  masteredSigns: string[];
  quizHistory: { date: string; score: number; total: number; mode: string }[];
  chapterScores: Record<string, number>;
  streak: number;
  lastStudyDate: string | null;
  updatedAt?: string;
};

export type HistoryEvent = {
  id: string;
  userId: string;
  type: string;
  detail: string;
  meta?: Record<string, unknown>;
  createdAt: string;
};

export type AdminUserRow = ApiUser & {
  studiedRules: number;
  masteredSigns: number;
  quizzes: number;
  streak: number;
  lastStudyDate: string | null;
  lastEventAt: string | null;
};

export type AdminStats = {
  users: number;
  activeUsers: number;
  historyEvents: number;
  quizzes: number;
};

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(`/api${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || `Klaida ${res.status}`);
  }
  return data as T;
}

export const api = {
  register: (body: { email: string; name: string; password: string }) =>
    request<{ token: string; user: ApiUser }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  login: (body: { email: string; password: string }) =>
    request<{ token: string; user: ApiUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  me: () => request<{ user: ApiUser }>('/auth/me'),

  getProgress: () => request<{ progress: ProgressPayload }>('/progress'),

  putProgress: (progress: ProgressPayload) =>
    request<{ progress: ProgressPayload }>('/progress', {
      method: 'PUT',
      body: JSON.stringify({ progress }),
    }),

  getHistory: (limit = 50) =>
    request<{ history: HistoryEvent[] }>(`/history?limit=${limit}`),

  postHistory: (type: string, detail: string, meta?: Record<string, unknown>) =>
    request<{ ok: boolean }>('/history', {
      method: 'POST',
      body: JSON.stringify({ type, detail, meta }),
    }),

  adminStats: () => request<{ stats: AdminStats }>('/admin/stats'),

  adminUsers: () => request<{ users: AdminUserRow[] }>('/admin/users'),

  adminUserHistory: (id: string) =>
    request<{ user: ApiUser; progress: ProgressPayload; history: HistoryEvent[] }>(
      `/admin/users/${id}/history`,
    ),

  adminPatchUser: (id: string, body: { active?: boolean; role?: 'user' | 'admin' }) =>
    request<{ user: ApiUser }>(`/admin/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
};

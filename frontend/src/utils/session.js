export const SESSION_COOKIE_NAME = 'session_id';
export const SESSION_META_KEY = 'nexus-session-meta';
export const ACTIVITY_KEY = 'nexus-connect-last-activity';
export const LOGOUT_EVENT_KEY = 'nexus-connect-auth-logout';
const SUPABASE_STORAGE_KEY = 'nexus-connect-auth';
const SESSION_COOKIE_MAX_AGE = 60 * 60; // 1 heure

const isSecureContext = () => {
  if (typeof window === 'undefined') return false;
  return window.location.protocol === 'https:' || window.location.hostname === 'localhost';
};

const encodeCookieValue = (data) => {
  try {
    const json = JSON.stringify(data);
    return btoa(encodeURIComponent(json));
  } catch (error) {
    console.warn('⚠️ [SESSION] Erreur lors de l’encodage du cookie de session:', error);
    return '';
  }
};

const decodeCookieValue = (value) => {
  try {
    const decoded = decodeURIComponent(atob(value));
    return JSON.parse(decoded);
  } catch (error) {
    return null;
  }
};

const writeSessionCookie = (data) => {
  if (typeof document === 'undefined') return;
  const encoded = encodeCookieValue(data);
  const secureFlag = isSecureContext() ? 'Secure;' : '';
  document.cookie = `${SESSION_COOKIE_NAME}=${encoded}; Max-Age=${SESSION_COOKIE_MAX_AGE}; Path=/; ${secureFlag} SameSite=Strict`;
};

export const readSessionCookie = () => {
  if (typeof document === 'undefined') return null;
  const cookies = document.cookie ? document.cookie.split('; ') : [];
  for (const cookie of cookies) {
    const [name, value] = cookie.split('=');
    if (name === SESSION_COOKIE_NAME) {
      return decodeCookieValue(value);
    }
  }
  return null;
};

const persistSessionMeta = (data) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(SESSION_META_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('⚠️ [SESSION] Impossible de stocker la meta session:', error);
  }
};

export const generateSessionId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `session_${Math.random().toString(36).slice(2)}${Date.now()}`;
};

export const createSession = (userId) => {
  const now = new Date().toISOString();
  const session = {
    session_id: generateSessionId(),
    user_id: userId || null,
    created_at: now,
    last_activity: now,
  };
  writeSessionCookie(session);
  persistSessionMeta(session);
  return session;
};

export const ensureSession = (userId) => {
  const existing = readSessionCookie();
  if (!existing || (userId && existing.user_id !== userId)) {
    return createSession(userId);
  }
  return existing;
};

export const updateSessionActivity = (timestamp) => {
  const session = readSessionCookie();
  if (!session) {
    return null;
  }
  const nextTimestamp = timestamp ? new Date(timestamp).toISOString() : new Date().toISOString();
  session.last_activity = nextTimestamp;
  writeSessionCookie(session);
  persistSessionMeta(session);
  return session;
};

export const clearSession = () => {
  if (typeof document !== 'undefined') {
    document.cookie = `${SESSION_COOKIE_NAME}=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/; SameSite=Strict`;
  }
  if (typeof window !== 'undefined') {
    [SESSION_META_KEY, ACTIVITY_KEY, LOGOUT_EVENT_KEY, SUPABASE_STORAGE_KEY].forEach((key) => {
      try {
        window.localStorage.removeItem(key);
      } catch (error) {
        console.warn(`⚠️ [SESSION] Impossible de supprimer la clé ${key}:`, error);
      }
    });
  }
};

export const hasValidSession = () => {
  const session = readSessionCookie();
  return Boolean(session?.session_id);
};

export const getSessionMeta = () => {
  if (typeof window === 'undefined') return null;
  try {
    const stored = window.localStorage.getItem(SESSION_META_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    return null;
  }
};

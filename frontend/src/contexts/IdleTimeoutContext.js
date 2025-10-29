// Section : Importations nécessaires
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import {
  updateSessionActivity,
  hasValidSession,
  clearSession as clearSessionCookie,
  readSessionCookie,
  ACTIVITY_KEY,
  LOGOUT_EVENT_KEY,
} from '@/utils/session';

// Section : Logique métier et structure du module
const IdleTimeoutContext = createContext({
  resetIdleTimer: () => {},
});

const DEFAULT_IDLE_MINUTES =
  Number(process.env.REACT_APP_IDLE_TIMEOUT_MINUTES ??
    process.env.NEXT_PUBLIC_SESSION_IDLE_MINUTES ??
    5) || 5;
const DEFAULT_WARNING_SECONDS =
  Number(process.env.REACT_APP_IDLE_WARNING_SECONDS ??
    process.env.NEXT_PUBLIC_IDLE_WARNING_SECONDS ??
    60) || 60;

const clampNumber = (value, min) => (Number.isFinite(value) && value > min ? value : min);

const IdleWarningModal = ({ visible, secondsRemaining, onStayConnected }) => {
  if (!visible) {
    return null;
  }

  const content = (
    <div
      role="alertdialog"
      aria-live="assertive"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4"
    >
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
        <div className="flex items-center gap-3 text-red-600 mb-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-semibold">
            Inactivité détectée
          </h2>
        </div>
        <p className="text-charbon mb-4">
          Aucun mouvement n'a été détecté. Pour votre sécurité, vous serez déconnecté dans{' '}
          <span className="font-bold">{secondsRemaining}</span> seconde
          {secondsRemaining > 1 ? 's' : ''}.
        </p>
        <Button
          onClick={onStayConnected}
          className="w-full bg-vert-emeraude hover:bg-vert-emeraude/90"
        >
          Rester connecté
        </Button>
      </div>
    </div>
  );

  return createPortal(content, document.body);
};

export const IdleTimeoutProvider = ({ children }) => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const idleMinutes = clampNumber(DEFAULT_IDLE_MINUTES, 1);
  const warningSeconds = clampNumber(DEFAULT_WARNING_SECONDS, 5);
  const idleDurationMs = idleMinutes * 60 * 1000;
  const warningDurationMs = Math.min(warningSeconds * 1000, idleDurationMs);

  const [warningVisible, setWarningVisible] = useState(false);
  const [countdown, setCountdown] = useState(warningSeconds);

  const deadlineRef = useRef(Date.now() + idleDurationMs);
  const warningTimeoutRef = useRef(null);
  const logoutTimeoutRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const fetchPatchedRef = useRef(false);
  const fetchOriginalRef = useRef(null);
  const axiosInterceptorRef = useRef(null);
  const isSyncingActivityRef = useRef(false);

  const clearCountdownInterval = useCallback(() => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, []);

  const hideWarning = useCallback(() => {
    clearCountdownInterval();
    setWarningVisible(false);
    setCountdown(warningSeconds);
  }, [clearCountdownInterval, warningSeconds]);

  const clearScheduledTimeouts = useCallback(() => {
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
      warningTimeoutRef.current = null;
    }
    if (logoutTimeoutRef.current) {
      clearTimeout(logoutTimeoutRef.current);
      logoutTimeoutRef.current = null;
    }
  }, []);

  const persistActivity = useCallback((timestamp) => {
    try {
      window.localStorage.setItem(
        ACTIVITY_KEY,
        JSON.stringify({ ts: timestamp })
      );
    } catch (error) {
      console.warn('⚠️ [IDLE] Failed to persist activity timestamp:', error);
    }
    updateSessionActivity(timestamp);
  }, []);

  const startWarningCountdown = useCallback(() => {
    setWarningVisible(true);
    const updateCountdown = () => {
      const remainingMs = Math.max(0, deadlineRef.current - Date.now());
      const secondsLeft = Math.max(0, Math.ceil(remainingMs / 1000));
      setCountdown(secondsLeft);
      if (secondsLeft === 0) {
        clearCountdownInterval();
      }
    };

    updateCountdown();
    clearCountdownInterval();
    countdownIntervalRef.current = window.setInterval(updateCountdown, 1000);
  }, [clearCountdownInterval]);

  const handleLocalLogout = useCallback(async (reason = 'idle_timeout') => {
    if (!isAuthenticated) {
      return;
    }

    clearScheduledTimeouts();
    hideWarning();

    await logout(reason);
    clearSessionCookie();

    switch (reason) {
      case 'idle_timeout':
      case 'session_expired':
      case 'manual':
      default:
        navigate('/', { replace: true });
        break;
    }
  }, [clearScheduledTimeouts, hideWarning, isAuthenticated, logout, navigate]);

  const scheduleTimersFromDeadline = useCallback(() => {
    clearScheduledTimeouts();

    const remainingMs = Math.max(0, deadlineRef.current - Date.now());

    if (remainingMs <= 0) {
      handleLocalLogout('idle_timeout');
      return;
    }

    if (warningDurationMs >= remainingMs) {
      startWarningCountdown();
    } else if (warningDurationMs > 0) {
      warningTimeoutRef.current = window.setTimeout(() => {
        startWarningCountdown();
      }, remainingMs - warningDurationMs);
    }

    logoutTimeoutRef.current = window.setTimeout(() => {
      handleLocalLogout('idle_timeout');
    }, remainingMs);
  }, [clearScheduledTimeouts, handleLocalLogout, startWarningCountdown, warningDurationMs]);

  const resetIdleTimer = useCallback(
    (origin = 'activity', { broadcast = true, activityTs } = {}) => {
      if (!isAuthenticated) {
        return;
      }

      const referenceTimestamp = activityTs ?? Date.now();
      deadlineRef.current = referenceTimestamp + idleDurationMs;

      if (deadlineRef.current <= Date.now()) {
        handleLocalLogout('idle_timeout');
        return;
      }

      hideWarning();
      scheduleTimersFromDeadline();

      if (broadcast) {
        persistActivity(referenceTimestamp);
      } else {
        updateSessionActivity(referenceTimestamp);
      }
    },
    [
      handleLocalLogout,
      hideWarning,
      idleDurationMs,
      isAuthenticated,
      persistActivity,
      scheduleTimersFromDeadline,
    ]
  );

  const handleStorageEvent = useCallback(
    (event) => {
      if (event.key === ACTIVITY_KEY && event.newValue) {
        try {
          const payload = JSON.parse(event.newValue);
          if (payload?.ts && !isSyncingActivityRef.current) {
            isSyncingActivityRef.current = true;
            resetIdleTimer('storage', { broadcast: false, activityTs: payload.ts });
            isSyncingActivityRef.current = false;
          }
        } catch (error) {
          console.warn('⚠️ [IDLE] Failed to parse activity broadcast:', error);
        }
      }
    },
    [idleDurationMs, resetIdleTimer]
  );

  const attachNetworkListeners = useCallback(() => {
    if (axiosInterceptorRef.current === null) {
      axiosInterceptorRef.current = axios.interceptors.request.use(
        (config) => {
          resetIdleTimer('network');
          return config;
        },
        (error) => Promise.reject(error)
      );
    }

    if (!fetchPatchedRef.current && typeof window !== 'undefined' && typeof window.fetch === 'function') {
      fetchOriginalRef.current = window.fetch.bind(window);
      window.fetch = async (...args) => {
        resetIdleTimer('network');
        return fetchOriginalRef.current(...args);
      };
      fetchPatchedRef.current = true;
    }
  }, [resetIdleTimer]);

  const detachNetworkListeners = useCallback(() => {
    if (axiosInterceptorRef.current !== null) {
      axios.interceptors.request.eject(axiosInterceptorRef.current);
      axiosInterceptorRef.current = null;
    }
    if (fetchPatchedRef.current && typeof window !== 'undefined' && fetchOriginalRef.current) {
      window.fetch = fetchOriginalRef.current;
      fetchOriginalRef.current = null;
      fetchPatchedRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      clearScheduledTimeouts();
      hideWarning();
      detachNetworkListeners();
      return;
    }

    if (!hasValidSession()) {
      handleLocalLogout('session_expired');
      return;
    }

    const sessionData = readSessionCookie();
    const lastActivityTs = sessionData?.last_activity
      ? new Date(sessionData.last_activity).getTime()
      : null;
    if (lastActivityTs) {
      const inactivityDuration = Date.now() - lastActivityTs;
      if (inactivityDuration >= idleDurationMs) {
        handleLocalLogout('idle_timeout');
        return;
      }
      resetIdleTimer('init', { activityTs: lastActivityTs });
    } else {
      resetIdleTimer('init');
    }
    attachNetworkListeners();

    const userEvents = [
      'mousemove',
      'mousedown',
      'keydown',
      'touchstart',
      'scroll',
    ];

    const activityHandler = () => resetIdleTimer('activity');
    const visibilityHandler = () => {
      if (document.visibilityState === 'visible') {
        resetIdleTimer('visibility');
      }
    };

    userEvents.forEach((eventName) => window.addEventListener(eventName, activityHandler, { passive: true }));
    document.addEventListener('visibilitychange', visibilityHandler);
    window.addEventListener('storage', handleStorageEvent);

    return () => {
      userEvents.forEach((eventName) => window.removeEventListener(eventName, activityHandler));
      document.removeEventListener('visibilitychange', visibilityHandler);
      window.removeEventListener('storage', handleStorageEvent);
      clearScheduledTimeouts();
      hideWarning();
      detachNetworkListeners();
    };
  }, [
    attachNetworkListeners,
    clearScheduledTimeouts,
    detachNetworkListeners,
    handleStorageEvent,
    handleLocalLogout,
    hideWarning,
    isAuthenticated,
    idleDurationMs,
    resetIdleTimer,
  ]);

  useEffect(() => {
    if (!isAuthenticated) {
      return undefined;
    }

    const unloadHandler = () => {
      persistActivity(Date.now());
    };

    window.addEventListener('beforeunload', unloadHandler);
    return () => window.removeEventListener('beforeunload', unloadHandler);
  }, [isAuthenticated, persistActivity]);

  useEffect(() => {
    const storageListener = (event) => {
      if (event.key === LOGOUT_EVENT_KEY && event.newValue) {
        try {
          const payload = JSON.parse(event.newValue);
          clearScheduledTimeouts();
          hideWarning();
          clearSessionCookie();
          navigate('/', { replace: true });
        } catch (error) {
          console.warn('⚠️ [IDLE] Failed to parse logout broadcast:', error);
        }
      }
    };

    window.addEventListener('storage', storageListener);
    return () => window.removeEventListener('storage', storageListener);
  }, [clearScheduledTimeouts, hideWarning, navigate]);

  const value = useMemo(
    () => ({
      resetIdleTimer,
      warningVisible,
      countdown,
    }),
    [countdown, resetIdleTimer, warningVisible]
  );

  return (
    <IdleTimeoutContext.Provider value={value}>
      {children}
      <IdleWarningModal
        visible={warningVisible}
        secondsRemaining={countdown}
        onStayConnected={() => resetIdleTimer('stay-connected')}
      />
    </IdleTimeoutContext.Provider>
  );
};

export const useIdleTimeout = () => {
  const context = useContext(IdleTimeoutContext);
  if (!context) {
    throw new Error('useIdleTimeout must be used within an IdleTimeoutProvider');
  }
  return context;
};

// ──────────────────────────────────
// Hop-Syder Développeur
// Full Stack & Data Scientist Nexus Partners
// 📧 daoudaabassichristian@gmail.com
// 📱 +229 0196701733
// 🌐 nexuspartners.xyz
// ──────────────────────────────────

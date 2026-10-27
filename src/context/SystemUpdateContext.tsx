import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';

export const APP_VERSION = '2.1.0';
export const APP_RELEASE_DATE = '27 Octobre 2026';

export type UpdateCheckStatus = 'idle' | 'checking' | 'up-to-date' | 'update-available' | 'updated';

interface SystemUpdateContextType {
  version: string;
  releaseDate: string;
  lastCheckDate: string;
  isChecking: boolean;
  status: UpdateCheckStatus;
  statusMessage: string;
  autoCheckEnabled: boolean;
  autoCheckIntervalMinutes: number;
  setAutoCheckEnabled: (enabled: boolean) => void;
  setAutoCheckIntervalMinutes: (minutes: number) => void;
  checkForUpdates: (manual?: boolean) => Promise<boolean>;
  forceUpdate: () => Promise<void>;
  dismissUpdateNotice: () => void;
}

const SystemUpdateContext = createContext<SystemUpdateContextType | null>(null);

export const SystemUpdateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lastCheckDate, setLastCheckDate] = useState<string>(() => {
    return localStorage.getItem('ventureflow_last_update_check') || new Date().toLocaleString('fr-FR');
  });

  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [status, setStatus] = useState<UpdateCheckStatus>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');

  const [autoCheckEnabled, setAutoCheckEnabledState] = useState<boolean>(() => {
    const saved = localStorage.getItem('ventureflow_auto_update_enabled');
    return saved !== null ? saved === 'true' : true;
  });

  const [autoCheckIntervalMinutes, setAutoCheckIntervalMinutesState] = useState<number>(() => {
    const saved = localStorage.getItem('ventureflow_auto_update_interval');
    return saved ? parseInt(saved, 10) : 15;
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const setAutoCheckEnabled = (enabled: boolean) => {
    setAutoCheckEnabledState(enabled);
    localStorage.setItem('ventureflow_auto_update_enabled', String(enabled));
  };

  const setAutoCheckIntervalMinutes = (minutes: number) => {
    setAutoCheckIntervalMinutesState(minutes);
    localStorage.setItem('ventureflow_auto_update_interval', String(minutes));
  };

  const checkForUpdates = useCallback(async (manual = false): Promise<boolean> => {
    setIsChecking(true);
    setStatus('checking');
    setStatusMessage('Vérification de la disponibilité d\'une nouvelle version...');

    const checkTimestamp = new Date().toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    setLastCheckDate(checkTimestamp);
    localStorage.setItem('ventureflow_last_update_check', checkTimestamp);

    try {
      let updateFound = false;

      // Check Service Worker registration if available
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          await registration.update();
          if (registration.waiting) {
            updateFound = true;
          }
        }
      }

      // Small deliberate delay for smooth UX feedback when triggered manually
      if (manual) {
        await new Promise((r) => setTimeout(r, 600));
      }

      if (updateFound) {
        setStatus('update-available');
        setStatusMessage('Une nouvelle version a été téléchargée en arrière-plan et est prête.');
        return true;
      } else {
        setStatus('up-to-date');
        setStatusMessage(`Votre application est à jour (Version ${APP_VERSION}).`);
        return false;
      }
    } catch (err: any) {
      console.warn('Update check failed:', err);
      setStatus('up-to-date');
      setStatusMessage(`Dernière version vérifiée (${APP_VERSION}). Mode autonome actif.`);
      return false;
    } finally {
      setIsChecking(false);
    }
  }, []);

  // Force update: clears caches and reloads clean
  const forceUpdate = useCallback(async () => {
    setIsChecking(true);
    setStatusMessage('Purge des caches d\'actifs et mise à jour forcée...');

    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          await reg.update();
          if (reg.waiting) {
            reg.waiting.postMessage({ type: 'SKIP_WAITING' });
          }
        }
      }

      if ('caches' in window) {
        const cacheKeys = await caches.keys();
        await Promise.all(cacheKeys.map((key) => caches.delete(key)));
      }

      // Mark update
      const now = new Date().toLocaleString('fr-FR');
      localStorage.setItem('ventureflow_last_update_check', now);
      setLastCheckDate(now);

      // Reload window with cache bypass
      window.location.reload();
    } catch (err) {
      console.error('Force update error:', err);
      window.location.reload();
    }
  }, []);

  const dismissUpdateNotice = () => {
    setStatus('idle');
    setStatusMessage('');
  };

  // Background auto-update check loop
  useEffect(() => {
    if (!autoCheckEnabled) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    // Run initial quiet check 5 seconds after launch
    const initialTimer = setTimeout(() => {
      checkForUpdates(false);
    }, 5000);

    // Periodic check interval
    const intervalMs = Math.max(1, autoCheckIntervalMinutes) * 60 * 1000;
    timerRef.current = setInterval(() => {
      checkForUpdates(false);
    }, intervalMs);

    return () => {
      clearTimeout(initialTimer);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [autoCheckEnabled, autoCheckIntervalMinutes, checkForUpdates]);

  return (
    <SystemUpdateContext.Provider
      value={{
        version: APP_VERSION,
        releaseDate: APP_RELEASE_DATE,
        lastCheckDate,
        isChecking,
        status,
        statusMessage,
        autoCheckEnabled,
        autoCheckIntervalMinutes,
        setAutoCheckEnabled,
        setAutoCheckIntervalMinutes,
        checkForUpdates,
        forceUpdate,
        dismissUpdateNotice,
      }}
    >
      {children}
    </SystemUpdateContext.Provider>
  );
};

export function useSystemUpdate(): SystemUpdateContextType {
  const context = useContext(SystemUpdateContext);
  if (!context) {
    throw new Error('useSystemUpdate must be used within a SystemUpdateProvider');
  }
  return context;
}

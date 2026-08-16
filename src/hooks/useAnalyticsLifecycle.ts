import {
  AnalyticsEvent,
  flushAnalytics,
  initAnalytics,
  track,
} from '@/lib/analytics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

const FIRST_OPEN_KEY = '@dr/first_open_recorded';

/**
 * Starts the analytics pipeline and records app-level lifecycle events.
 *
 * Mounted once, at the root. Everything it emits happens before the user has
 * an account, which is why it cannot be deferred to a screen inside the
 * authenticated app: `app_first_open` is the denominator of the entire
 * acquisition funnel, and there is nowhere later to observe it.
 */
export const useAnalyticsLifecycle = (): void => {
  useEffect(() => {
    let cancelled = false;

    const start = async () => {
      await initAnalytics();
      if (cancelled) return;

      // Fires exactly once per install. Guarded by a persisted flag rather
      // than inferred from "no user yet", which would re-fire on every launch
      // until signup and multiply the top of the funnel by however many times
      // someone opened the app while deciding.
      try {
        const recorded = await AsyncStorage.getItem(FIRST_OPEN_KEY);
        if (!recorded && !cancelled) {
          track(AnalyticsEvent.AppFirstOpen);
          void AsyncStorage.setItem(FIRST_OPEN_KEY, '1').catch(() => {});
        }
      } catch {
        // Storage unavailable — skip rather than risk emitting first_open on
        // every launch, which would be worse than missing it.
      }

      if (!cancelled) track(AnalyticsEvent.AppSessionStarted);
    };

    void start();

    return () => {
      cancelled = true;
    };
  }, []);

  // Flush when the app backgrounds. This is the highest-value flush point:
  // the user is leaving, the OS may suspend or kill the process, and anything
  // still queued waits until the next launch — or is lost if they uninstall.
  useEffect(() => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === 'background' || nextState === 'inactive') {
        void flushAnalytics();
      }
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );
    return () => subscription.remove();
  }, []);
};

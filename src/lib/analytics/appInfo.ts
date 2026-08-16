import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Application from 'expo-application';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Identity and build metadata attached to every request and every analytics
 * event.
 *
 * These are the dimensions that make production data answerable — "did the
 * error rate move with the build we shipped Tuesday?", "is the funnel worse on
 * Android?" — and they cannot be backfilled. A build that ships without them
 * produces a cohort that is permanently unsegmentable, which is why this is
 * wired up before the events that use it.
 */

const ANONYMOUS_ID_KEY = '@dr/anonymous_id';

/**
 * A stable per-install identifier, generated on first launch.
 *
 * This is what makes the top of the funnel measurable at all. First app open,
 * signup started, and paywall viewed all happen before a user_id exists, so
 * without an install id those events cannot be tied to the signup they lead
 * to, and the largest drop-off in the funnel stays invisible.
 *
 * Random and local: it is not derived from any device identifier, so it
 * identifies an install and nothing else, and reinstalling produces a new one.
 */
let cachedAnonymousId: string | null = null;

const randomId = (): string => {
  // Not cryptographic — this only needs to avoid collisions across installs,
  // and a UUID-shaped random string does that. Deliberately avoids a native
  // crypto dependency for something the server never trusts anyway.
  const hex = '0123456789abcdef';
  let out = '';
  for (let i = 0; i < 32; i += 1) {
    out += hex[Math.floor(Math.random() * 16)];
    if (i === 7 || i === 11 || i === 15 || i === 19) out += '-';
  }
  return out;
};

export const getAnonymousId = async (): Promise<string> => {
  if (cachedAnonymousId) return cachedAnonymousId;

  try {
    const stored = await AsyncStorage.getItem(ANONYMOUS_ID_KEY);
    if (stored) {
      cachedAnonymousId = stored;
      return stored;
    }
  } catch {
    // Storage unavailable. Fall through and use an in-memory id: analytics
    // degrading to per-session attribution is acceptable, blocking app start
    // over it is not.
  }

  const generated = randomId();
  cachedAnonymousId = generated;
  void AsyncStorage.setItem(ANONYMOUS_ID_KEY, generated).catch(() => {});
  return generated;
};

/**
 * Synchronous accessor for the cached install id.
 *
 * Returns null before {@link getAnonymousId} has resolved once. Request
 * headers use this because header preparation is synchronous and must not be
 * made async — an event missing anonymous_id for the first moments of a cold
 * start is a far smaller cost than adding an await to every API call.
 */
export const peekAnonymousId = (): string | null => cachedAnonymousId;

/**
 * A per-launch session identifier. Regenerated on each cold start, which is
 * what makes "sessions" countable and lets a funnel be scoped to one sitting.
 */
export const sessionId = randomId();

/**
 * Version and build read from the installed binary, not from app config.
 *
 * This project sets `appVersionSource: "remote"` with `autoIncrement: true` in
 * eas.json, so EAS owns the build number: it increments on EAS servers and is
 * injected into the native project at build time. It is deliberately never
 * written back to app.json.
 *
 * That makes `Constants.expoConfig.ios.buildNumber` permanently undefined —
 * not "unset until someone fills it in", but absent by design. Reading it
 * would report the same placeholder for every build ever shipped, which is
 * exactly the failure this field exists to prevent: no way to tell which
 * release an error spike came from.
 *
 * `expo-application` reads CFBundleShortVersionString / CFBundleVersion (and
 * the Android equivalents) straight from the shipped binary, so it reports
 * what actually installed regardless of how versioning is managed.
 *
 * Constants remains the fallback for Expo Go and dev clients, where there is
 * no native bundle to read.
 */
export const appVersion: string =
  Application.nativeApplicationVersion ??
  Constants.expoConfig?.version ??
  '0.0.0';

export const buildNumber: string = Application.nativeBuildVersion ?? '0';

export const platform: string = Platform.OS;

/**
 * Headers sent on every API request.
 *
 * Attached at the transport layer rather than per-call so no endpoint can be
 * forgotten — the server stamps them onto the access log and every product
 * event, so a gap here is a gap in every dashboard downstream.
 */
export const clientHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    'X-Platform': platform,
    'X-App-Version': appVersion,
    'X-App-Build': buildNumber,
    'X-Session-ID': sessionId,
  };
  const anonymousId = peekAnonymousId();
  if (anonymousId) headers['X-Anonymous-ID'] = anonymousId;
  return headers;
};

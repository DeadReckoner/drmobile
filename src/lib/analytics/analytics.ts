import { Env } from '@/constants/Env';
import { supabaseClient } from '@/lib/supabase/supabaseClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { clientHeaders, getAnonymousId } from './appInfo';
import { AnalyticsEventName, AnalyticsProperties } from './events';

/**
 * Client-side product analytics.
 *
 * Three rules drive the design, in this order:
 *
 *  1. Never block or break the user's action. Every path here swallows its
 *     errors. A failed metric must never surface as a failed interaction.
 *  2. Never lose the top of the funnel. Events are queued to disk and flushed
 *     in batches, so app-open and signup-start survive a cold start on a
 *     subway with no signal — which is exactly when they happen.
 *  3. Never double-count. Each event carries a client-generated `event_id`;
 *     the server dedupes on it, so retrying a batch is safe and the queue can
 *     retry freely rather than choosing between loss and inflation.
 */

const QUEUE_KEY = '@dr/analytics_queue';
const MAX_QUEUE_SIZE = 500;
const BATCH_SIZE = 100;
const FLUSH_INTERVAL_MS = 30_000;

type QueuedEvent = {
  event_id: string;
  event_name: AnalyticsEventName;
  occurred_at: string;
  properties?: AnalyticsProperties;
};

let queue: QueuedEvent[] = [];
let flushTimer: ReturnType<typeof setInterval> | null = null;
let persistTimer: ReturnType<typeof setTimeout> | null = null;
let flushing = false;
let initialized = false;

const newEventId = (): string => {
  const hex = '0123456789abcdef';
  let out = '';
  for (let i = 0; i < 32; i += 1) {
    out += hex[Math.floor(Math.random() * 16)];
    if (i === 7 || i === 11 || i === 15 || i === 19) out += '-';
  }
  return out;
};

const persist = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch {
    // Disk full or storage unavailable. The in-memory queue still flushes
    // this session; losing durability is strictly better than throwing.
  }
};

/**
 * Coalesces queue writes.
 *
 * Persisting synchronously on every `track` is fine while the queue drains,
 * but it degrades badly in exactly the situation durability is for: if the
 * server is unreachable the queue sits at its cap, and every subsequent event
 * would re-serialize the entire backlog to disk. Debouncing bounds that to one
 * write per second regardless of event rate or backlog size.
 *
 * The window is short enough that a crash loses at most a second of events,
 * and `flushAnalytics` persists immediately after each accepted batch, so the
 * "already delivered" state is never the thing left unwritten.
 */
const schedulePersist = (): void => {
  if (persistTimer) return;
  persistTimer = setTimeout(() => {
    persistTimer = null;
    void persist();
  }, 1000);
};

const restore = async (): Promise<void> => {
  try {
    const stored = await AsyncStorage.getItem(QUEUE_KEY);
    if (!stored) return;
    const parsed: unknown = JSON.parse(stored);
    if (Array.isArray(parsed)) {
      queue = parsed.slice(-MAX_QUEUE_SIZE) as QueuedEvent[];
    }
  } catch {
    // A corrupt queue must not wedge analytics forever. Drop it and move on.
    queue = [];
  }
};

/**
 * Sends one batch. Returns true when the server accepted it.
 *
 * Auth is attached when a session exists but is not required: the endpoint
 * accepts anonymous events precisely so pre-signup funnel steps can be
 * recorded, and the server attributes them to the install id instead.
 */
const postBatch = async (batch: QueuedEvent[]): Promise<boolean> => {
  try {
    const { data } = await supabaseClient.auth.getSession();
    const token = data.session?.access_token;

    const response = await fetch(`${Env.EXPO_PUBLIC_API_URL}/api/v1/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...clientHeaders(),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ events: batch }),
    });

    return response.ok;
  } catch {
    return false;
  }
};

/**
 * Drains the queue in batches.
 *
 * Events are only removed once the server has accepted them, so a failed
 * flush leaves them queued for the next attempt rather than discarding them.
 * The `flushing` guard prevents a slow network from starting overlapping
 * drains that would send the same events twice — harmless thanks to
 * server-side dedupe, but wasteful on a metered connection.
 */
export const flushAnalytics = async (): Promise<void> => {
  if (flushing || queue.length === 0) return;
  flushing = true;

  try {
    while (queue.length > 0) {
      const batch = queue.slice(0, BATCH_SIZE);
      const ok = await postBatch(batch);
      if (!ok) break;

      queue = queue.slice(batch.length);
      await persist();
    }
  } finally {
    flushing = false;
  }
};

/**
 * Records an event. Fire-and-forget: callers never await it and it never
 * throws.
 */
export const track = (
  event: AnalyticsEventName,
  properties?: AnalyticsProperties,
): void => {
  try {
    queue.push({
      event_id: newEventId(),
      event_name: event,
      occurred_at: new Date().toISOString(),
      properties,
    });

    // Bound the queue so a long offline stretch cannot grow it without limit.
    // The oldest events are dropped first: recent behavior is more useful than
    // a week-old session, and the alternative is an unbounded write to disk.
    if (queue.length > MAX_QUEUE_SIZE) {
      queue = queue.slice(-MAX_QUEUE_SIZE);
    }

    schedulePersist();
  } catch {
    // Never let instrumentation break a screen.
  }
};

/**
 * Starts the analytics pipeline. Call once, at app start.
 *
 * Restores anything queued from previous sessions before the first flush, so
 * events captured while offline are delivered rather than overwritten.
 */
export const initAnalytics = async (): Promise<void> => {
  if (initialized) return;
  initialized = true;

  await getAnonymousId();
  await restore();

  if (!flushTimer) {
    flushTimer = setInterval(() => {
      void flushAnalytics();
    }, FLUSH_INTERVAL_MS);
  }

  void flushAnalytics();
};

/** Stops the flush timer. For teardown in tests. */
export const stopAnalytics = (): void => {
  if (flushTimer) {
    clearInterval(flushTimer);
    flushTimer = null;
  }
  if (persistTimer) {
    clearTimeout(persistTimer);
    persistTimer = null;
    void persist();
  }
  initialized = false;
};

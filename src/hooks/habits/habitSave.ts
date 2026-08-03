import { CreateHabitRequestType } from '@/store/apis/types/habitsApi.types';

/**
 * Saving a recurring item is two operations, not one: the habit itself, then
 * its step definitions (which cannot be sent with the habit on create, because
 * there is no habit id to attach them to until it exists).
 *
 * That makes three outcomes possible, and the UI has to tell them apart:
 *
 *   ok                    habit saved, steps saved
 *   failure stage:'habit' nothing was written
 *   failure stage:'steps' the habit EXISTS but its steps did not save
 *
 * The third is the dangerous one. Reporting it as plain failure invites the
 * user to press Save again, which would create a second habit. So the created
 * id is handed back with the failure, and a retry that supplies it skips
 * creation and only re-syncs the steps.
 *
 * This module is deliberately free of React and RTK Query so the failure paths
 * can be tested directly.
 */

export type HabitSaveFailure =
  | { stage: 'habit'; error: unknown }
  | { stage: 'steps'; error: unknown; habitId: string };

export type HabitSaveResult =
  | { ok: true; habitId: string }
  | { ok: false; failure: HabitSaveFailure };

export interface HabitSaveDeps {
  createHabit: (
    _payload: CreateHabitRequestType,
  ) => Promise<{ habit_id?: string } | undefined>;
  updateHabit: (
    _habitId: string,
    _payload: CreateHabitRequestType,
  ) => Promise<unknown>;
  /** Absent when the item has no steps; the stepless path stays a single call. */
  syncSteps?: (_habitId: string) => Promise<void>;
}

export interface HabitSaveInput {
  mode: 'create' | 'edit';
  payload: CreateHabitRequestType;
  /** Target habit when editing. */
  habitId?: string;
  /**
   * Set when a previous attempt already created the habit and only the step
   * sync failed. Skips creation so retrying cannot duplicate the habit.
   */
  alreadyCreatedHabitId?: string;
  deps: HabitSaveDeps;
}

export const runHabitSave = async ({
  mode,
  payload,
  habitId,
  alreadyCreatedHabitId,
  deps,
}: HabitSaveInput): Promise<HabitSaveResult> => {
  let targetId: string;

  if (alreadyCreatedHabitId) {
    // Recovering from a previous steps-stage failure: the habit is already
    // there, so touching the create/update endpoints again would either
    // duplicate it or issue a pointless write.
    targetId = alreadyCreatedHabitId;
  } else if (mode === 'edit') {
    if (!habitId) {
      return {
        ok: false,
        failure: { stage: 'habit', error: new Error('missing habit id') },
      };
    }
    try {
      await deps.updateHabit(habitId, payload);
    } catch (error) {
      return { ok: false, failure: { stage: 'habit', error } };
    }
    targetId = habitId;
  } else {
    try {
      const created = await deps.createHabit(payload);
      if (!created?.habit_id) {
        return {
          ok: false,
          failure: {
            stage: 'habit',
            error: new Error('create returned no habit id'),
          },
        };
      }
      targetId = created.habit_id;
    } catch (error) {
      return { ok: false, failure: { stage: 'habit', error } };
    }
  }

  if (deps.syncSteps) {
    try {
      await deps.syncSteps(targetId);
    } catch (error) {
      return {
        ok: false,
        failure: { stage: 'steps', error, habitId: targetId },
      };
    }
  }

  return { ok: true, habitId: targetId };
};

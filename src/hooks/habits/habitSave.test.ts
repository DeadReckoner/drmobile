import { runHabitSave } from '@/hooks/habits/habitSave';
import { CreateHabitRequestType } from '@/store/apis/types/habitsApi.types';

// Failure-path coverage for the two-call habit save (habit, then its step
// definitions). These are the paths that stranded a user with an indefinitely
// spinning Save button and no message: a request that never resolves, and a
// step sync that fails after the habit has already been created.

const payload: CreateHabitRequestType = {
  title: 'Morning routine',
  description: '',
  recurrence_type: 'daily',
  start_date: '2026-08-02',
};

const okCreate = (id = 'habit-1') =>
  jest.fn().mockResolvedValue({ habit_id: id });
const okUpdate = () => jest.fn().mockResolvedValue(undefined);

describe('runHabitSave', () => {
  describe('stepless items (unchanged behaviour)', () => {
    it('creates the habit and reports success with no step call', async () => {
      const createHabit = okCreate();
      const result = await runHabitSave({
        mode: 'create',
        payload,
        deps: { createHabit, updateHabit: okUpdate() },
      });

      expect(result).toEqual({ ok: true, habitId: 'habit-1' });
      expect(createHabit).toHaveBeenCalledTimes(1);
    });

    it('surfaces a create failure as a habit-stage failure', async () => {
      const error = new Error('Network request failed');
      const result = await runHabitSave({
        mode: 'create',
        payload,
        deps: {
          createHabit: jest.fn().mockRejectedValue(error),
          updateHabit: okUpdate(),
        },
      });

      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.failure.stage).toBe('habit');
      expect(result.failure.error).toBe(error);
    });

    it('treats a create that returns no id as a failure, not a success', async () => {
      const syncSteps = jest.fn();
      const result = await runHabitSave({
        mode: 'create',
        payload,
        deps: {
          createHabit: jest.fn().mockResolvedValue({}),
          updateHabit: okUpdate(),
          syncSteps,
        },
      });

      expect(result.ok).toBe(false);
      // Never attempt to attach steps to an id we do not have.
      expect(syncSteps).not.toHaveBeenCalled();
    });
  });

  describe('step sync failure', () => {
    it('is reported as a steps-stage failure, not as success', async () => {
      const error = new Error('timeout');
      const result = await runHabitSave({
        mode: 'create',
        payload,
        deps: {
          createHabit: okCreate('habit-9'),
          updateHabit: okUpdate(),
          syncSteps: jest.fn().mockRejectedValue(error),
        },
      });

      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.failure.stage).toBe('steps');
      expect(result.failure.error).toBe(error);
      // The created id must come back so the caller can recover without
      // creating a second habit.
      if (result.failure.stage !== 'steps') return;
      expect(result.failure.habitId).toBe('habit-9');
    });

    it('does not create a second habit when retried with the created id', async () => {
      const createHabit = okCreate('habit-9');
      const syncSteps = jest.fn().mockResolvedValue(undefined);

      const result = await runHabitSave({
        mode: 'create',
        payload,
        alreadyCreatedHabitId: 'habit-9',
        deps: { createHabit, updateHabit: okUpdate(), syncSteps },
      });

      expect(result).toEqual({ ok: true, habitId: 'habit-9' });
      // The whole point: creation is skipped entirely on the retry.
      expect(createHabit).not.toHaveBeenCalled();
      expect(syncSteps).toHaveBeenCalledWith('habit-9');
    });

    it('does not re-issue the update call when recovering in edit mode', async () => {
      const updateHabit = okUpdate();
      const result = await runHabitSave({
        mode: 'edit',
        habitId: 'habit-3',
        payload,
        alreadyCreatedHabitId: 'habit-3',
        deps: {
          createHabit: okCreate(),
          updateHabit,
          syncSteps: jest.fn().mockResolvedValue(undefined),
        },
      });

      expect(result.ok).toBe(true);
      expect(updateHabit).not.toHaveBeenCalled();
    });
  });

  describe('edit mode', () => {
    it('reports an update failure as a habit-stage failure and skips steps', async () => {
      const error = new Error('500');
      const syncSteps = jest.fn();
      const result = await runHabitSave({
        mode: 'edit',
        habitId: 'habit-3',
        payload,
        deps: {
          createHabit: okCreate(),
          updateHabit: jest.fn().mockRejectedValue(error),
          syncSteps,
        },
      });

      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.failure.stage).toBe('habit');
      expect(syncSteps).not.toHaveBeenCalled();
    });

    it('fails cleanly rather than creating a habit when the id is missing', async () => {
      const createHabit = okCreate();
      const result = await runHabitSave({
        mode: 'edit',
        payload,
        deps: { createHabit, updateHabit: okUpdate() },
      });

      expect(result.ok).toBe(false);
      expect(createHabit).not.toHaveBeenCalled();
    });
  });

  describe('a request that never settles', () => {
    // The observed bug: with no timeout the promise stays pending, so the
    // caller's finally block is what has to guarantee the spinner clears.
    // Here we prove runHabitSave itself stays pending (it does not resolve
    // early with a bogus success) and resolves correctly once rejected.
    it('stays pending until the underlying request settles', async () => {
      let reject: ((_e: unknown) => void) | undefined;
      const pending = new Promise((_res, rej) => {
        reject = rej;
      });

      const settled = jest.fn();
      const promise = runHabitSave({
        mode: 'create',
        payload,
        deps: {
          createHabit: jest.fn().mockReturnValue(pending),
          updateHabit: okUpdate(),
        },
      }).then(settled);

      await Promise.resolve();
      expect(settled).not.toHaveBeenCalled();

      reject?.(new Error('Aborted due to timeout'));
      await promise;

      expect(settled).toHaveBeenCalledTimes(1);
      const result = settled.mock.calls[0][0];
      expect(result.ok).toBe(false);
      expect(result.failure.stage).toBe('habit');
    });
  });
});

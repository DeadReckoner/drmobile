import {
  useCreateHabitStepMutation,
  useDeleteHabitStepMutation,
  useReorderHabitStepsMutation,
  useUpdateHabitStepMutation,
} from '@/store/apis/habitsApi';
import { HabitStepType } from '@/store/apis/types/habitsApi.types';
import { useCallback, useEffect, useState } from 'react';

/**
 * One row in the step editor.
 *
 * `habit_step_id` is the server's stable identity and is absent for rows the
 * user has just added. `key` is a purely local, stable React key so editing the
 * text of an unsaved row cannot remount it mid-keystroke.
 */
export type HabitStepDraft = {
  key: string;
  habit_step_id?: string;
  description: string;
};

let localKeySeq = 0;
const nextKey = () => `local-${++localKeySeq}`;

export const toDraft = (steps?: HabitStepType[]): HabitStepDraft[] =>
  (steps ?? [])
    .slice()
    .sort((a, b) => a.number - b.number)
    .map((s) => ({
      key: s.habit_step_id,
      habit_step_id: s.habit_step_id,
      description: s.description,
    }));

/**
 * Local editing state for a recurring item's step DEFINITIONS, plus the sync
 * that applies it to the server.
 *
 * Steps are edited locally and committed on save rather than firing a request
 * per keystroke: creation has no habit id to attach steps to until the habit
 * exists, and it keeps "add three steps then cancel" from leaving debris.
 *
 * `sync` diffs by habit_step_id, never by position, so renaming or reordering
 * can never transfer completion state from one step to another.
 */
export const useHabitStepsDraft = (initial?: HabitStepType[]) => {
  const [steps, setSteps] = useState<HabitStepDraft[]>(() => toDraft(initial));
  const [removedIds, setRemovedIds] = useState<string[]>([]);

  // Re-seed when the habit finishes loading in edit mode.
  useEffect(() => {
    if (initial && initial.length > 0) {
      setSteps(toDraft(initial));
      setRemovedIds([]);
    }
  }, [initial]);

  const addStep = useCallback(() => {
    setSteps((prev) => [...prev, { key: nextKey(), description: '' }]);
  }, []);

  const updateStep = useCallback((key: string, description: string) => {
    setSteps((prev) =>
      prev.map((s) => (s.key === key ? { ...s, description } : s)),
    );
  }, []);

  const removeStep = useCallback((key: string) => {
    setSteps((prev) => {
      const target = prev.find((s) => s.key === key);
      if (target?.habit_step_id) {
        setRemovedIds((ids) => [...ids, target.habit_step_id as string]);
      }
      return prev.filter((s) => s.key !== key);
    });
  }, []);

  const moveStep = useCallback((key: string, direction: -1 | 1) => {
    setSteps((prev) => {
      const idx = prev.findIndex((s) => s.key === key);
      const target = idx + direction;
      if (idx === -1 || target < 0 || target >= prev.length) return prev;
      const next = prev.slice();
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  }, []);

  const [createStep] = useCreateHabitStepMutation();
  const [patchStep] = useUpdateHabitStepMutation();
  const [deleteStep] = useDeleteHabitStepMutation();
  const [reorderSteps] = useReorderHabitStepsMutation();

  /**
   * Applies the local draft to `habitId`. Blank rows are dropped rather than
   * saved, so an accidentally-added empty step never becomes a step the user
   * has to check off forever.
   */
  const sync = useCallback(
    async (habitId: string) => {
      const kept = steps.filter((s) => s.description.trim().length > 0);

      for (const id of removedIds) {
        await deleteStep({ habit_id: habitId, habit_step_id: id }).unwrap();
      }

      const orderedIds: string[] = [];
      for (let i = 0; i < kept.length; i++) {
        const step = kept[i];
        const description = step.description.trim();
        if (step.habit_step_id) {
          const original = (initial ?? []).find(
            (s) => s.habit_step_id === step.habit_step_id,
          );
          if (original && original.description !== description) {
            await patchStep({
              habit_id: habitId,
              habit_step_id: step.habit_step_id,
              description,
            }).unwrap();
          }
          orderedIds.push(step.habit_step_id);
        } else {
          const created = await createStep({
            habit_id: habitId,
            description,
            number: i + 1,
          }).unwrap();
          orderedIds.push(created.habit_step_id);
        }
      }

      // One reorder call rather than N number patches, so display order can
      // never be observed half-applied.
      if (orderedIds.length > 1) {
        await reorderSteps({
          habit_id: habitId,
          step_ids: orderedIds,
        }).unwrap();
      }

      setRemovedIds([]);
    },
    [
      steps,
      removedIds,
      initial,
      createStep,
      patchStep,
      deleteStep,
      reorderSteps,
    ],
  );

  return {
    steps,
    addStep,
    updateStep,
    removeStep,
    moveStep,
    sync,
    hasSteps: steps.some((s) => s.description.trim().length > 0),
  };
};

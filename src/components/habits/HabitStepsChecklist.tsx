import { AppCard } from '@/components/AppCard';
import { Divider } from '@/components/Divider';
import { LineDivider } from '@/components/LineDivider';
import { Loader } from '@/components/Loader';
import { StepRow } from '@/components/StepRow';
import { TranslatedText } from '@/components/TranslatedText';
import { AppText, AppView } from '@/components/ui';
import { useToast } from '@/hooks/useToast';
import {
  useGetHabitOccurrenceStepsQuery,
  useSetHabitStepStateMutation,
} from '@/store/apis/habitsApi';
import { getApiErrorMessage } from '@/utils/apiErrors.utils';
import { useState } from 'react';

interface HabitStepsChecklistProps {
  habitId: string;
  /** YYYY-MM-DD. Defaults to today's occurrence server-side when omitted. */
  date?: string;
  /** Renders without toggles, for viewing a past occurrence. */
  readonly?: boolean;
  /** Notified when the parent occurrence's completed state flips. */
  onOccurrenceCompletedChange?: (_isCompleted: boolean) => void;
}

/**
 * The step checklist for ONE occurrence of a recurring habit/task.
 *
 * Renders with the same StepRow the roadmap task checklist uses, so checking a
 * step off a recurring item feels identical to checking one off a roadmap task.
 * Completion is driven entirely by the steps: the server marks the occurrence
 * complete when the last incomplete step is checked and reopens it when one is
 * unchecked, so this component never completes the parent itself.
 *
 * Renders nothing when the item has no steps -- those keep the plain
 * single-action button on the screen below.
 */
export const HabitStepsChecklist = ({
  habitId,
  date,
  readonly,
  onOccurrenceCompletedChange,
}: HabitStepsChecklistProps) => {
  const { showToast } = useToast();
  const [pendingStepId, setPendingStepId] = useState<string | null>(null);

  const {
    data: occurrence,
    isLoading,
    isError,
  } = useGetHabitOccurrenceStepsQuery({ habit_id: habitId, date });

  const [setStepState] = useSetHabitStepStateMutation();

  const onToggle = async (habitStepId: string, value: boolean) => {
    setPendingStepId(habitStepId);
    try {
      const result = await setStepState({
        habit_id: habitId,
        habit_step_id: habitStepId,
        date,
        status: value ? 'completed' : 'incomplete',
      }).unwrap();
      onOccurrenceCompletedChange?.(result.is_completed);
    } catch (error) {
      showToast({ type: 'failure', message: getApiErrorMessage(error) });
    } finally {
      setPendingStepId(null);
    }
  };

  if (isLoading) {
    return (
      <AppView paddingV-24 center>
        <Loader transparent />
      </AppView>
    );
  }

  if (isError) {
    return (
      <AppView paddingV-16 center>
        <TranslatedText
          body2
          secondary
          translationKey="common.error_occurred"
        />
      </AppView>
    );
  }

  // No steps: this item uses the plain single-action completion path.
  if (!occurrence || occurrence.steps_total === 0) {
    return null;
  }

  return (
    <AppView marginT-8>
      <AppView row centerV spread>
        <TranslatedText body1 translationKey="common.steps" />
        {/* Progress uses the same "n/total" shorthand the roadmap surfaces. */}
        <AppText body2 secondary>
          {`${occurrence.steps_completed}/${occurrence.steps_total}`}
        </AppText>
      </AppView>
      <Divider marginV-8 />
      <AppCard padding-0>
        {occurrence.steps.map((step, index) => (
          <AppView key={step.habit_step_id}>
            {index > 0 && <LineDivider marginV-0 />}
            <StepRow
              description={step.description}
              completed={step.status !== 'incomplete'}
              isUpdating={pendingStepId === step.habit_step_id}
              disabled={readonly}
              onToggle={
                readonly
                  ? undefined
                  : (value) => onToggle(step.habit_step_id, value)
              }
            />
          </AppView>
        ))}
      </AppCard>
      {!readonly && (
        <AppView marginT-8>
          <TranslatedText
            xsm
            secondary
            translationKey={
              occurrence.is_completed
                ? 'habits.steps.all_steps_done'
                : 'habits.steps.complete_all_to_finish'
            }
          />
        </AppView>
      )}
    </AppView>
  );
};

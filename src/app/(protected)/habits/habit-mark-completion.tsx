import { AppScreen } from '@/components/AppScreen';
import { Divider } from '@/components/Divider';
import { HabitStepsChecklist } from '@/components/habits/HabitStepsChecklist';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { Loader } from '@/components/Loader';
import { PrimaryButton } from '@/components/PrimaryButton';
import { TranslatedText } from '@/components/TranslatedText';
import { AppText, AppView } from '@/components/ui';
import { WeekdaySelector } from '@/components/WeekdaySelector';
import {
  shouldRenderDescription,
  shouldRenderDetails,
  shouldRenderManualCompletionButton,
} from '@/hooks/habits/occurrenceDetail';
import { useStepCompletionAutoClose } from '@/hooks/habits/useStepCompletionAutoClose';
import { useLocalization } from '@/hooks/useLocalization';
import { useToast } from '@/hooks/useToast';
import { TranslationKeysType } from '@/lib/localization/types/i18n.types';
import {
  useCompleteHabitMutation,
  useGetHabitOccurrenceStepsQuery,
  useGetHabitQuery,
  useUncompleteHabitMutation,
} from '@/store/apis/habitsApi';
import { getApiErrorMessage } from '@/utils/apiErrors.utils';
import { DateUtils } from '@/utils/date.utils';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * One occurrence of a recurring habit/task.
 *
 * Laid out as an execution surface rather than a record page: the checklist is
 * the reason the screen was opened, so it sits directly under the title with
 * the dates demoted beneath it. Everything flows top-to-bottom in a normal
 * scroll view — an earlier `spread`/`flexGrow` pairing pushed the checklist to
 * the bottom of the viewport and left a screen-height gap above it.
 */
const HabitMarkCompletion = () => {
  const { habitId, isCompleted } = useLocalSearchParams<{
    habitId: string;
    isCompleted: string;
  }>();
  const { t } = useLocalization();
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();

  const { data: habit, isLoading, error } = useGetHabitQuery(habitId);
  const [isHabitCompleted, setIsHabitCompleted] = useState(
    isCompleted === 'true',
  );

  const today = DateUtils.formatDate(DateUtils.createDate(), 'YYYY-MM-DD');
  // Whether this recurring item is step-driven. Read from the occurrence rather
  // than the template so an item whose steps were all removed falls straight
  // back to the single-action button.
  const { data: occurrence } = useGetHabitOccurrenceStepsQuery({
    habit_id: habitId,
    date: today,
  });

  // Closes the screen when the user's own toggle finishes the occurrence. Only
  // a confirmed incomplete → complete transition qualifies; see stepCompletion.
  const handleStepToggleOutcome = useStepCompletionAutoClose();

  const [completeHabit, { isLoading: isCompletingHabit }] =
    useCompleteHabitMutation();
  const [uncompleteHabit, { isLoading: isUncompletingHabit }] =
    useUncompleteHabitMutation();

  const handleToggleHabitCompletion = async () => {
    if (!habit) return;

    try {
      if (isHabitCompleted) {
        await uncompleteHabit({
          habit_id: habit.habit_id,
          date: DateUtils.formatDate(DateUtils.createDate(), 'YYYY-MM-DD'),
        }).unwrap();

        showToast({
          message: t('habits.marked_incomplete'),
          type: 'success',
        });
      } else {
        await completeHabit({
          habit_id: habit.habit_id,
          date: DateUtils.formatDate(DateUtils.createDate(), 'YYYY-MM-DD'),
        }).unwrap();

        showToast({
          message: t('habits.marked_completed_for_today'),
          type: 'success',
        });
      }
      setIsHabitCompleted(!isHabitCompleted);
      router.back();
    } catch (error) {
      showToast({
        message: getApiErrorMessage(error),
        type: 'failure',
      });
    }
  };

  if (error || (!isLoading && !habit)) {
    return (
      <AppScreen safeArea>
        <HeaderWithBack />
        <AppView flex-1 center>
          <TranslatedText translationKey="common.error_occurred" />
        </AppView>
      </AppScreen>
    );
  }

  const isProcessing = isCompletingHabit || isUncompletingHabit;

  /** One compact line of secondary detail, e.g. "Started Aug 04, 2026". */
  const detailLine = (labelKey: TranslationKeysType, value: string) => (
    <AppText body2 secondary marginT-4>
      {`${t(labelKey)} ${value}`}
    </AppText>
  );

  const isWeekly = habit?.recurrence_type === 'weekly' && !!habit.days_of_week;
  const isMonthly =
    habit?.recurrence_type === 'monthly' && !!habit.day_of_month;
  const hasDueDate = habit?.recurrence_type === 'none' && !!habit.due_date;
  const hasDetails = shouldRenderDetails({
    isWeekly,
    isMonthly,
    hasDueDate,
    hasStartDate: !!habit?.start_date,
    hasEndDate: !!habit?.end_date,
  });

  return (
    <AppScreen safeArea>
      <AppView row centerV spread>
        <HeaderWithBack />
      </AppView>
      {isLoading ? <Loader transparent /> : null}
      {habit && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          // Clears the Android gesture bar so a long checklist can be scrolled
          // fully into reach rather than ending underneath it.
          contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
          <Divider margin-12 />

          <AppView row centerV spread>
            <AppText subtitle1 textColor flex-1 marginR-16>
              {habit?.title}
            </AppText>
            <AppView row centerV>
              <AppView bg-accent paddingH-10 paddingV-4 br100>
                <AppText
                  white
                  xsm
                  regular
                  style={{ textTransform: 'capitalize' }}>
                  {habit?.recurrence_type === 'none'
                    ? t('habits.recurrence.none')
                    : habit?.recurrence_type}
                </AppText>
              </AppView>
            </AppView>
          </AppView>

          {/* Muted, directly under the title, with no heading of its own — the
              old standalone "Description" label cost more vertical space than
              the text it introduced. Absent descriptions render nothing at all,
              so there is no empty labelled block. */}
          {shouldRenderDescription(habit?.description) && (
            <AppText body2 secondary marginT-8>
              {habit.description}
            </AppText>
          )}

          <Divider />

          {/* The reason the screen was opened, so it comes first. Renders
              nothing when the item has no steps, leaving the single-action
              button below as the only completion path. */}
          <HabitStepsChecklist
            habitId={habitId}
            date={today}
            onOccurrenceCompletedChange={setIsHabitCompleted}
            onStepToggleOutcome={handleStepToggleOutcome}
          />

          {/* With steps, the final step is what completes the occurrence, so the
              manual button would be a second, conflicting path. */}
          {shouldRenderManualCompletionButton(occurrence?.steps_total) && (
            <AppView marginT-8>
              <PrimaryButton
                disabled={isProcessing}
                label={
                  isHabitCompleted
                    ? 'habits.mark_incomplete'
                    : 'habits.mark_complete'
                }
                shouldShowLoader
                isLoading={isProcessing}
                onPress={handleToggleHabitCompletion}
              />
            </AppView>
          )}

          {/* Dates and cadence detail are reference material, not the task, so
              they sit below the checklist as compact muted lines. */}
          {hasDetails && (
            <AppView marginT-24>
              <TranslatedText body1 translationKey="habits.details.label" />

              {isWeekly && (
                <AppView marginT-8>
                  <WeekdaySelector disabled value={habit.days_of_week!} />
                </AppView>
              )}

              {isMonthly &&
                detailLine(
                  'habits.details.day_of_month',
                  `${habit.day_of_month}`,
                )}

              {hasDueDate &&
                detailLine(
                  'habits.details.due',
                  DateUtils.formatDate(habit.due_date!, 'MMM DD, YYYY'),
                )}

              {!!habit?.start_date &&
                detailLine(
                  'habits.details.started',
                  DateUtils.formatDate(habit.start_date, 'MMM DD, YYYY'),
                )}

              {!!habit?.end_date &&
                detailLine(
                  'habits.details.ends',
                  DateUtils.formatDate(habit.end_date, 'MMM DD, YYYY'),
                )}
            </AppView>
          )}
        </ScrollView>
      )}
    </AppScreen>
  );
};

export default HabitMarkCompletion;

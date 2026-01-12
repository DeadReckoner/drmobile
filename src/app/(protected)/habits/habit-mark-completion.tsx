import { AppScreen } from '@/components/AppScreen';
import { Divider } from '@/components/Divider';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { Loader } from '@/components/Loader';
import { PrimaryButton } from '@/components/PrimaryButton';
import { TranslatedText } from '@/components/TranslatedText';
import { AppText, AppView } from '@/components/ui';
import { useLocalization } from '@/hooks/useLocalization';
import { useToast } from '@/hooks/useToast';
import {
  useCompleteHabitMutation,
  useGetHabitQuery,
  useUncompleteHabitMutation,
} from '@/store/apis/habitsApi';
import { getApiErrorMessage } from '@/utils/apiErrors.utils';
import { DateUtils } from '@/utils/date.utils';
import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';

const HabitMarkCompletion = () => {
  const { habitId, isCompleted } = useLocalSearchParams<{
    habitId: string;
    isCompleted: string;
  }>();
  const { t } = useLocalization();
  const { showToast } = useToast();

  const { data: habit, isLoading } = useGetHabitQuery(habitId);
  const isHabitCompleted = isCompleted === 'true';

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
    } catch (error) {
      showToast({
        message: getApiErrorMessage(error),
        type: 'failure',
      });
    }
  };

  const getRecurrenceText = () => {
    if (!habit) return '';

    switch (habit.recurrence_type) {
      case 'daily':
        return t('habits.recurrence.daily');
      case 'weekly':
        return t('habits.recurrence.weekly');
      case 'monthly':
        return t('habits.recurrence.monthly');
      default:
        return t('habits.recurrence.none');
    }
  };

  const getDaysOfWeekText = (bitmask?: number) => {
    if (!bitmask) return '';

    const days = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 0; i < 7; i++) {
      if (bitmask & (1 << i)) {
        days.push(dayNames[i]);
      }
    }

    return days.join(', ');
  };

  if (isLoading) {
    return (
      <AppScreen>
        <HeaderWithBack />
        <AppView flex-1 center>
          <Loader />
        </AppView>
      </AppScreen>
    );
  }

  if (!habit) {
    return (
      <AppScreen>
        <HeaderWithBack />
        <AppView flex-1 center>
          <TranslatedText translationKey="common.error_occurred" />
        </AppView>
      </AppScreen>
    );
  }

  const isProcessing = isCompletingHabit || isUncompletingHabit;

  return (
    <AppScreen safeArea>
      <AppView row centerV spread>
        <HeaderWithBack />
      </AppView>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}>
        <AppView spread flex-1>
          <AppView>
            <Divider margin-12 />
            <AppView row centerV spread>
              <AppText subtitle1 textColor flex-1 marginR-16>
                {habit.title}
              </AppText>
              <AppView row centerV>
                <AppView bg-primary paddingH-10 paddingV-4 br100>
                  <AppText textColor xsm regular>
                    {getRecurrenceText()}
                  </AppText>
                </AppView>
              </AppView>
            </AppView>
            <Divider />

            {habit.description && (
              <>
                <TranslatedText
                  semibold
                  translationKey="habits.description_label"
                />
                <AppText body2 textColor>
                  {habit.description}
                </AppText>
                <Divider />
              </>
            )}

            {habit.recurrence_type === 'weekly' && habit.days_of_week && (
              <>
                <TranslatedText
                  semibold
                  translationKey="habits.weekly_days_label"
                />
                <AppText body2 textColor>
                  {getDaysOfWeekText(habit.days_of_week)}
                </AppText>
                <Divider />
              </>
            )}

            {habit.recurrence_type === 'monthly' && habit.day_of_month && (
              <>
                <TranslatedText
                  semibold
                  translationKey="habits.day_of_month_label"
                />
                <AppText body2 textColor>
                  {habit.day_of_month}
                </AppText>
                <Divider />
              </>
            )}

            {habit.recurrence_type === 'none' && habit.due_date && (
              <>
                <TranslatedText
                  semibold
                  translationKey="habits.due_date_label"
                />
                <AppText body2 textColor>
                  {DateUtils.formatDate(habit.due_date, 'MMM DD, YYYY')}
                </AppText>
                <Divider />
              </>
            )}

            <TranslatedText semibold translationKey="habits.start_date_label" />
            <AppText body2 textColor>
              {DateUtils.formatDate(habit.start_date, 'MMM DD, YYYY')}
            </AppText>
            <Divider />

            {habit.end_date && (
              <>
                <TranslatedText
                  semibold
                  translationKey="habits.end_date_label"
                />
                <AppText body2 textColor>
                  {DateUtils.formatDate(habit.end_date, 'MMM DD, YYYY')}
                </AppText>
                <Divider />
              </>
            )}
          </AppView>

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
      </ScrollView>
    </AppScreen>
  );
};

export default HabitMarkCompletion;

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: 48,
    flexGrow: 1,
  },
  statusCard: {
    borderWidth: 2,
  },
});

import { AppScreen } from '@/components/AppScreen';
import { Divider } from '@/components/Divider';
import { HabitInfoItem } from '@/components/HabitInfoItem';
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
import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

const HabitMarkCompletion = () => {
  const { habitId, isCompleted } = useLocalSearchParams<{
    habitId: string;
    isCompleted: string;
  }>();
  const { t } = useLocalization();
  const { showToast } = useToast();

  const { data: habit, isLoading, error } = useGetHabitQuery(habitId);
  const [isHabitCompleted, setIsHabitCompleted] = useState(
    isCompleted === 'true',
  );

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
    } catch (error) {
      showToast({
        message: getApiErrorMessage(error),
        type: 'failure',
      });
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

  return (
    <AppScreen safeArea>
      <AppView row centerV spread>
        <HeaderWithBack />
      </AppView>
      {isLoading ? <Loader transparent /> : null}
      {habit && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}>
          <AppView spread flex-1>
            <AppView>
              <Divider margin-12 />
              <AppView row centerV spread>
                <AppText subtitle1 textColor flex-1 marginR-16>
                  {habit?.title}
                </AppText>
                <AppView row centerV>
                  <AppView bg-primary paddingH-10 paddingV-4 br100>
                    <AppText
                      textColor
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
              <Divider />

              {habit?.description && (
                <HabitInfoItem
                  translationKey="habits.description_label"
                  value={habit.description}
                />
              )}

              {habit?.recurrence_type === 'weekly' && habit?.days_of_week && (
                <HabitInfoItem
                  translationKey="habits.weekly_days_label"
                  value={getDaysOfWeekText(habit.days_of_week)}
                />
              )}

              {habit?.recurrence_type === 'monthly' && habit?.day_of_month && (
                <HabitInfoItem
                  translationKey="habits.day_of_month_label"
                  value={habit.day_of_month}
                />
              )}

              {habit?.recurrence_type === 'none' && habit?.due_date && (
                <HabitInfoItem
                  translationKey="habits.due_date_label"
                  value={DateUtils.formatDate(habit.due_date, 'MMM DD, YYYY')}
                />
              )}

              {habit?.start_date && (
                <HabitInfoItem
                  translationKey="habits.start_date_label"
                  value={DateUtils.formatDate(habit.start_date, 'MMM DD, YYYY')}
                />
              )}

              {habit?.end_date && (
                <HabitInfoItem
                  translationKey="habits.end_date_label"
                  value={DateUtils.formatDate(habit.end_date, 'MMM DD, YYYY')}
                />
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
      )}
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

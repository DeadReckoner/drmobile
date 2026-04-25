import { AppCard } from '@/components/AppCard';
import { AppScreen } from '@/components/AppScreen';
import { Divider } from '@/components/Divider';
import { HabitInfoItem } from '@/components/HabitInfoItem';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { LineDivider } from '@/components/LineDivider';
import { AppText, AppView } from '@/components/ui';
import { useLocalization } from '@/hooks/useLocalization';
import { HabitType } from '@/store/apis/types/habitsApi.types';
import { DateUtils } from '@/utils/date.utils';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_BITS = [1, 2, 4, 8, 16, 32, 64];

const ReadonlyHabitDetails = () => {
  const params = useLocalSearchParams<{ habit: string }>();
  const { t } = useLocalization();
  const [habit, setHabit] = useState<HabitType | null>(null);

  useEffect(() => {
    if (params.habit) {
      try {
        setHabit(JSON.parse(params.habit));
      } catch {}
    }
  }, [params.habit]);

  const weeklyDays = useMemo(() => {
    if (!habit?.days_of_week) return '';
    return DAY_NAMES.filter(
      (_, i) => (habit.days_of_week! & DAY_BITS[i]) !== 0,
    ).join(', ');
  }, [habit?.days_of_week]);

  if (!habit) return null;

  return (
    <AppScreen>
      <ScrollView
        contentInsetAdjustmentBehavior="always"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}>
        <AppView row spread centerV>
          <HeaderWithBack />
        </AppView>
        <Divider />
        <AppCard>
          <AppText body1 textColor>
            {habit.title}
          </AppText>
          {!!habit.description && (
            <>
              <LineDivider marginV-12 />
              <AppText captionLight textColor>
                {habit.description}
              </AppText>
            </>
          )}
        </AppCard>
        <Divider />
        <AppCard>
          <HabitInfoItem
            translationKey="habits.recurrence_label"
            value={t(`habits.recurrence.${habit.recurrence_type}`)}
          />
          {habit.recurrence_type === 'weekly' && !!weeklyDays && (
            <HabitInfoItem
              translationKey="habits.weekly_days_label"
              value={weeklyDays}
            />
          )}
          {habit.recurrence_type === 'monthly' && !!habit.day_of_month && (
            <HabitInfoItem
              translationKey="habits.day_of_month_label"
              value={String(habit.day_of_month)}
            />
          )}
          {habit.recurrence_type === 'none' && !!habit.due_date && (
            <HabitInfoItem
              translationKey="habits.due_date_label"
              value={DateUtils.formatDate(habit.due_date, 'MMM DD, YYYY')}
            />
          )}
          <HabitInfoItem
            translationKey="habits.start_date_label"
            value={DateUtils.formatDate(habit.start_date, 'MMM DD, YYYY')}
          />
          {!!habit.end_date && (
            <HabitInfoItem
              translationKey="habits.end_date_label"
              value={DateUtils.formatDate(habit.end_date, 'MMM DD, YYYY')}
            />
          )}
        </AppCard>
      </ScrollView>
    </AppScreen>
  );
};

export default ReadonlyHabitDetails;

const styles = StyleSheet.create({
  scrollContainer: { paddingBottom: 60 },
});

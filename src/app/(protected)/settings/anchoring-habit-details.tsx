import { AppCard } from '@/components/AppCard';
import { AppScreen } from '@/components/AppScreen';
import { Divider } from '@/components/Divider';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { AppText, AppView } from '@/components/ui';
import { useLocalization } from '@/hooks/useLocalization';
import { HabitType, RecurrenceType } from '@/store/apis/types/habitsApi.types';
import { consumeHabit } from '@/utils/roadmapTransfer';
import React, { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

const RECURRENCE_COLORS: Record<RecurrenceType, string> = {
  daily: '#4A90D9',
  weekly: '#7B68EE',
  monthly: '#E67E22',
  none: '#888888',
};

const AnchoringHabitDetails = () => {
  const { t } = useLocalization();

  const [habit] = useState<HabitType | null>(() => {
    return consumeHabit();
  });

  if (!habit) return null;

  return (
    <AppScreen safeArea>
      <HeaderWithBack />
      <Divider />
      <ScrollView
        contentInsetAdjustmentBehavior="always"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}>
        <AppCard>
          <AppView style={styles.card}>
            <AppView row>
              <AppText
                flex
                body1
                textColor
                numberOfLines={2}
                style={styles.title}>
                {habit.title}
              </AppText>
              <AppView
                style={[
                  styles.badge,
                  { backgroundColor: RECURRENCE_COLORS[habit.recurrence_type] },
                ]}>
                <AppText sm regular textColor>
                  {t(`habits.recurrence.${habit.recurrence_type}`)}
                </AppText>
              </AppView>
            </AppView>
            {!!habit.description && (
              <AppText
                xsm
                secondary
                numberOfLines={2}
                style={styles.description}>
                {habit.description}
              </AppText>
            )}
          </AppView>
        </AppCard>
      </ScrollView>
    </AppScreen>
  );
};

export default AnchoringHabitDetails;

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: 120,
  },
  card: {
    borderRadius: 12,
    gap: 10,
  },
  title: {
    flexShrink: 1,
  },
  description: {
    flexShrink: 1,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    alignSelf: 'flex-start',
  },
});

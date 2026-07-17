import { AppCard } from '@/components/AppCard';
import { AppIcon } from '@/components/AppIcon';
import { AppProgressBar } from '@/components/AppProgressBar';
import { AppText, AppView } from '@/components/ui';
import { useLocalization } from '@/hooks/useLocalization';
import { useGetUserStatsQuery } from '@/hooks/user';
import React from 'react';
import { StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

export const UserStats = () => {
  const { data } = useGetUserStatsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const { t } = useLocalization();

  const streakDays = data?.current_streak_days ?? 0;
  const compliance = data?.compliance_30d;
  const tasksDue = data?.tasks_due_30d ?? 0;
  const tasksCompleted = data?.tasks_completed_30d ?? 0;
  const habitsDue = data?.habit_instances_due_30d ?? 0;
  const habitsCompleted = data?.habit_instances_completed_30d ?? 0;

  const tasksProgress = tasksDue > 0 ? (tasksCompleted / tasksDue) * 100 : 0;
  const habitsProgress =
    habitsDue > 0 ? (habitsCompleted / habitsDue) * 100 : 0;

  const complianceText =
    compliance !== null && compliance !== undefined
      ? `${Math.round(compliance * 100)}%`
      : null;

  return (
    <AppCard style={styles.container} padding-16>
      <AppView row gap-12 marginB-16>
        <AppView flex-1 bg-lightCardBG style={styles.statCard} padding-12>
          <AppView row centerV gap-6 marginB-8>
            <AppIcon
              set="Ionicons"
              name="flame-outline"
              size={16}
              color={Colors.red10}
            />
            <AppText textColor caption>
              {t('settings.user_stats.streak')}
            </AppText>
          </AppView>
          <AppView row centerV flex-1 marginL-4>
            <AppText textColor h2>
              {streakDays}
            </AppText>
            <AppText textColor body1>
              {' '}
              {t('settings.user_stats.days')}
            </AppText>
          </AppView>
        </AppView>

        <AppView flex-1 bg-lightCardBG style={styles.statCard} padding-12>
          <AppView row centerV gap-6 marginB-8>
            <AppIcon
              set="Ionicons"
              name="stats-chart-outline"
              size={16}
              color={Colors.blue}
            />
            <AppText textColor caption>
              {t('settings.user_stats.last_days', {
                dayCount: data?.window_days || 30,
              })}
            </AppText>
          </AppView>
          <AppView marginL-4 centerV flex-1>
            {complianceText !== null ? (
              <AppText centerV textColor h2>
                {complianceText}
              </AppText>
            ) : (
              <AppText textColor xsm regular center marginT-8>
                {t('settings.user_stats.no_data_yet')}
              </AppText>
            )}
          </AppView>
        </AppView>
      </AppView>

      <AppView row centerV gap-16>
        <AppView flex-1>
          <AppView row spread marginB-6>
            <AppText textColor xsm>
              {tasksCompleted}/{tasksDue} {t('settings.user_stats.tasks')}
            </AppText>
            <AppText textColor xsm>
              {Math.round(tasksProgress)}%
            </AppText>
          </AppView>
          <AppProgressBar
            progress={tasksProgress}
            fullWidth
            progressColor={Colors.blue}
            style={styles.progressBar}
          />
        </AppView>

        <AppView flex-1>
          <AppView row spread marginB-6>
            <AppText textColor xsm>
              {habitsCompleted}/{habitsDue} {t('settings.user_stats.habits')}
            </AppText>
            <AppText textColor xsm>
              {Math.round(habitsProgress)}%
            </AppText>
          </AppView>
          <AppProgressBar
            progress={habitsProgress}
            fullWidth
            progressColor={Colors.blue}
            style={styles.progressBar}
          />
        </AppView>
      </AppView>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
  },
  statCard: {
    borderRadius: 16,
    minHeight: 100,
  },
  keepGoingText: {
    color: Colors.accent,
  },
  progressBar: {
    height: 8,
  },
});

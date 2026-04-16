import { AppText, AppView } from '@/components/ui';
import { useLocalization } from '@/hooks/useLocalization';
import { StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

export const BadgeInfoContent = ({ showPhase }: { showPhase?: boolean }) => {
  const { t } = useLocalization();
  const message = showPhase
    ? t('feature_highlight.phase_message')
    : t('feature_highlight.milestone_message');

  const badgeLabels = [
    showPhase ? t('feature_highlight.badge_p') : null,
    t('feature_highlight.badge_m'),
    t('feature_highlight.badge_t'),
  ].filter(Boolean) as string[];

  const colorLegend = [
    {
      color: Colors.badgeCurrent,
      label: t('feature_highlight.badge_color_current'),
    },
    {
      color: Colors.badgeUpcoming,
      label: t('feature_highlight.badge_color_upcoming'),
    },
    {
      color: Colors.badgeOverdue,
      label: t('feature_highlight.badge_color_overdue'),
    },
    {
      color: Colors.badgeCompleted,
      label: t('feature_highlight.badge_color_completed'),
    },
  ];

  return (
    <AppView>
      <AppText body2 light textColor>
        {message}
      </AppText>
      <AppView row gap-6 marginT-8 style={styles.wrap}>
        {badgeLabels.map((label) => (
          <AppView
            key={label}
            style={[styles.badgeLabel, { backgroundColor: Colors.blue }]}>
            <AppText sm regular textOnPrimary>
              {label}
            </AppText>
          </AppView>
        ))}
      </AppView>
      <AppView marginV-16 gap-8 row style={styles.wrap}>
        {colorLegend.map(({ color, label }) => (
          <AppView key={label} row centerV gap-6 style={styles.labelContainer}>
            <AppView style={[styles.label, { backgroundColor: color }]} />
            <AppText xsm regular textColor>
              {label}
            </AppText>
          </AppView>
        ))}
      </AppView>
    </AppView>
  );
};

const styles = StyleSheet.create({
  wrap: {
    flexWrap: 'wrap',
  },
  badgeLabel: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  label: {
    width: 24,
    height: 14,
    borderRadius: 80,
  },
  labelContainer: {
    width: '45%',
  },
});

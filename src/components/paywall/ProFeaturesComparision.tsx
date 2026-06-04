import { AppButton } from '@/components/AppButton';
import { AppIcon } from '@/components/AppIcon';
import { Divider } from '@/components/Divider';
import { LineDivider } from '@/components/LineDivider';
import { TranslatedText } from '@/components/TranslatedText';
import { AppText, AppView } from '@/components/ui';
import { useLocalization } from '@/hooks/useLocalization';
import React, { useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

type FeatureCell =
  | { type: 'check' }
  | { type: 'cross' }
  | { type: 'text'; value: string; highlight?: boolean };

type FeatureRowData = {
  label: string;
  free: FeatureCell;
  pro: FeatureCell;
};

const renderCell = (cell: FeatureCell): React.ReactNode => {
  if (cell.type === 'check') {
    return (
      <AppIcon set="Feather" name="check" size={18} color={Colors.success} />
    );
  }
  if (cell.type === 'cross') {
    return (
      <AppIcon set="Ionicons" name="close" size={18} color={Colors.grey40} />
    );
  }
  return (
    <AppText xsm regular center textColor>
      {cell.value}
    </AppText>
  );
};

export const ProFeaturesComparision = () => {
  const { t } = useLocalization();
  const [expanded, setExpanded] = useState(false);

  const initialFeatures = useMemo<FeatureRowData[]>(
    () => [
      {
        label: t('paywall.active_roadmaps'),
        free: { type: 'text', value: '1' },
        pro: { type: 'text', value: t('paywall.unlimited'), highlight: true },
      },
      {
        label: t('paywall.active_habits'),
        free: { type: 'text', value: '2' },
        pro: { type: 'text', value: t('paywall.unlimited'), highlight: true },
      },
      {
        label: t('paywall.ai_planning'),
        free: { type: 'text', value: '1' },
        pro: { type: 'text', value: t('paywall.unlimited'), highlight: true },
      },
      {
        label: t('paywall.ai_weekly_review'),
        free: { type: 'cross' },
        pro: { type: 'check' },
      },
      {
        label: t('paywall.import_existing_plan'),
        free: { type: 'text', value: '1' },
        pro: { type: 'text', value: t('paywall.unlimited'), highlight: true },
      },
    ],
    [t],
  );

  const moreFeatures = useMemo<FeatureRowData[]>(
    () => [
      {
        label: t('paywall.daily_task_view'),
        free: { type: 'cross' },
        pro: { type: 'check' },
      },
      {
        label: t('paywall.reminders'),
        free: { type: 'text', value: t('paywall.basic') },
        pro: {
          type: 'text',
          value: t('paywall.custom_reminders'),
          highlight: true,
        },
      },
      {
        label: t('paywall.advanced_insights'),
        free: { type: 'cross' },
        pro: { type: 'check' },
      },
      {
        label: t('paywall.accountability_anchors'),
        free: { type: 'text', value: t('paywall.basic_anchor') },
        pro: {
          type: 'text',
          value: t('paywall.advanced_anchor'),
          highlight: true,
        },
      },
      {
        label: t('paywall.friends_list'),
        free: { type: 'check' },
        pro: { type: 'check' },
      },
      {
        label: t('paywall.progress_stats'),
        free: { type: 'text', value: t('paywall.basic') },
        pro: { type: 'text', value: t('paywall.advanced'), highlight: true },
      },
      {
        label: t('paywall.templates'),
        free: { type: 'text', value: t('paywall.limited') },
        pro: {
          type: 'text',
          value: t('paywall.full_library'),
          highlight: true,
        },
      },
      {
        label: t('paywall.messaging'),
        free: { type: 'text', value: t('paywall.basic') },
        pro: { type: 'text', value: t('paywall.advanced'), highlight: true },
      },
    ],
    [t],
  );

  const visibleFeatures = expanded
    ? [...initialFeatures, ...moreFeatures]
    : initialFeatures;

  const handleToggleExpanded = () => setExpanded((prev) => !prev);

  return (
    <AppView gap-8 marginV-16>
      <AppView row gap-8>
        <TranslatedText
          body2
          semibold
          style={styles.featureLabel}
          textColor
          translationKey="paywall.feature"
        />
        <AppView center style={styles.freeColumn}>
          <TranslatedText
            body2
            semibold
            textColor
            translationKey="paywall.free_plan"
          />
        </AppView>
        <AppView center style={styles.proColumn}>
          <TranslatedText
            body2
            semibold
            textColor
            translationKey="paywall.pro_plan"
          />
        </AppView>
      </AppView>
      <LineDivider marginV-0 />
      {visibleFeatures.map((feature) => (
        <AppView key={feature.label} gap-8>
          <AppView row gap-8 paddingV-8 style={styles.featureRow}>
            <AppText xsm regular style={styles.featureLabel} textColor>
              {feature.label}
            </AppText>
            <AppView center style={styles.freeColumn}>
              {renderCell(feature.free)}
            </AppView>
            <AppView center style={styles.proColumn}>
              {renderCell(feature.pro)}
            </AppView>
          </AppView>
          <LineDivider marginV-0 />
        </AppView>
      ))}
      <Divider margin-4 />
      <AppButton onPress={handleToggleExpanded}>
        <AppView center row gap-10>
          <TranslatedText
            body2
            textColor
            translationKey={
              expanded ? 'paywall.hide_features' : 'paywall.see_all_features'
            }
          />
          <AppIcon
            set="Ionicons"
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={14}
            color={Colors.textColor}
          />
        </AppView>
      </AppButton>
    </AppView>
  );
};

const styles = StyleSheet.create({
  featureLabel: {
    flex: 0.5,
  },
  freeColumn: {
    flex: 0.2,
  },
  proColumn: {
    flex: 0.3,
  },
  featureRow: {
    alignItems: 'center',
  },
});

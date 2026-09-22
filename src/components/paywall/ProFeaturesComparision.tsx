import { AppIcon } from '@/components/AppIcon';
import { LineDivider } from '@/components/LineDivider';
import { TranslatedText } from '@/components/TranslatedText';
import { AppText, AppView } from '@/components/ui';
import { useLocalization } from '@/hooks/useLocalization';
import React, { useMemo } from 'react';
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

  const features = useMemo<FeatureRowData[]>(
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
        free: { type: 'text', value: t('paywall.limited') },
        pro: { type: 'text', value: t('paywall.unlimited'), highlight: true },
      },
      {
        label: t('paywall.accountability_anchors'),
        free: { type: 'text', value: '1' },
        pro: { type: 'text', value: t('paywall.unlimited'), highlight: true },
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
        label: t('paywall.ai_reviews_insights'),
        free: { type: 'text', value: t('paywall.basic') },
        pro: { type: 'text', value: t('paywall.advanced'), highlight: true },
      },
      {
        label: t('paywall.templates_imports'),
        free: { type: 'text', value: t('paywall.limited') },
        pro: {
          type: 'text',
          value: t('paywall.full_access'),
          highlight: true,
        },
      },
    ],
    [t],
  );

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
      {features.map((feature) => (
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

import { AppCard } from '@/components/AppCard';
import { TranslatedText } from '@/components/TranslatedText';
import { AppImage, AppView } from '@/components/ui';
import { TranslationKeysType } from '@/lib/localization/types/i18n.types';
import { JSX } from 'react';
import { StyleSheet } from 'react-native';
import { Assets } from 'react-native-ui-lib';

interface TaskAndRoadmapCreationItem {
  titleKey: TranslationKeysType;
  descriptionKey: TranslationKeysType;
  /** 'ai' overlays the purple AI background on the icon tile. */
  treatment?: 'ai' | 'standard';
  /**
   * Tighter internal spacing, opted into by the Create page so its six cards
   * fit one screen. Spacing only — no fixed heights, so text still wraps and
   * grows with accessibility font scaling. Other screens keep the roomier
   * default.
   */
  compact?: boolean;
  onPress: () => void;
  icon?: JSX.Element;
}

export const CreateTabListItem = ({
  titleKey,
  descriptionKey,
  treatment = 'standard',
  compact = false,
  onPress,
  icon,
}: TaskAndRoadmapCreationItem) => {
  return (
    <AppCard onPress={onPress} style={compact ? styles.compactCard : undefined}>
      <AppView
        row
        gap-16
        centerV
        style={compact ? styles.compactRow : undefined}>
        <AppView bg-accent br30 center style={styles.iconContainer}>
          {treatment === 'ai' && (
            <AppImage
              style={[StyleSheet.absoluteFillObject]}
              source={Assets.logo.aiRoadmapBG}
            />
          )}
          {icon}
        </AppView>
        <AppView flex gap-6 style={compact ? styles.compactCopy : undefined}>
          <TranslatedText body1 translationKey={titleKey} />
          <TranslatedText xsm translationKey={descriptionKey} />
        </AppView>
      </AppView>
    </AppCard>
  );
};

// The compact styles sit last in each element's style array, so they override
// the modifier defaults above them (padding-16, gap-16, gap-6).
const styles = StyleSheet.create({
  iconContainer: { width: 50, height: 50 },
  compactCard: { paddingVertical: 12, paddingHorizontal: 12 },
  compactRow: { gap: 12 },
  compactCopy: { gap: 4 },
});

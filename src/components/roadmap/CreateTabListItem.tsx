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
  onPress: () => void;
  icon?: JSX.Element;
}

export const CreateTabListItem = ({
  titleKey,
  descriptionKey,
  treatment = 'standard',
  onPress,
  icon,
}: TaskAndRoadmapCreationItem) => {
  return (
    <AppCard onPress={onPress}>
      <AppView row gap-16 centerV>
        <AppView bg-accent br30 center style={styles.iconContainer}>
          {treatment === 'ai' && (
            <AppImage
              style={[StyleSheet.absoluteFillObject]}
              source={Assets.logo.aiRoadmapBG}
            />
          )}
          {icon}
        </AppView>
        <AppView flex gap-6>
          <TranslatedText body1 translationKey={titleKey} />
          <TranslatedText xsm translationKey={descriptionKey} />
        </AppView>
      </AppView>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  iconContainer: { width: 50, height: 50 },
});

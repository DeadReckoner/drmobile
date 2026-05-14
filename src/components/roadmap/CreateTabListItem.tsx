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
  type?: 'ai' | 'custom' | 'task' | 'import_plan';
  onPress: () => void;
  icon?: JSX.Element;
}

export const CreateTabListItem = ({
  titleKey,
  descriptionKey,
  type = 'task',
  onPress,
  icon,
}: TaskAndRoadmapCreationItem) => {
  return (
    <AppCard paddingV-20 onPress={onPress}>
      <AppView row gap-16>
        <AppView bg-accent br30 center style={styles.iconContainer}>
          {type === 'ai' && (
            <AppImage
              style={[StyleSheet.absoluteFill]}
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

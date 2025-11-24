import { AppCard } from '@/components/AppCard';
import { AppIcon } from '@/components/AppIcon';
import { TranslatedText } from '@/components/TranslatedText';
import { AppView } from '@/components/ui';
import { Animations } from '@/utils/animation.utils';
import { router } from 'expo-router';
import { Colors } from 'react-native-ui-lib';

export const InProgressAIRoadmapBanner = () => {
  const handlePress = () => {
    router.navigate('/roadmap/create-ai-roadmap');
  };

  return (
    <AppView
      reanimated
      entering={Animations.Entry.FadeInDownWithSpring()}
      exiting={Animations.Exit.FadeOutDown()}>
      <AppCard onPress={handlePress}>
        <AppView row centerV>
          <AppView
            bg-primary
            br100
            padding-8
            style={{ width: 48, height: 48 }}
            center>
            <AppIcon
              set="Ionicons"
              name="sparkles"
              size={20}
              color={Colors.white}
            />
          </AppView>
          <AppView flex-1 marginL-12 gap-4>
            <TranslatedText translationKey="ai_roadmap.in_progress_banner.title" />
            <TranslatedText
              xsm
              translationKey="ai_roadmap.in_progress_banner.description"
            />
          </AppView>
          <AppIcon
            set="Feather"
            name="chevron-right"
            size={20}
            color={Colors.textSecondary}
          />
        </AppView>
      </AppCard>
    </AppView>
  );
};

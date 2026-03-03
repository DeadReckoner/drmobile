import { AppButton } from '@/components/AppButton';
import { Divider } from '@/components/Divider';
import { PrimaryButtonContainer } from '@/components/PrimaryButtonContainer';
import { TranslatedText } from '@/components/TranslatedText';
import { AppText, AppView } from '@/components/ui';
import { useLocalization } from '@/hooks/useLocalization';
import { useAppDispatch, useAppSelector } from '@/store/hooks/store.hooks';
import { resetCreationStateAction } from '@/store/slices/aiRoadmapCreationSlice';
import { selectUser } from '@/store/slices/authSlice';
import {
  markIntroModalSeenAction,
  selectHasSeenIntroModal,
} from '@/store/slices/onboardingSlice';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

export const OnboardingIntroModal = () => {
  const dispatch = useAppDispatch();
  const { t } = useLocalization();
  const hasSeenIntroModal = useAppSelector(selectHasSeenIntroModal);
  const user = useAppSelector(selectUser);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (user?.id && !hasSeenIntroModal) {
      setVisible(true);
    }
  }, [user?.id, hasSeenIntroModal]);

  const handleStartRoadmap = () => {
    dispatch(markIntroModalSeenAction());
    dispatch(resetCreationStateAction());
    router.navigate('/roadmap/create-ai-roadmap');
    setTimeout(() => setVisible(false), 500);
  };

  const handleSkipToApp = () => {
    dispatch(markIntroModalSeenAction());
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <AppView
      flex
      style={StyleSheet.absoluteFill}
      bg-screenBG
      pointerEvents="box-none">
      <AppView style={StyleSheet.absoluteFill}>
        <Image
          source={require('assets/images/icon.png')}
          contentFit="cover"
          style={styles.backgroundImage}
        />
      </AppView>

      <AppView flex useSafeArea>
        <AppView flex centerV paddingH-24 paddingT-48>
          <AppView center spread>
            <AppText h2 bold textColor>
              {t('onboarding.intro.headline')}
            </AppText>
            <Divider />
            <AppText body2 textColor light>
              {t('onboarding.intro.body')}
            </AppText>
          </AppView>
          <AppView flex center>
            <AppView>
              <AppView
                absH
                absV
                width={230}
                height={230}
                marginL-40
                bg-primary
                br100
              />
              <Image
                source={require('assets/images/onboard-welcome.svg')}
                contentFit="contain"
                transition={350}
                style={styles.image}
              />
            </AppView>
          </AppView>

          <AppView>
            <PrimaryButtonContainer
              paddingV-12
              style={{ borderRadius: 40 }}
              onPress={handleStartRoadmap}>
              <TranslatedText
                body2
                textOnPrimary
                bold
                translationKey="onboarding.intro.primary_cta"
              />
              <AppText sm textColor>
                {t('onboarding.intro.primary_subtext')}
              </AppText>
            </PrimaryButtonContainer>

            <AppButton center padding-16 onPress={handleSkipToApp}>
              <AppText body2 textColor underline>
                {t('onboarding.intro.secondary_cta')}
              </AppText>
            </AppButton>
          </AppView>
        </AppView>
      </AppView>
    </AppView>
  );
};

const styles = StyleSheet.create({
  image: {
    width: 300,
    height: 300,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    opacity: 0.03,
  },
});

import { AppButton } from '@/components/AppButton';
import { PrimaryButtonContainer } from '@/components/PrimaryButtonContainer';
import { TranslatedText } from '@/components/TranslatedText';
import { AppImage, AppView } from '@/components/ui';
import { useAppDispatch, useAppSelector } from '@/store/hooks/store.hooks';
import { resetCreationStateAction } from '@/store/slices/aiRoadmapCreationSlice';
import { selectUser } from '@/store/slices/authSlice';
import {
  markIntroModalSeenAction,
  selectHasSeenIntroModal,
} from '@/store/slices/onboardingSlice';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Dimensions, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  AnimatedStyle,
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Colors } from 'react-native-ui-lib';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PAGES = [
  {
    image: require('assets/images/onboard_one.png') as number,
  },
  {
    image: require('assets/images/onboard_two.png') as number,
  },
] as const;

interface PageCtaProps {
  animatedStyle: AnimatedStyle<ViewStyle>;
  children: React.ReactNode;
}

const PageCta = ({ animatedStyle, children }: PageCtaProps) => (
  <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
    {children}
  </Animated.View>
);

export const OnboardingIntroModal = () => {
  const dispatch = useAppDispatch();
  const hasSeenIntroModal = useAppSelector(selectHasSeenIntroModal);
  const user = useAppSelector(selectUser);
  const [visible, setVisible] = useState(false);
  const scrollRef = useRef<Animated.ScrollView>(null);
  const scrollX = useSharedValue(0);
  const fadeOpacity = useSharedValue(1);

  const fadeStyle = useAnimatedStyle(() => ({
    opacity: fadeOpacity.value,
  }));

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const page1CtaStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollX.value,
      [0, SCREEN_WIDTH * 0.5],
      [1, 0],
      Extrapolation.CLAMP,
    ),
    transform: [
      {
        translateY: interpolate(
          scrollX.value,
          [0, SCREEN_WIDTH * 0.5],
          [0, 16],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  const page2CtaStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollX.value,
      [SCREEN_WIDTH * 0.5, SCREEN_WIDTH],
      [0, 1],
      Extrapolation.CLAMP,
    ),
    transform: [
      {
        translateY: interpolate(
          scrollX.value,
          [SCREEN_WIDTH * 0.5, SCREEN_WIDTH],
          [16, 0],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  useEffect(() => {
    if (user?.id && !hasSeenIntroModal) {
      fadeOpacity.value = 1;
      setVisible(true);
    }
  }, [user?.id, hasSeenIntroModal, fadeOpacity]);

  const completeStartRoadmap = () => {
    dispatch(markIntroModalSeenAction());
    dispatch(resetCreationStateAction());
    router.navigate('/roadmap/create-ai-roadmap');
    setTimeout(() => setVisible(false), 500);
  };

  const completeSkipToApp = () => {
    dispatch(markIntroModalSeenAction());
    setVisible(false);
  };

  const handleStartRoadmap = () => {
    fadeOpacity.value = withTiming(0, { duration: 300 }, (finished) => {
      if (finished) {
        runOnJS(completeStartRoadmap)();
      }
    });
  };

  const handleSkipToApp = () => {
    fadeOpacity.value = withTiming(0, { duration: 300 }, (finished) => {
      if (finished) {
        runOnJS(completeSkipToApp)();
      }
    });
  };

  const handleNext = () => {
    scrollRef.current?.scrollTo({ x: SCREEN_WIDTH, animated: true });
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, fadeStyle]}
      pointerEvents="box-none">
      <AppView
        flex
        style={StyleSheet.absoluteFill}
        bg-screenBG
        pointerEvents="box-none">
        <AppView style={StyleSheet.absoluteFill}>
          <AppImage
            source={require('assets/images/icon.png')}
            contentFit="cover"
            style={styles.backgroundImage}
          />
        </AppView>

        <AppView flex useSafeArea>
          <Animated.ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            bounces={false}
            scrollEventThrottle={16}
            onScroll={onScroll}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}>
            {PAGES.map((page, index) => (
              <AppView key={index} style={styles.page} paddingH-24 paddingT-24>
                <TranslatedText
                  h2
                  bold
                  translationKey={
                    index === 0
                      ? 'onboarding.intro.page1.headline'
                      : 'onboarding.intro.page2.headline'
                  }
                />
                <AppView marginT-16>
                  <TranslatedText
                    light
                    style={styles.bodyText}
                    translationKey={
                      index === 0
                        ? 'onboarding.intro.page1.body'
                        : 'onboarding.intro.page2.body'
                    }
                  />
                </AppView>
                <AppView flex center marginV-16>
                  <AppImage
                    source={page.image}
                    contentFit="contain"
                    transition={350}
                    style={[styles.image, { height: 350 }]}
                  />
                </AppView>
              </AppView>
            ))}
          </Animated.ScrollView>

          <AppView paddingH-24>
            <AppView style={styles.ctaContainer} center>
              <PageCta animatedStyle={page1CtaStyle}>
                <PrimaryButtonContainer
                  paddingV-18
                  style={{ borderRadius: 40 }}
                  onPress={handleNext}>
                  <TranslatedText
                    body2
                    textOnPrimary
                    bold
                    translationKey="onboarding.intro.page1.next_cta"
                  />
                </PrimaryButtonContainer>
              </PageCta>

              <PageCta animatedStyle={page2CtaStyle}>
                <PrimaryButtonContainer
                  paddingV-12
                  style={{ borderRadius: 40 }}
                  onPress={handleStartRoadmap}>
                  <TranslatedText
                    body2
                    textOnPrimary
                    bold
                    translationKey="onboarding.intro.page2.primary_cta"
                  />
                  <TranslatedText
                    sm
                    light
                    translationKey="onboarding.intro.page2.primary_subtext"
                  />
                </PrimaryButtonContainer>
                <AppButton center padding-16 onPress={handleSkipToApp}>
                  <TranslatedText
                    underline
                    translationKey="onboarding.intro.page2.secondary_cta"
                  />
                </AppButton>
              </PageCta>
            </AppView>
          </AppView>
        </AppView>
      </AppView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  page: {
    width: SCREEN_WIDTH,
    flex: 1,
  },
  bodyText: {
    lineHeight: 22,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    opacity: 0.01,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 24,
    backgroundColor: Colors.primary,
  },
  dotInactive: {
    width: 8,
    backgroundColor: Colors.secondary,
    opacity: 0.4,
  },
  ctaContainer: {
    height: 128,
    position: 'relative',
  },
});

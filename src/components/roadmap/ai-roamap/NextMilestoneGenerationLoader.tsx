import { AppButton } from '@/components/AppButton';
import { AppIcon } from '@/components/AppIcon';
import { AppScreen } from '@/components/AppScreen';
import { SlideUpTextCarousel } from '@/components/roadmap/ai-roamap/SlideUpTextCarousel';
import { TranslatedText } from '@/components/TranslatedText';
import { AppImage, AppProgressBar, AppText, AppView } from '@/components/ui';
import { useLocalization } from '@/hooks/useLocalization';
import { TranslationKeysType } from '@/lib/localization/types/i18n.types';
import { useAppSelector } from '@/store/hooks/store.hooks';
import {
  selectAdjustedRationale,
  selectNextMilestoneJobStatusResponse,
} from '@/store/slices/nextMilestoneGenerationSlice';
import { Animations } from '@/utils/animation.utils';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import {
  interpolate,
  interpolateColor,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Assets, Colors } from 'react-native-ui-lib';

const getLoadingTexts = (t: (_key: TranslationKeysType) => string) => {
  return t('ai_roadmap.milestone_loading_texts').split('|');
};

export const NextMilestoneGenerationLoader = () => {
  const loaderTimingValue = useSharedValue(0);
  const { t } = useLocalization();
  const loadingTexts = getLoadingTexts(t);

  useEffect(() => {
    loaderTimingValue.value = withRepeat(
      withTiming(1, { duration: 4000 }),
      -1,
      true,
      undefined,
      ReduceMotion.Never,
    );
  }, [loaderTimingValue]);

  const animationStyles = useAnimatedStyle(() => ({
    transform: [
      {
        rotateZ: `${interpolate(loaderTimingValue.value, [0, 1], [0, 360])}deg`,
      },
    ],
    shadowColor: interpolateColor(
      loaderTimingValue.value,
      [0, 1],
      ['#00B2FF', '#ba24ffff'],
    ),
  }));

  const jobStatusData = useAppSelector(selectNextMilestoneJobStatusResponse);
  const adjustedRationale = useAppSelector(selectAdjustedRationale);

  return (
    <AppScreen style={StyleSheet.absoluteFill}>
      <AppView
        flex
        reanimated
        entering={Animations.Entry.FadeInDownWithSpring().duration(1500)}
        exiting={Animations.Exit.FadeOutDown().duration(1000)}
        style={[
          StyleSheet.absoluteFill,
          styles.loader,
          { backgroundColor: Colors.dialogOverlay },
        ]}>
        <AppView marginB-20 flex center>
          <AppView center>
            <AppView
              reanimated
              center
              style={[animationStyles, styles.imageContainer]}>
              <AppImage
                style={[StyleSheet.absoluteFill, styles.imageBackground]}
                source={Assets.logo.aiRoadmapBG}
              />
            </AppView>
            <AppView absH absV center>
              <AppIcon
                set="Feather"
                name="map"
                color={Colors.white}
                size={24}
              />
            </AppView>
          </AppView>
          <AppView marginT-40>
            <SlideUpTextCarousel items={loadingTexts} />
          </AppView>
          <AppView row center gap-16 marginT-8 marginL-24>
            <AppProgressBar
              fullWidth
              progress={jobStatusData?.progress || 0}
              style={{ width: '50%' }}
            />
            <AppText xsm textColor center>
              {jobStatusData?.progress || 0}%
            </AppText>
          </AppView>
          {!!adjustedRationale && (
            <AppView
              bg-primary
              reanimated
              entering={Animations.Entry.FadeInDownWithSpring()}
              marginT-20
              br20
              style={styles.rationaleContainer}>
              <AppView row centerV gap-6 marginB-4 marginR-24>
                <AppIcon
                  set="Ionicons"
                  name="bulb-outline"
                  size={16}
                  color={Colors.textOnPrimary}
                />
                <TranslatedText
                  xsm
                  regular
                  textOnPrimary
                  translationKey="ai_roadmap.milestone_generation.adjusted_message"
                />
              </AppView>
              <AppText xsm textColor marginL-20>
                {adjustedRationale}
              </AppText>
            </AppView>
          )}
          <AppView marginT-24>
            <AppButton
              row
              bg-accent
              paddingV-10
              paddingL-16
              paddingR-20
              br100
              center
              onPress={() => router.back()}>
              <AppIcon
                set="Ionicons"
                name="arrow-back"
                color={Colors.white}
                size={24}
              />
              <TranslatedText
                marginL-8
                body2
                regular
                center
                translationKey="common.return_to_app"
              />
            </AppButton>
          </AppView>
        </AppView>
      </AppView>
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  loader: {
    zIndex: 100,
  },
  imageBackground: {
    borderRadius: 100,
  },
  imageContainer: {
    shadowOpacity: 10,
    shadowRadius: 50,
    width: 80,
    height: 80,
  },
  rationaleContainer: {
    maxWidth: '80%',
    padding: 16,
  },
});

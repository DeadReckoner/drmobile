import { AppIcon } from '@/components/AppIcon';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { SlideUpTextCarousel } from '@/components/roadmap/ai-roamap/SlideUpTextCarousel';
import { AppImage, AppText, AppView } from '@/components/ui';
import { useLocalization } from '@/hooks/useLocalization';
import { TranslationKeysType } from '@/lib/localization/types/i18n.types';
import { useAppSelector } from '@/store/hooks/store.hooks';
import { selectJobStatusResponse } from '@/store/slices/aiRoadmapCreationSlice';
import { Animations } from '@/utils/animation.utils';
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
import { Assets, Colors, ProgressBar } from 'react-native-ui-lib';

const getSystemPrompts = (t: (_key: TranslationKeysType) => string) => {
  const loadingTexts = t('ai_roadmap.loading_texts');
  return loadingTexts.split('|');
};

export const AiRoadmapCreationLoader = () => {
  const loaderTimingValue = useSharedValue(0);
  const { t } = useLocalization();
  const loadingTexts = getSystemPrompts(t);
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
  const jobStatusData = useAppSelector(selectJobStatusResponse);

  return (
    <AppView
      reanimated
      entering={Animations.Entry.FadeInDownWithSpring().duration(1500)}
      exiting={Animations.Exit.FadeOutDown().duration(1000)}
      style={[
        StyleSheet.absoluteFillObject,
        styles.loader,
        { backgroundColor: Colors.dialogOverlay },
      ]}>
      <AppView absT absH useSafeArea>
        <HeaderWithBack marginH-16 />
      </AppView>
      <AppView marginB-20 flex center>
        <AppView center>
          <AppView
            reanimated
            center
            style={[animationStyles, styles.imageContainer]}>
            <AppImage
              style={[StyleSheet.absoluteFillObject, styles.imageBackground]}
              source={Assets.logo.aiRoadmapBG}
            />
          </AppView>
          <AppView absH absV center>
            <AppIcon set="Feather" name="map" color={Colors.white} size={24} />
          </AppView>
        </AppView>
        <AppView marginT-40>
          <SlideUpTextCarousel items={loadingTexts} />
        </AppView>
        <AppView row center gap-4 marginT-12 marginL-24>
          <ProgressBar
            fullWidth
            progress={jobStatusData?.progress || 0}
            style={{ width: 180 }}
          />
          <AppText xsm textColor center style={{ width: 40 }}>
            {jobStatusData?.progress || 0}%
          </AppText>
        </AppView>
      </AppView>
    </AppView>
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
});

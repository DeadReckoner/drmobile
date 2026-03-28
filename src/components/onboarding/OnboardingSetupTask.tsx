import { AppCard } from '@/components/AppCard';
import { Divider } from '@/components/Divider';
import { SetupCompletionProgress } from '@/components/onboarding/SetupCompletionProgress';
import { TranslatedText } from '@/components/TranslatedText';
import { AppText, AppView } from '@/components/ui';
import { useLocalization } from '@/hooks/useLocalization';
import { useAppDispatch, useAppSelector } from '@/store/hooks/store.hooks';
import {
  completeSetupTaskAction,
  selectAreAllSetupStepsCompleted,
  selectSetupSteps,
} from '@/store/slices/onboardingSlice';
import { Animations } from '@/utils/animation.utils';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { LayoutAnimation, StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

type CompletionPhase = 'idle' | 'progress' | 'message';

export const OnboardingSetupTask = () => {
  const { t } = useLocalization();
  const dispatch = useAppDispatch();
  const setupSteps = useAppSelector(selectSetupSteps);
  const allStepsCompleted = useAppSelector(selectAreAllSetupStepsCompleted);
  const [phase, setPhase] = useState<CompletionPhase>('idle');
  const completionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const completedCount = Object.values(setupSteps).filter(Boolean).length;
  const totalCount = Object.keys(setupSteps).length;

  useEffect(() => {
    if (allStepsCompleted && phase === 'idle') {
      setPhase('progress');
    }
  }, [allStepsCompleted, phase]);

  useEffect(() => {
    return () => {
      if (completionTimerRef.current) clearTimeout(completionTimerRef.current);
    };
  }, []);

  const handleProgressComplete = () => {
    completionTimerRef.current = setTimeout(() => {
      setPhase('message');
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      dispatch(completeSetupTaskAction());
    }, 1600);
  };

  const handlePress = () => {
    router.push('/onboarding/setup-task-details');
  };

  return (
    <AppView
      flex
      reanimated
      layout={Animations.Layout.Springify()}
      entering={Animations.Entry.FadeInDownWithSpring()}
      exiting={Animations.Exit.FadeOutDown()}>
      <AppCard padding-0 style={styles.card} onPress={handlePress}>
        <AppView
          absL
          absR
          br40
          style={[styles.indicator, { backgroundColor: Colors.primary }]}
        />
        <AppView paddingV-16 paddingL-8 paddingR-16>
          <AppView flex>
            {(phase === 'message' || phase === 'progress') && (
              <AppView row flex center>
                <AppText flex body2 textColor center>
                  {t('onboarding.setup_task.completion_message')}
                </AppText>
                <AppView>
                  {phase === 'progress' && (
                    <SetupCompletionProgress
                      onComplete={handleProgressComplete}
                    />
                  )}
                </AppView>
              </AppView>
            )}
          </AppView>
          {phase === 'idle' && (
            <AppView
              reanimated
              entering={Animations.Entry.FadeInDownWithSpring()}
              exiting={Animations.Exit.FadeOutDown()}
              row
              centerV
              spread>
              <AppView row centerV flex height={'100%'}>
                <AppView flex marginL-12>
                  <TranslatedText
                    subtitle2
                    translationKey="onboarding.setup_task.title"
                  />
                  <Divider margin-2 />
                  <TranslatedText
                    xsm
                    secondary
                    translationKey="onboarding.setup_task.description"
                  />
                </AppView>
              </AppView>
              <AppView marginL-8>
                <AppText xsm secondary>
                  {completedCount}/{totalCount}
                </AppText>
              </AppView>
            </AppView>
          )}
        </AppView>
      </AppCard>
    </AppView>
  );
};

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    minHeight: 100,
  },
  indicator: {
    height: '100%',
    width: 4,
    borderRadius: 2,
  },
});

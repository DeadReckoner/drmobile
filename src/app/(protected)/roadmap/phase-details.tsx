import { AppScreen } from '@/components/AppScreen';
import { Divider } from '@/components/Divider';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { OverviewCard } from '@/components/roadmap/OverviewCard';
import { AppText, AppView } from '@/components/ui';
import { Phase } from '@/hooks/roadmap/types/roadmap.types';
import { useLocalization } from '@/hooks/useLocalization';
import { useAppSelector } from '@/store/hooks/store.hooks';
import { selectDraftRoadmap } from '@/store/slices/roadmapDraftSlice';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useRef } from 'react';
import { Dimensions, ScrollView, StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

const WINDOW_HEIGHT = Dimensions.get('window').height;

const calculatePhaseProgress = (phase: Phase): number => {
  const milestones = phase.milestones ?? [];
  if (milestones.length === 0) return 0;
  const reached = milestones.filter((m) => m.reached).length;
  return Math.floor((reached / milestones.length) * 100);
};

const PhaseDetailsPage = () => {
  const { phaseId } = useLocalSearchParams<{ phaseId: string }>();
  const roadmap = useAppSelector(selectDraftRoadmap);
  const { t } = useLocalization();

  const scrollViewRef = useRef<ScrollView>(null);
  const phases = useMemo(() => roadmap?.phases ?? [], [roadmap?.phases]);

  const scrollToCurrentPhase = useCallback((y: number, height: number) => {
    scrollViewRef.current?.scrollTo({
      y: Math.max(0, y - WINDOW_HEIGHT / 2 + height / 2),
      animated: true,
    });
  }, []);

  if (phases.length === 0) {
    return (
      <AppScreen>
        <HeaderWithBack headerKey="common.phases" />
        <AppView flex center>
          <AppText body2 secondary>
            {t('common.something_went_wrong')}
          </AppText>
        </AppView>
      </AppScreen>
    );
  }

  return (
    <AppScreen safeArea>
      <HeaderWithBack headerKey="common.phases" />
      <Divider />
      <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false}>
        <AppView gap-12>
          {phases.map((phase) => {
            const isCurrentPhase = phase.phase_id === phaseId;
            const phaseProgress = calculatePhaseProgress(phase);
            return (
              <AppView key={phase.phase_id}>
                <AppView
                  onLayout={
                    isCurrentPhase
                      ? (e) => {
                          const { y, height } = e.nativeEvent.layout;
                          scrollToCurrentPhase(y, height);
                        }
                      : undefined
                  }
                  style={[
                    styles.currentPhaseWrapper,
                    {
                      borderColor: isCurrentPhase
                        ? Colors.accent
                        : 'transparent',
                    },
                  ]}>
                  <OverviewCard
                    title={phase.name}
                    description={phase.description}
                    progress={phaseProgress}
                    onPress={() => {
                      router.navigate({
                        pathname: '/roadmap/phase-milestones',
                        params: {
                          milestones: JSON.stringify(phase.milestones || ''),
                        },
                      });
                    }}
                  />
                </AppView>
              </AppView>
            );
          })}
        </AppView>
      </ScrollView>
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  currentPhaseWrapper: {
    borderRadius: 14,
    borderWidth: 3,
  },
});

export default PhaseDetailsPage;

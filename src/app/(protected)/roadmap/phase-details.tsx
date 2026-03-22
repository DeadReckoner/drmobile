import { AppScreen } from '@/components/AppScreen';
import { Divider } from '@/components/Divider';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { OverviewCard } from '@/components/roadmap/OverviewCard';
import { AppText, AppView } from '@/components/ui';
import { useLocalization } from '@/hooks/useLocalization';
import { useScrollToCurrentItem } from '@/hooks/useScrollToCurrentItem';
import { useAppSelector } from '@/store/hooks/store.hooks';
import {
  selectCurrentPhase,
  selectDraftRoadmap,
} from '@/store/slices/roadmapDraftSlice';
import { buildBadgeLabel, calculatePhaseProgress } from '@/utils/roadmap.utils';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

const PhaseDetailsPage = () => {
  const roadmap = useAppSelector(selectDraftRoadmap);
  const { t } = useLocalization();
  const phases = useMemo(() => roadmap?.phases ?? [], [roadmap?.phases]);
  const ongoingPhaseId = useAppSelector(selectCurrentPhase)?.phase_id;
  const { scrollViewRef, onCurrentItemLayout } =
    useScrollToCurrentItem(!!ongoingPhaseId);

  if (phases.length === 0) {
    return (
      <AppScreen safeArea>
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
            const isCurrentPhase = phase.phase_id === ongoingPhaseId;
            const phaseProgress = calculatePhaseProgress(phase);
            const badgeLabel = buildBadgeLabel({ phase: phase.order_index });
            return (
              <AppView key={phase.phase_id}>
                <AppView
                  onLayout={
                    isCurrentPhase
                      ? (e) => {
                          const { y, height } = e.nativeEvent.layout;
                          onCurrentItemLayout(y, height);
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
                    badgeLabel={badgeLabel}
                    badgeStatus={phase.status}
                    onPress={() => {
                      router.navigate({
                        pathname: '/roadmap/phase-milestones',
                        params: {
                          phaseId: phase.phase_id,
                          phaseLabel: String(phase.order_index),
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

import { AppScreen } from '@/components/AppScreen';
import { Divider } from '@/components/Divider';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { OverviewCard } from '@/components/roadmap/OverviewCard';
import { AppText, AppView } from '@/components/ui';
import { RoadmapType } from '@/hooks/roadmap/types/roadmap.types';
import { useLocalization } from '@/hooks/useLocalization';
import { useScrollToCurrentItem } from '@/hooks/useScrollToCurrentItem';
import {
  buildBadgeLabel,
  calculatePhaseProgress,
  findOngoingPhase,
} from '@/utils/roadmap.utils';
import { consumeRoadmap, storeRoadmap } from '@/utils/roadmapTransfer';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

const ReadonlyPhaseDetails = () => {
  const params = useLocalSearchParams<{ roadmap?: string }>();
  const { t } = useLocalization();
  const [roadmap] = useState<RoadmapType | null>(() => {
    const transferred = consumeRoadmap();
    if (transferred) return transferred;
    if (!params.roadmap) return null;
    try {
      return JSON.parse(params.roadmap) as RoadmapType;
    } catch {
      return null;
    }
  });

  const phases = useMemo(() => roadmap?.phases ?? [], [roadmap?.phases]);
  const ongoingPhaseId = useMemo(
    () => findOngoingPhase(phases)?.phase_id,
    [phases],
  );
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
                      if (roadmap) storeRoadmap(roadmap);
                      router.navigate({
                        pathname: '/settings/readonly-phase-milestones',
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

export default ReadonlyPhaseDetails;

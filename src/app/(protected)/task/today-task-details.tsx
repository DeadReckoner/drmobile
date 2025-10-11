import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppIcon } from '@/components/AppIcon';
import { AppScreen } from '@/components/AppScreen';
import { Divider } from '@/components/Divider';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { LineDivider } from '@/components/LineDivider';
import { StepsList } from '@/components/roadmap/StepsList';
import { UnorderedList } from '@/components/roadmap/UnorderedList';
import { AppText, AppView } from '@/components/ui';
import { useAppSelector } from '@/store/hooks/store.hooks';
import { selectSelectedTask } from '@/store/slices/roadmapDraftSlice';
import { Animations } from '@/utils/animation.utils';
import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

const TodayTaskDetails = () => {
  const task = useAppSelector(selectSelectedTask);
  const dependencies = useMemo(() => {
    if (!task?.dependencies) return 'N/A';
    try {
      const parsedDeps = JSON.parse(task?.dependencies || '[]');
      if (Array.isArray(parsedDeps)) {
        return parsedDeps.join(', ');
      }
    } catch {}
  }, [task?.dependencies]);

  const onRoadmapButtonPress = () => {
    router.navigate({
      pathname: '/roadmap/roadmap-details',
    });
  };
  return (
    <AppScreen>
      <ScrollView
        contentInsetAdjustmentBehavior="always"
        showsVerticalScrollIndicator={false}>
        <AppView row spread centerV>
          <HeaderWithBack />
          <AppButton onPress={onRoadmapButtonPress}>
            <AppIcon set="Feather" name="map" size={18} />
          </AppButton>
        </AppView>
        <Divider />
        <AppCard>
          <AppText body1 textColor>
            {task?.title}
          </AppText>
          <LineDivider marginV-12 />
          <AppText captionLight textColor>
            {task?.description}
          </AppText>
          {!!task?.rationale && (
            <>
              <Divider margin-4 />
              <UnorderedList
                data={[
                  {
                    title: 'common.why_it_is_needed',
                    value: task?.rationale || 'N/A',
                  },
                  {
                    title: 'common.estimated_time',
                    value: `${task?.est_minutes || 0} mins`,
                  },
                  {
                    title: 'common.dependencies',
                    value: dependencies || 'N/A',
                  },
                ]}
              />
            </>
          )}
        </AppCard>
        <Divider />
        <AppView style={styles.childContentContainer} reanimated>
          {!!task?.milestone_id && (
            <AppView reanimated entering={Animations.Entry.FadeInDown()}>
              <StepsList mode="view" />
            </AppView>
          )}
        </AppView>
      </ScrollView>
    </AppScreen>
  );
};

export default TodayTaskDetails;

const styles = StyleSheet.create({
  childContentContainer: {
    minHeight: 100,
  },
});

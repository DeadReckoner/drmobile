import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppIcon } from '@/components/AppIcon';
import { AppScreen } from '@/components/AppScreen';
import { Divider } from '@/components/Divider';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { LineDivider } from '@/components/LineDivider';
import { StepsList } from '@/components/roadmap/StepsList';
import { AppText, AppView } from '@/components/ui';
import { useAppSelector } from '@/store/hooks/store.hooks';
import { selectSelectedTask } from '@/store/slices/roadmapDraftSlice';
import { Animations } from '@/utils/animation.utils';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';

const TodayTaskDetails = () => {
  const task = useAppSelector(selectSelectedTask);

  const onRoadmapButtonPress = () => {
    router.navigate({
      pathname: '/roadmap/roadmap-details',
    });
  };
  return (
    <AppScreen>
      <ScrollView contentInsetAdjustmentBehavior="always">
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

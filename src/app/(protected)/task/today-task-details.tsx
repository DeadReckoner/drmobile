import { AppCard } from '@/components/AppCard';
import { AppScreen } from '@/components/AppScreen';
import { Divider } from '@/components/Divider';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { LineDivider } from '@/components/LineDivider';
import { PrimaryButton } from '@/components/PrimaryButton';
import { StepsList } from '@/components/roadmap/StepsList';
import { UnorderedList } from '@/components/roadmap/UnorderedList';
import { AppText, AppView } from '@/components/ui';
import { useCompleteAllStepsMutation } from '@/hooks/step';
import { useLocalization } from '@/hooks/useLocalization';
import { useToast } from '@/hooks/useToast';
import { useAppSelector } from '@/store/hooks/store.hooks';
import { selectSelectedTask } from '@/store/slices/roadmapDraftSlice';
import { Animations } from '@/utils/animation.utils';
import { getApiErrorMessage } from '@/utils/apiErrors.utils';
import React, { useCallback, useMemo } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

const TodayTaskDetails = () => {
  const task = useAppSelector(selectSelectedTask);
  const { showToast } = useToast();
  const { t } = useLocalization();
  const [completeAllSteps, { isLoading: isCompletingAll }] =
    useCompleteAllStepsMutation();

  const dependencies = useMemo(() => {
    if (!task?.dependencies) return 'N/A';
    try {
      const parsedDeps = JSON.parse(task?.dependencies || '[]');
      if (Array.isArray(parsedDeps)) {
        return parsedDeps.join(', ');
      }
    } catch {}
  }, [task?.dependencies]);

  const handleCompleteAll = useCallback(async () => {
    try {
      if (!task?.task_id) return;
      await completeAllSteps(task.task_id).unwrap();
      showToast({
        type: 'success',
        message: t('roadmap.complete_all_steps_success'),
      });
    } catch (error) {
      showToast({
        type: 'failure',
        message: getApiErrorMessage(error),
      });
    }
  }, [task, completeAllSteps, showToast, t]);

  return (
    <AppScreen>
      <ScrollView
        contentInsetAdjustmentBehavior="always"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}>
        <AppView row spread centerV>
          <HeaderWithBack />
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
              <Divider />
              {task?.status !== 'completed' && (
                <PrimaryButton
                  label="roadmap.complete_all_steps"
                  onPress={handleCompleteAll}
                  isLoading={isCompletingAll}
                  shouldShowLoader
                />
              )}
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
  scrollContainer: { paddingBottom: 60 },
});

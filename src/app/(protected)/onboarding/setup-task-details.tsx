import { AppCard } from '@/components/AppCard';
import { AppList } from '@/components/AppList';
import { AppScreen } from '@/components/AppScreen';
import { Divider } from '@/components/Divider';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { LineDivider } from '@/components/LineDivider';
import { Loader } from '@/components/Loader';
import { TranslatedText } from '@/components/TranslatedText';
import { AppCheckbox, AppView } from '@/components/ui';
import { useGetRoadmapsQuery } from '@/hooks/roadmap';
import { TranslationKeysType } from '@/lib/localization/types/i18n.types';
import { useGetFriendsQuery } from '@/store/apis/friendsApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks/store.hooks';
import {
  selectAreAllSetupStepsCompleted,
  selectIsSetupTaskCompleted,
  selectSetupSteps,
  setSetupStepAction,
  toggleSetupStepAction,
} from '@/store/slices/onboardingSlice';
import type { OnboardingStepState } from '@/store/types/onboardingSlice.types';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { LayoutAnimation, ScrollView, StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

interface SetupStepConfig {
  key: keyof OnboardingStepState;
  titleKey: TranslationKeysType;
  detailsKey: TranslationKeysType;
}

const SETUP_STEPS: SetupStepConfig[] = [
  {
    key: 'reviewToday',
    titleKey: 'onboarding.setup_task.step_review_today',
    detailsKey: 'onboarding.setup_task.step_review_today_details',
  },
  {
    key: 'createOrReviewRoadmap',
    titleKey: 'onboarding.setup_task.step_create_review_roadmap',
    detailsKey: 'onboarding.setup_task.step_create_review_roadmap_details',
  },
  {
    key: 'inviteFriend',
    titleKey: 'onboarding.setup_task.step_invite_friend',
    detailsKey: 'onboarding.setup_task.step_invite_friend_details',
  },
  {
    key: 'addAnchor',
    titleKey: 'onboarding.setup_task.step_add_anchor',
    detailsKey: 'onboarding.setup_task.step_add_anchor_details',
  },
  {
    key: 'completeTask',
    titleKey: 'onboarding.setup_task.step_complete_task',
    detailsKey: 'onboarding.setup_task.step_complete_task_details',
  },
];

const SetupStepRow = ({
  step,
  isChecked,
  onToggleCheck,
}: {
  step: SetupStepConfig;
  isChecked: boolean;
  onToggleCheck: () => void;
}) => {
  return (
    <AppView row marginV-0 paddingH-16>
      <AppCheckbox
        value={isChecked}
        onValueChange={onToggleCheck}
        color={Colors.primary}
      />
      <AppView flex marginL-12>
        <TranslatedText
          style={isChecked ? styles.checkedTitle : undefined}
          translationKey={step.titleKey}
        />
        <Divider margin-4 />
        <TranslatedText
          xsm
          secondary
          style={styles.detailsText}
          translationKey={step.detailsKey}
        />
      </AppView>
    </AppView>
  );
};

const SetupTaskDetailsScreen = () => {
  const dispatch = useAppDispatch();
  const setupSteps = useAppSelector(selectSetupSteps);
  const allStepsCompleted = useAppSelector(selectAreAllSetupStepsCompleted);
  const isSetupTaskCompleted = useAppSelector(selectIsSetupTaskCompleted);
  const [completing, setCompleting] = useState(false);

  const { data: roadmaps, isLoading: roadmapsLoading } = useGetRoadmapsQuery();
  const { data: friends, isLoading: friendsLoading } = useGetFriendsQuery();

  const isLoadingData = roadmapsLoading || friendsLoading;

  useEffect(() => {
    if (isSetupTaskCompleted) return;

    const hasRoadmap = (roadmaps?.length ?? 0) > 0;
    const hasFriend = (friends?.length ?? 0) > 0;
    const hasAnchor = roadmaps?.some((r) => !!r.anchor_id) ?? false;

    if (hasRoadmap && !setupSteps.createOrReviewRoadmap) {
      dispatch(
        setSetupStepAction({ key: 'createOrReviewRoadmap', value: true }),
      );
    }
    if (hasFriend && !setupSteps.inviteFriend) {
      dispatch(setSetupStepAction({ key: 'inviteFriend', value: true }));
    }
    if (hasAnchor && !setupSteps.addAnchor) {
      dispatch(setSetupStepAction({ key: 'addAnchor', value: true }));
    }

    const allOtherStepsDone =
      setupSteps.reviewToday &&
      setupSteps.createOrReviewRoadmap &&
      setupSteps.inviteFriend &&
      setupSteps.addAnchor;
    if (allOtherStepsDone && !setupSteps.completeTask) {
      dispatch(setSetupStepAction({ key: 'completeTask', value: true }));
    }
  }, [roadmaps, friends, setupSteps, isSetupTaskCompleted, dispatch]);

  useEffect(() => {
    if (allStepsCompleted && !completing) {
      setCompleting(true);
      const timeout = setTimeout(() => {
        router.back();
      }, 800);
      return () => clearTimeout(timeout);
    }
  }, [allStepsCompleted, completing]);

  const handleToggleCheck = (stepKey: keyof OnboardingStepState) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    dispatch(toggleSetupStepAction(stepKey));
  };

  return (
    <AppScreen paddingH-16>
      <ScrollView
        contentInsetAdjustmentBehavior="always"
        showsVerticalScrollIndicator={false}>
        <AppView row spread centerV>
          <HeaderWithBack />
        </AppView>
        <Divider />

        <AppCard>
          <AppView row centerV>
            <AppView flex>
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
        </AppCard>

        <Divider />

        {allStepsCompleted ? (
          <AppCard paddingV-24 paddingH-16>
            <AppView center>
              <TranslatedText
                center
                translationKey="onboarding.setup_task.completion_message"
              />
            </AppView>
          </AppCard>
        ) : isLoadingData ? (
          <AppCard paddingV-32 paddingH-16>
            <AppView center>
              <Loader />
            </AppView>
          </AppCard>
        ) : (
          <AppCard paddingT-20 padding-0>
            <AppList
              keyExtractor={(item) => item.key}
              scrollEnabled={false}
              contentContainerStyle={{ flexGrow: 1 }}
              data={SETUP_STEPS}
              ItemSeparatorComponent={() => <LineDivider />}
              ListFooterComponent={() => <Divider />}
              renderItem={({ item: step }) => (
                <SetupStepRow
                  key={step.key}
                  step={step}
                  isChecked={setupSteps[step.key]}
                  onToggleCheck={() => handleToggleCheck(step.key)}
                />
              )}
            />
          </AppCard>
        )}
      </ScrollView>
    </AppScreen>
  );
};

export default SetupTaskDetailsScreen;

const styles = StyleSheet.create({
  indicator: {
    height: 40,
    width: 4,
    borderRadius: 2,
  },
  checkbox: {
    borderRadius: 4,
  },
  checkedTitle: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  detailsText: {
    lineHeight: 20,
  },
  stepDivider: {
    height: 1,
    backgroundColor: 'rgba(128, 128, 128, 0.15)',
    marginLeft: 36,
  },
});

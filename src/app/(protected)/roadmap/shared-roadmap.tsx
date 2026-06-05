import { AppIcon } from '@/components/AppIcon';
import { AppScreen } from '@/components/AppScreen';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { Loader } from '@/components/Loader';
import { PrimaryButton } from '@/components/PrimaryButton';
import { RoadmapCurrentStateOverview } from '@/components/roadmap/RoadmapCurrentStateOverview';
import { TranslatedText } from '@/components/TranslatedText';
import { AppView } from '@/components/ui';
import {
  useCopySharedRoadmapMutation,
  useGetRoadmapsQuery,
  useGetSharedRoadmapQuery,
} from '@/hooks/roadmap';
import { MilestoneType, Phase } from '@/hooks/roadmap/types/roadmap.types';
import { useLocalization } from '@/hooks/useLocalization';
import { useToast } from '@/hooks/useToast';
import { useAppDispatch, useAppSelector } from '@/store/hooks/store.hooks';
import { selectUser } from '@/store/slices/authSlice';
import { setDraftRoadmapAction } from '@/store/slices/roadmapDraftSlice';
import { Animations } from '@/utils/animation.utils';
import { getApiErrorMessage } from '@/utils/apiErrors.utils';
import { storeRoadmap, storeTasks } from '@/utils/roadmapTransfer';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

const SharedRoadmapScreen = () => {
  const { token } = useLocalSearchParams<{ token: string }>();
  const { t } = useLocalization();
  const { showToast } = useToast();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const isAuthenticated = !!user?.id;
  const {
    data: roadmap,
    isLoading,
    error,
  } = useGetSharedRoadmapQuery(token ?? '', { skip: !token });

  const { data: myRoadmaps } = useGetRoadmapsQuery(undefined, {
    skip: !isAuthenticated,
  });

  const [copySharedRoadmap, { isLoading: isCopying }] =
    useCopySharedRoadmapMutation();

  const alreadyOwned = useMemo(() => {
    if (!roadmap || !myRoadmaps) return false;
    return myRoadmaps.some(
      (r) => r.goal === roadmap.goal && r.days === roadmap.days,
    );
  }, [roadmap, myRoadmaps]);

  const handleCopyRoadmap = useCallback(async () => {
    if (!token) return;
    try {
      const newRoadmap = await copySharedRoadmap(token).unwrap();
      dispatch(setDraftRoadmapAction(newRoadmap));
      showToast({
        type: 'success',
        message: t('roadmap.shared_preview.copy_success'),
      });
      router.replace('/roadmap/roadmap-execution');
    } catch (err) {
      showToast({
        type: 'failure',
        message: getApiErrorMessage(err),
      });
    }
  }, [token, copySharedRoadmap, dispatch, showToast, t]);

  const handlePhasePress = useCallback(
    (phase: Phase) => {
      if (!roadmap) return;
      storeRoadmap(roadmap);
      router.navigate({
        pathname: '/settings/readonly-phase-milestones',
        params: {
          phaseId: phase.phase_id,
          phaseLabel: String(phase.order_index),
        },
      });
    },
    [roadmap],
  );

  const handleOverviewPress = useCallback(
    (phase?: Phase) => {
      if (!roadmap) return;
      if (roadmap.type === 'custom_made') {
        storeRoadmap(roadmap);
        router.navigate({ pathname: '/settings/readonly-phase-milestones' });
        return;
      }
      if (phase) {
        storeRoadmap(roadmap);
        router.navigate({ pathname: '/settings/readonly-phase-details' });
      }
    },
    [roadmap],
  );

  const handleMilestonePress = useCallback(
    (milestone: MilestoneType, phase?: Phase) => {
      storeTasks(milestone.tasks ?? []);
      router.navigate({
        pathname: '/settings/readonly-phase-milestones-tasks',
        params: {
          phaseLabel: phase ? String(phase.order_index) : undefined,
          milestoneLabel: String(milestone.order_index),
        },
      });
    },
    [],
  );

  if (!token) {
    return (
      <AppScreen safeArea>
        <HeaderWithBack />
        <AppView flex center paddingH-24>
          <TranslatedText
            body1
            secondary
            translationKey="roadmap.shared_preview.not_found"
          />
        </AppView>
      </AppScreen>
    );
  }

  if (isLoading) {
    return (
      <AppScreen safeArea>
        <HeaderWithBack />
        <Loader />
      </AppScreen>
    );
  }

  if (error || !roadmap) {
    return (
      <AppScreen safeArea>
        <HeaderWithBack />
        <AppView flex center paddingH-24 gap-16>
          <AppIcon
            set="Feather"
            name="link-2"
            size={48}
            color={Colors.secondary}
          />
          <TranslatedText
            body1
            secondary
            center
            translationKey="roadmap.shared_preview.not_found"
          />
        </AppView>
      </AppScreen>
    );
  }

  return (
    <AppScreen safeArea>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}>
        <AppView row spread centerV>
          <HeaderWithBack />
        </AppView>

        <AppView reanimated layout={Animations.Layout.Springify()}>
          <AppView
            key="overview-tab"
            flex
            gap-12
            reanimated
            entering={Animations.Entry.FadeInDown()}
            exiting={Animations.Exit.FadeOutDown()}>
            <RoadmapCurrentStateOverview
              key={roadmap.roadmap_id}
              roadmap={roadmap}
              roadmapCreateStartControls={null}
              onOverviewPress={handleOverviewPress}
              onPhasePress={handlePhasePress}
              onMilestonePress={handleMilestonePress}
            />
          </AppView>
        </AppView>
      </ScrollView>

      <AppView paddingH-16 paddingB-24>
        {alreadyOwned ? (
          <AppView
            row
            center
            gap-8
            padding-14
            br10
            style={[
              styles.alreadyOwnedBanner,
              { borderColor: Colors.outline },
            ]}>
            <AppIcon
              set="Feather"
              name="check-circle"
              size={18}
              color={Colors.success}
            />
            <TranslatedText
              body2
              textColor
              translationKey="roadmap.shared_preview.already_added"
            />
          </AppView>
        ) : (
          <PrimaryButton
            label="roadmap.shared_preview.add_button"
            shouldShowLoader
            isLoading={isCopying}
            onPress={handleCopyRoadmap}
          />
        )}
      </AppView>
    </AppScreen>
  );
};

export default SharedRoadmapScreen;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    width: '50%',
  },
  signInBanner: {
    borderWidth: 1,
    borderRadius: 8,
  },
  alreadyOwnedBanner: {
    borderWidth: 1,
    borderRadius: 8,
  },
});

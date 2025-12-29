import { AppButton } from '@/components/AppButton';
import { AppIcon } from '@/components/AppIcon';
import { AppKeyboardController } from '@/components/AppKeyboardController';
import { AppList } from '@/components/AppList';
import { AppModal } from '@/components/AppModal';
import { ConfirmationDialog } from '@/components/ConfirmationDialog';
import { Divider } from '@/components/Divider';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { LineDivider } from '@/components/LineDivider';
import { Loader } from '@/components/Loader';
import { PrimaryButton } from '@/components/PrimaryButton';
import { AddEditCustomRoadmapForm } from '@/components/roadmap/AddEditCustomRoadmapForm';
import { AIRoadmapDetails } from '@/components/roadmap/ai-roamap/AIRoadmapDetails';
import { RoadmapDetails } from '@/components/roadmap/RoadmapDetails';
import { TranslatedText } from '@/components/TranslatedText';
import { AppText, AppView } from '@/components/ui';
import { useGetFriendsQuery } from '@/hooks/friends';
import { FriendResponse } from '@/hooks/friends/types/friends.types';
import {
  useCreateAnchorRequestMutation,
  useCreateRoadmapMutation,
  useDeleteRoadmapMutation,
  useGetRoadmapByIdQuery,
  useStartRoadmapMutation,
} from '@/hooks/roadmap';
import { useLocalization } from '@/hooks/useLocalization';
import { useToast } from '@/hooks/useToast';
import { useAppSelector } from '@/store/hooks/store.hooks';
import { resetCreationStateAction } from '@/store/slices/aiRoadmapCreationSlice';
import {
  resetDraftAction,
  selectDraftRoadmap,
  setDraftRoadmapAction,
} from '@/store/slices/roadmapDraftSlice';
import { Animations } from '@/utils/animation.utils';
import { getApiErrorMessage } from '@/utils/apiErrors.utils';
import { LegendListRenderItemProps } from '@legendapp/list';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { LinearTransition } from 'react-native-reanimated';
import { Colors } from 'react-native-ui-lib';
import { useDispatch } from 'react-redux';

const RoadmapDetailsPage = () => {
  const selectedRoadmap = useAppSelector(selectDraftRoadmap);
  const {
    data: roadmap = selectedRoadmap,
    isLoading: isRoadmapLoading,
    error,
  } = useGetRoadmapByIdQuery(selectedRoadmap?.roadmap_id || '', {
    skip: !selectedRoadmap?.roadmap_id,
    refetchOnMountOrArgChange: true,
  });

  const [isDeleteMilestoneDialogOpen, setIsDeleteMilestoneDialogOpen] =
    useState(false);
  const [isAnchorSheetVisible, setIsAnchorSheetVisible] = useState(false);

  const { t } = useLocalization();
  const { showToast } = useToast();
  const dispatch = useDispatch();
  const [deleteRoadmap, { isLoading }] = useDeleteRoadmapMutation();
  const [createRoadmap, { isLoading: isCreatingRoadmap }] =
    useCreateRoadmapMutation();

  const [startRoadmap, { isLoading: isStartingRoadmap }] =
    useStartRoadmapMutation();

  const { data: friendsData, isLoading: isLoadingFriends } =
    useGetFriendsQuery();
  const [createAnchorRequest, { isLoading: isCreatingAnchorRequest }] =
    useCreateAnchorRequestMutation();

  useEffect(() => {
    if (error) {
      dispatch(resetDraftAction());
      dispatch(resetCreationStateAction());
      router.back();
      showToast({
        type: 'failure',
        message: getApiErrorMessage(error),
      });
    }
  }, [error, showToast, dispatch]);

  useEffect(() => {
    if (
      roadmap?.roadmap_id &&
      !!roadmap?.goal &&
      roadmap.roadmap_id !== selectedRoadmap?.roadmap_id
    ) {
      dispatch(setDraftRoadmapAction(roadmap));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    roadmap?.roadmap_id,
    roadmap?.goal,
    selectedRoadmap?.roadmap_id,
    dispatch,
  ]);

  const [isEditing, setIsEditing] = useState(false);
  const hideDialog = () => setIsDeleteMilestoneDialogOpen(false);
  const showDialog = () => setIsDeleteMilestoneDialogOpen(true);

  const onAnchorPress = useCallback(() => {
    setIsAnchorSheetVisible(true);
  }, []);

  const onSelectAnchor = useCallback(
    async (friendId: string, friendName: string) => {
      if (!roadmap?.roadmap_id) return;

      try {
        await createAnchorRequest({
          roadmapId: roadmap.roadmap_id,
          anchorId: friendId,
        }).unwrap();

        showToast({
          type: 'success',
          message: t('common.anchor_request_sent', { name: friendName }),
        });
        setIsAnchorSheetVisible(false);
      } catch (error) {
        showToast({
          type: 'failure',
          message: getApiErrorMessage(error),
        });
      }
    },
    [roadmap?.roadmap_id, createAnchorRequest, showToast, t],
  );

  const onDeleteConfirmation = async () => {
    hideDialog();
    if (roadmap.roadmap_id) {
      try {
        await deleteRoadmap(roadmap.roadmap_id).unwrap();
        onDeleteSuccess();
      } catch (error) {
        showToast({
          type: 'failure',
          message: getApiErrorMessage(error),
        });
      }
    }
  };

  const onDeleteSuccess = () => {
    showToast({
      type: 'success',
      message: t('common.deleted_successfully'),
    });
    router.dismissTo('/(protected)/(tabs)/progress');
  };

  const onBackPress = () => {
    router.back();
  };

  const toggleEditMode = () => setIsEditing((edit) => !edit);
  const onCreateRoadmap = async () => {
    try {
      const {
        goal,
        description,
        days,
        completed,
        milestones,
        macro_map,
        reason,
        type,
      } = roadmap;

      const createdRoadmap = await createRoadmap({
        goal,
        description,
        days,
        completed,
        milestones,
        macro_map,
        reason,
        type,
      }).unwrap();
      dispatch(setDraftRoadmapAction(createdRoadmap));
      showToast({
        type: 'success',
        message: t('common.created_successfully'),
      });
    } catch (error) {
      showToast({
        type: 'failure',
        message: getApiErrorMessage(error),
      });
    }
  };

  const onStartRoadmap = async () => {
    try {
      const finalRoadmap = await startRoadmap(roadmap.roadmap_id).unwrap();
      dispatch(
        setDraftRoadmapAction({
          ...finalRoadmap,
          macro_map: roadmap?.macro_map,
        }),
      );
      showToast({
        type: 'success',
        message: t('common.started_successfully'),
      });
    } catch (error) {
      showToast({
        type: 'failure',
        message: getApiErrorMessage(error),
      });
    }
  };

  const isRoadmapStarted =
    roadmap.start_date !== '0001-01-01T00:00:00Z' &&
    roadmap.milestones?.[0]?.date !== '0001-01-01T00:00:00Z' &&
    roadmap.start_date !== null;

  const hasMilestones =
    roadmap.type === 'ai_generated'
      ? (
          roadmap?.macro_map?.phases?.flatMap(
            (phase) => phase.macro_milestones,
          ) || []
        ).length > 0
      : (roadmap.milestones || []).length > 0;

  const CreateRoadmapButton = () => {
    if (
      roadmap?.type === 'ai_generated' ||
      !!roadmap?.roadmap_id ||
      !hasMilestones
    ) {
      return null;
    }

    return (
      <PrimaryButton
        label="tabs.create_tab.submit_roadmap"
        onPress={onCreateRoadmap}
        shouldShowLoader
        isLoading={isCreatingRoadmap || isStartingRoadmap}
      />
    );
  };

  const StartRoadmapButton = () => {
    if (!hasMilestones) return null;
    if (isRoadmapStarted) return null;
    return (
      <PrimaryButton
        label="common.start_roadmap"
        shouldShowLoader
        isLoading={isStartingRoadmap || isCreatingRoadmap}
        onPress={onStartRoadmap}
      />
    );
  };

  const renderAnchorItem = ({
    item,
  }: LegendListRenderItemProps<FriendResponse>) => (
    <AppButton
      bg-cardBG
      style={styles.friendCard}
      disabled={isCreatingAnchorRequest}
      onPress={() =>
        onSelectAnchor(
          item.friend.user_id,
          `${item.friend.first_name} ${item.friend.last_name}`,
        )
      }>
      <AppView row centerV spread>
        <AppView row centerV gap-16>
          <AppView style={styles.avatarPlaceholder} center bg-primary>
            <AppIcon name="user" size={16} color={Colors.secondary} />
          </AppView>
          <AppView flex gap-4>
            <AppText body2 textColor>
              {item.friend.first_name} {item.friend.last_name}
            </AppText>
            {item.friend.email && (
              <AppText xsm secondary>
                {item.friend.email}
              </AppText>
            )}
          </AppView>
        </AppView>
        {isCreatingAnchorRequest && (
          <ActivityIndicator size="small" color={Colors.primary} />
        )}
      </AppView>
    </AppButton>
  );

  return (
    <AppView flex-1 reanimated layout={LinearTransition}>
      {(isLoading || (isRoadmapLoading && !roadmap?.goal)) && <Loader />}
      <AppKeyboardController>
        <AppView spread row gap-16>
          <HeaderWithBack
            headerText={roadmap.goal}
            flex-1
            goBackOnPress={false}
            onBackPress={onBackPress}
          />
          <AppView row gap-20 top>
            {!isEditing && !!roadmap?.roadmap_id && (
              <AppButton onPress={onAnchorPress}>
                <AppIcon set="Feather" name="anchor" size={20} />
              </AppButton>
            )}
            {isEditing && (
              <AppButton onPress={toggleEditMode}>
                <AppIcon
                  set="Feather"
                  name={isEditing ? 'x' : 'edit'}
                  size={22}
                />
              </AppButton>
            )}
            {!!roadmap?.roadmap_id && (
              <AppButton onPress={showDialog}>
                <AppIcon name={'delete'} color={Colors.error} size={20} />
              </AppButton>
            )}
          </AppView>
        </AppView>
        <Divider margin-16 />
        <AppView reanimated layout={Animations.Layout.Springify()}>
          {isEditing && (
            <AppView
              reanimated
              entering={Animations.Entry.FadeInDownWithSpring().delay(200)}
              exiting={Animations.Exit.FadeOutDown()}>
              <AddEditCustomRoadmapForm
                mode="edit"
                onSuccess={() => setIsEditing(false)}
              />
            </AppView>
          )}

          {!isEditing && (
            <AppView
              marginB-50
              reanimated
              entering={Animations.Entry.FadeInDownWithSpring().delay(200)}
              exiting={Animations.Exit.FadeOutDown()}>
              {roadmap?.type === 'ai_generated' ? (
                <AIRoadmapDetails
                  roadmap={roadmap}
                  isRoadmapLoading={isRoadmapLoading}
                  toggleEditMode={toggleEditMode}
                />
              ) : (
                <RoadmapDetails
                  roadmap={roadmap}
                  toggleEditMode={toggleEditMode}
                />
              )}
              <Divider margin-8 />

              {hasMilestones && (
                <>
                  {isRoadmapLoading ? (
                    <Loader
                      marginT-16
                      transparent
                      containerStyle={{ position: 'relative', marginTop: 16 }}
                    />
                  ) : (
                    <AppView
                      reanimated
                      entering={Animations.Entry.FadeInDownWithSpring()}
                      exiting={Animations.Exit.FadeOutDown()}>
                      <CreateRoadmapButton />
                      <StartRoadmapButton />
                    </AppView>
                  )}
                </>
              )}
            </AppView>
          )}
        </AppView>

        <ConfirmationDialog
          isDialogOpen={isDeleteMilestoneDialogOpen}
          onDismiss={hideDialog}
          title="common.are_you_sure"
          subtitle="common.delete_roadmap"
          onPositivePress={onDeleteConfirmation}
          onNegativePress={hideDialog}
          positiveText="common.remove"
          negativeText="common.cancel"
          positiveButtonIcon={
            <AppIcon name="delete" color={Colors.textOnPrimary} size={14} />
          }
          negativeButtonIcon={
            <AppIcon name="close" color={Colors.textOnPrimary} size={14} />
          }
        />
      </AppKeyboardController>
      <AppModal
        visible={isAnchorSheetVisible}
        setIsVisible={setIsAnchorSheetVisible}>
        <AppView paddingB-24 flex-1>
          <TranslatedText
            body1
            semibold
            textColor
            translationKey="roadmap.select_anchor"
          />
          <LineDivider />

          {isLoadingFriends && (
            <AppView center paddingV-40>
              <ActivityIndicator size="small" color={Colors.primary} />
            </AppView>
          )}
          <AppList
            data={friendsData || []}
            keyExtractor={(item, index) => item.friendship_id + index}
            showsVerticalScrollIndicator={false}
            bounces={false}
            renderItem={renderAnchorItem}
            ItemSeparatorComponent={() => <Divider />}
            ListEmptyComponent={() => (
              <AppView flex-1 center paddingV-60>
                <AppIcon name="user" size={48} color={Colors.secondary} />
                <TranslatedText
                  marginT-16
                  secondary
                  translationKey="settings.no_friends_found"
                />
              </AppView>
            )}
          />
        </AppView>
      </AppModal>
    </AppView>
  );
};

const styles = StyleSheet.create({
  friendCard: {
    borderRadius: 8,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
});

export default RoadmapDetailsPage;

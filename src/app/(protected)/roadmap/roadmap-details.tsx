import { AppAvatar } from '@/components/AppAvatar';
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
  useRemoveAnchorMutation,
  useStartRoadmapMutation,
} from '@/hooks/roadmap';
import { useLocalization } from '@/hooks/useLocalization';
import { useToast } from '@/hooks/useToast';
import { roadmapApi } from '@/store/apis/roadmapApi';
import { taskApi } from '@/store/apis/taskApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks/store.hooks';
import { resetCreationStateAction } from '@/store/slices/aiRoadmapCreationSlice';
import {
  resetDraftAction,
  selectDraftRoadmap,
  setDraftRoadmapAction,
} from '@/store/slices/roadmapDraftSlice';
import { Animations } from '@/utils/animation.utils';
import { getApiErrorMessage } from '@/utils/apiErrors.utils';
import { DateUtils } from '@/utils/date.utils';
import { getAllMilestones } from '@/utils/roadmap.utils';
import { LegendListRenderItemProps } from '@legendapp/list';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { LinearTransition } from 'react-native-reanimated';
import { Colors } from 'react-native-ui-lib';

const RoadmapDetailsPage = () => {
  const selectedRoadmap = useAppSelector(selectDraftRoadmap);

  const [isDeleteMilestoneDialogOpen, setIsDeleteMilestoneDialogOpen] =
    useState(false);
  const [isAnchorSheetVisible, setIsAnchorSheetVisible] = useState(false);

  const { t } = useLocalization();
  const { showToast } = useToast();
  const dispatch = useAppDispatch();
  const [deleteRoadmap, { isLoading }] = useDeleteRoadmapMutation();
  const [createRoadmap, { isLoading: isCreatingRoadmap }] =
    useCreateRoadmapMutation();

  const [startRoadmap, { isLoading: isStartingRoadmap }] =
    useStartRoadmapMutation();

  const { data: friendsData, isLoading: isLoadingFriends } =
    useGetFriendsQuery();
  const [createAnchorRequest, { isLoading: isCreatingAnchorRequest }] =
    useCreateAnchorRequestMutation();
  const [removeAnchor, { isLoading: isRemovingAnchor }] =
    useRemoveAnchorMutation();

  const {
    data,
    isLoading: isRoadmapLoading,
    error,
    isFetching: isRoadmapFetching,
    refetch,
  } = useGetRoadmapByIdQuery(selectedRoadmap?.roadmap_id, {
    skip: !selectedRoadmap?.roadmap_id,
    refetchOnMountOrArgChange: 20,
    refetchOnFocus: true,
  });

  const roadmap = data ?? selectedRoadmap;

  useEffect(() => {
    if (error) {
      dispatch(roadmapApi.util.resetApiState());
      dispatch(resetDraftAction());
      dispatch(resetCreationStateAction());
      router.dismissTo('/(protected)/(tabs)/progress');
      showToast({
        type: 'failure',
        message: getApiErrorMessage(error),
      });
    }
  }, [error, showToast, dispatch]);

  useEffect(() => {
    if (
      data?.roadmap_id &&
      data?.goal &&
      selectedRoadmap?.roadmap_id === data.roadmap_id &&
      !selectedRoadmap?.goal
    ) {
      dispatch(setDraftRoadmapAction(data));
    }
  }, [data, selectedRoadmap?.roadmap_id, selectedRoadmap?.goal, dispatch]);

  const [isEditing, setIsEditing] = useState(false);
  const hideDialog = () => setIsDeleteMilestoneDialogOpen(false);
  const showDialog = () => setIsDeleteMilestoneDialogOpen(true);

  const onAnchorPress = useCallback(async () => {
    try {
      setIsAnchorSheetVisible(true);
      const refetchedRoadmap = await refetch().unwrap();
      dispatch(setDraftRoadmapAction(refetchedRoadmap));
    } catch {
    } finally {
    }
  }, [refetch, dispatch]);

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

  const onRemoveAnchor = useCallback(async () => {
    if (!roadmap?.roadmap_id) return;

    try {
      await removeAnchor(roadmap.roadmap_id).unwrap();
      showToast({
        type: 'success',
        message: t('roadmap.anchor_removed_successfully'),
      });
      setIsAnchorSheetVisible(false);
    } catch (error) {
      showToast({
        type: 'failure',
        message: getApiErrorMessage(error),
      });
    }
  }, [removeAnchor, showToast, t, roadmap?.roadmap_id]);

  const onDeleteConfirmation = async () => {
    hideDialog();
    if (roadmap.roadmap_id) {
      try {
        await deleteRoadmap(roadmap.roadmap_id).unwrap();
        dispatch(
          taskApi.endpoints.getUserTasksByStartDate.initiate(
            DateUtils.formatDate(DateUtils.createDate(), 'YYYY-MM-DD'),
            { forceRefetch: true },
          ),
        );
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
        phases,
        reason,
        type,
      } = roadmap;

      const createdRoadmap = await createRoadmap({
        goal,
        description,
        days,
        completed,
        milestones,
        phases,
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
          phases: roadmap?.phases,
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

  const milestones = getAllMilestones(roadmap);

  const isRoadmapStarted =
    roadmap.start_date !== '0001-01-01T00:00:00Z' &&
    milestones?.[0]?.date !== '0001-01-01T00:00:00Z' &&
    roadmap.start_date !== null;

  const hasMilestones = milestones.length > 0;

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

  const anchorID = roadmap?.anchor_id || selectedRoadmap?.anchor_id;
  const isAnchorAssigned = !!anchorID;

  const filteredFriends = isAnchorAssigned
    ? friendsData?.filter((friend) => friend.friend.user_id === anchorID) || []
    : friendsData || [];

  const renderAnchorItem = ({
    item,
  }: LegendListRenderItemProps<FriendResponse>) => {
    const isCurrentAnchor = item.friend.user_id === anchorID;
    const isLoading = isCreatingAnchorRequest || isRemovingAnchor;

    return (
      <AppView row centerV flex>
        <AppView row centerV gap-16 flex>
          <AppView style={styles.avatarPlaceholder} center bg-primary>
            <AppAvatar />
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
        <AppButton
          bg-cardBG
          style={styles.friendCard}
          disabled={isLoading}
          onPress={() =>
            isCurrentAnchor
              ? onRemoveAnchor()
              : onSelectAnchor(
                  item.friend.user_id,
                  `${item.friend.first_name} ${item.friend.last_name}`,
                )
          }>
          {isLoading ? (
            <Loader containerStyle={{ position: 'relative' }} />
          ) : (
            <AppIcon
              set="Ionicons"
              name={isCurrentAnchor ? 'remove-circle' : 'add-circle'}
              size={24}
            />
          )}
        </AppButton>
      </AppView>
    );
  };

  const isModalContentLoading =
    isRoadmapFetching || isRoadmapLoading || isLoadingFriends;

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
                  {isRoadmapLoading && roadmap.goal ? (
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
            translationKey={
              isAnchorAssigned
                ? 'roadmap.manage_anchor'
                : 'roadmap.select_anchor'
            }
          />
          <LineDivider />
          <AppView flex-1>
            {isModalContentLoading && (
              <AppView center marginT-8 marginB-20>
                <Loader transparent containerStyle={{ position: 'relative' }} />
              </AppView>
            )}
            <AppList
              data={filteredFriends}
              keyExtractor={(item, index) => item.friendship_id + index}
              showsVerticalScrollIndicator={false}
              bounces={false}
              extraData={[isModalContentLoading, roadmap, roadmap?.anchor_id]}
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
  iconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
});

export default RoadmapDetailsPage;

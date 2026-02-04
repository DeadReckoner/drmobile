import { AppAvatar } from '@/components/AppAvatar';
import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppIcon } from '@/components/AppIcon';
import { AppKeyboardController } from '@/components/AppKeyboardController';
import { AppList } from '@/components/AppList';
import { AppModal } from '@/components/AppModal';
import { ConfirmationDialog } from '@/components/ConfirmationDialog';
import { Divider } from '@/components/Divider';
import { HabitInfoItem } from '@/components/HabitInfoItem';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { LineDivider } from '@/components/LineDivider';
import { Loader } from '@/components/Loader';
import { CreateHabitTaskForm } from '@/components/roadmap/CreateHabitTaskForm';
import { ScreenHeader } from '@/components/ScreenHeader';
import { TranslatedText } from '@/components/TranslatedText';
import { AppText, AppView } from '@/components/ui';
import { WeekdaySelector } from '@/components/WeekdaySelector';
import { useGetFriendsQuery } from '@/hooks/friends';
import { FriendResponse } from '@/hooks/friends/types/friends.types';
import {
  useCreateHabitAnchorRequestMutation,
  useRemoveHabitAnchorMutation,
} from '@/hooks/roadmap';
import { FormEditModeType } from '@/hooks/roadmap/types/roadmap.types';
import { useLocalization } from '@/hooks/useLocalization';
import { useToast } from '@/hooks/useToast';
import { useGetHabitQuery } from '@/store/apis/habitsApi';
import { Animations } from '@/utils/animation.utils';
import { getApiErrorMessage } from '@/utils/apiErrors.utils';
import { DateUtils } from '@/utils/date.utils';
import { LegendListRenderItemProps } from '@legendapp/list';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

const AddEditHabitTask = () => {
  const {
    mode,
    habitId,
    isHabitEditing = false,
  } = useLocalSearchParams<{
    mode: FormEditModeType;
    habitId: string;
    isHabitEditing: string;
  }>();
  const { data: selectedTask, refetch } = useGetHabitQuery(habitId, {
    skip: !habitId,
  });
  const { showToast } = useToast();
  const { t } = useLocalization();
  const [isEditing, setIsEditing] = useState(isHabitEditing === 'true');

  const { data: friendsData, isLoading: isLoadingFriends } =
    useGetFriendsQuery();
  const [createHabitAnchorRequest, { isLoading: isCreatingAnchorRequest }] =
    useCreateHabitAnchorRequestMutation();
  const [removeHabitAnchor, { isLoading: isRemovingAnchor }] =
    useRemoveHabitAnchorMutation();

  const [isAnchorSheetVisible, setIsAnchorSheetVisible] = useState(false);
  const [processingFriendId, setProcessingFriendId] = useState<string | null>(
    null,
  );

  const canEdit = mode === 'edit';

  const [isDeleteMilestoneDialogOpen, setIsDeleteMilestoneDialogOpen] =
    useState(false);

  const hideDialog = () => setIsDeleteMilestoneDialogOpen(false);
  const showDialog = () => setIsDeleteMilestoneDialogOpen(true);

  const onAnchorPress = useCallback(() => {
    refetch();
    setIsAnchorSheetVisible(true);
  }, [refetch]);

  const onSelectAnchor = useCallback(
    async (friendId: string, friendName: string) => {
      if (!selectedTask?.habit_id) return;

      setProcessingFriendId(friendId);
      try {
        await createHabitAnchorRequest({
          habitId: selectedTask.habit_id,
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
      } finally {
        setProcessingFriendId(null);
      }
    },
    [selectedTask?.habit_id, createHabitAnchorRequest, showToast, t],
  );

  const onRemoveAnchor = useCallback(
    async (friendId: string) => {
      if (!selectedTask?.habit_id) return;

      setProcessingFriendId(friendId);
      try {
        await removeHabitAnchor(selectedTask.habit_id).unwrap();
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
      } finally {
        setProcessingFriendId(null);
      }
    },
    [selectedTask?.habit_id, removeHabitAnchor, showToast, t],
  );

  const onDeleteConfirmation = () => {
    showToast({
      type: 'success',
      message: t('common.deleted_successfully'),
    });
    router.back();
  };

  const anchorID = selectedTask?.anchor_id;
  const isAnchorAssigned = !!anchorID;

  const filteredFriends = isAnchorAssigned
    ? friendsData?.filter((friend) => friend.friend.user_id === anchorID) || []
    : friendsData || [];

  const renderAnchorItem = ({
    item,
  }: LegendListRenderItemProps<FriendResponse>) => {
    const isCurrentAnchor = item.friend.user_id === anchorID;
    const isProcessingThisItem = processingFriendId === item.friend.user_id;
    const isLoading =
      isProcessingThisItem && (isCreatingAnchorRequest || isRemovingAnchor);

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
          disabled={!!processingFriendId || isLoading}
          onPress={() =>
            isCurrentAnchor
              ? onRemoveAnchor(item.friend.user_id)
              : onSelectAnchor(
                  item.friend.user_id,
                  `${item.friend.first_name} ${item.friend.last_name}`,
                )
          }>
          {isLoading || isProcessingThisItem ? (
            <Loader
              transparent
              containerStyle={{ position: 'relative' }}
              size={24}
            />
          ) : (
            <AppIcon
              set="Ionicons"
              name={
                isAnchorAssigned && isCurrentAnchor
                  ? 'remove-circle'
                  : 'add-circle'
              }
              size={24}
            />
          )}
        </AppButton>
      </AppView>
    );
  };

  const isModalContentLoading = isLoadingFriends;

  const HabitInfoCard = () => {
    return (
      <AppView
        reanimated
        entering={Animations.Entry.FadeInDownWithSpring()}
        exiting={Animations.Exit.FadeOutDown()}>
        <AppCard>
          <AppText body1 textColor>
            {selectedTask?.title}
          </AppText>
          <LineDivider marginV-12 />
          {selectedTask?.description && (
            <HabitInfoItem
              translationKey="habits.description_label"
              value={selectedTask.description}
            />
          )}

          {selectedTask?.recurrence_type === 'weekly' &&
            selectedTask?.days_of_week && (
              <>
                <WeekdaySelector disabled value={selectedTask.days_of_week} />
                <Divider />
              </>
            )}

          {selectedTask?.recurrence_type === 'monthly' &&
            selectedTask?.day_of_month && (
              <HabitInfoItem
                translationKey="habits.day_of_month_label"
                value={selectedTask.day_of_month}
              />
            )}

          {selectedTask?.recurrence_type === 'none' &&
            selectedTask?.due_date && (
              <HabitInfoItem
                translationKey="habits.due_date_label"
                value={DateUtils.formatDate(
                  selectedTask.due_date,
                  'MMM DD, YYYY',
                )}
              />
            )}

          {selectedTask?.start_date && (
            <HabitInfoItem
              translationKey="habits.start_date_label"
              value={DateUtils.formatDate(
                selectedTask.start_date,
                'MMM DD, YYYY',
              )}
            />
          )}

          {selectedTask?.end_date && (
            <HabitInfoItem
              translationKey="habits.end_date_label"
              value={DateUtils.formatDate(
                selectedTask.end_date,
                'MMM DD, YYYY',
              )}
            />
          )}
        </AppCard>
        <Divider margin-16 />
      </AppView>
    );
  };

  return (
    <>
      <AppKeyboardController>
        <AppView spread row centerV>
          <AppView>{!isEditing && <HeaderWithBack />}</AppView>
          {canEdit && (
            <AppView row gap-16 center style={styles.headerOptions}>
              {!!selectedTask?.habit_id && (
                <AppButton onPress={onAnchorPress}>
                  <AppIcon set="Feather" name="anchor" size={20} />
                </AppButton>
              )}
              <AppButton
                onPress={() =>
                  isHabitEditing === 'true'
                    ? router.back()
                    : setIsEditing((edit) => !edit)
                }>
                <AppIcon
                  set="Feather"
                  name={isEditing ? 'x' : 'edit'}
                  size={isEditing ? 22 : 20}
                />
              </AppButton>
              {!isEditing && (
                <AppButton onPress={showDialog}>
                  <AppIcon name={'delete'} color={Colors.error} size={20} />
                </AppButton>
              )}
            </AppView>
          )}
        </AppView>
        <Divider margin-16 />
        <AppView reanimated paddingL-4 layout={Animations.Layout.Springify()}>
          {!canEdit ? (
            mode === 'view' ? (
              <HabitInfoCard />
            ) : (
              <AppView
                reanimated
                entering={Animations.Entry.FadeInDown()}
                exiting={Animations.Exit.FadeOutDown()}>
                <ScreenHeader
                  title="tabs.create_tab.add_new_task_or_habit"
                  subtitle="tabs.create_tab.add_new_task_desc"
                  titleProps={{ body1: true }}
                  subtileProps={{ xsm: true }}
                  marginT-0
                />
                <Divider margin-16 />
                <CreateHabitTaskForm
                  mode="create"
                  onSuccess={() => router.dismissTo('/(protected)/(tabs)')}
                />
              </AppView>
            )
          ) : null}

          {selectedTask && canEdit && !isEditing && <HabitInfoCard />}

          {isEditing && (
            <AppView
              reanimated
              entering={Animations.Entry.FadeInDown()}
              exiting={Animations.Exit.FadeOutDown()}>
              <CreateHabitTaskForm
                mode="edit"
                onSuccess={() => setIsEditing(false)}
              />
            </AppView>
          )}
        </AppView>
        <ConfirmationDialog
          isDialogOpen={isDeleteMilestoneDialogOpen}
          onDismiss={hideDialog}
          title="common.are_you_sure"
          subtitle="common.delete_task"
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

        <Divider margin-24 />
      </AppKeyboardController>

      <AppModal
        visible={isAnchorSheetVisible}
        setIsVisible={setIsAnchorSheetVisible}>
        <AppView paddingB-20 paddingT-10>
          <AppView row spread centerV marginB-20>
            <TranslatedText
              heading
              translationKey={
                isAnchorAssigned
                  ? 'roadmap.manage_anchor'
                  : 'roadmap.select_anchor'
              }
            />
            <AppButton onPress={() => setIsAnchorSheetVisible(false)}>
              <AppIcon set="Feather" name="x" size={24} />
            </AppButton>
          </AppView>
          {isModalContentLoading && <Loader />}
          {!isModalContentLoading && (
            <AppView>
              <AppList
                data={filteredFriends}
                renderItem={renderAnchorItem}
                extraData={[processingFriendId]}
                ItemSeparatorComponent={() => <Divider />}
                keyExtractor={(item) => item.friendship_id}
                estimatedItemSize={70}
              />
            </AppView>
          )}
        </AppView>
      </AppModal>
    </>
  );
};

export default AddEditHabitTask;

const styles = StyleSheet.create({
  scrollContainer: {
    paddingVertical: 60,
  },
  headerOptions: {
    minHeight: 24,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  friendCard: {
    padding: 10,
    borderRadius: 8,
  },
});

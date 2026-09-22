import { AppActionSheetModal } from '@/components/AppActionSheetModal';
import { AppAvatar } from '@/components/AppAvatar';
import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppIcon } from '@/components/AppIcon';
import { AppList } from '@/components/AppList';
import { AppScreen } from '@/components/AppScreen';
import { AppSegmentControl } from '@/components/AppSegmentControl';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { Loader } from '@/components/Loader';
import { TranslatedText } from '@/components/TranslatedText';
import { AppText, AppView } from '@/components/ui';
import { RoadmapType } from '@/hooks/roadmap/types/roadmap.types';
import { useLocalization } from '@/hooks/useLocalization';
import { useToast } from '@/hooks/useToast';
import {
  useBlockFriendMutation,
  useGetFriendProfileQuery,
  useRemoveFriendMutation,
  useSendFriendRequestMutation,
} from '@/store/apis/friendsApi';
import { HabitType } from '@/store/apis/types/habitsApi.types';
import { getApiErrorMessage } from '@/utils/apiErrors.utils';
import { storeHabit, storeRoadmap } from '@/utils/roadmapTransfer';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

const FriendDetails = () => {
  const { t } = useLocalization();
  const { showToast } = useToast();
  const params = useLocalSearchParams<{
    friendId: string;
    friendName: string;
    friendEmail: string;
    friendshipStatus?: string;
  }>();
  const friendId = params['friendId'];
  const {
    data: friendProfileData,
    isLoading,
    error,
    isFetching,
  } = useGetFriendProfileQuery(friendId, {
    skip: !friendId,
    refetchOnMountOrArgChange: true,
  });

  const friendNameParam =
    `${friendProfileData?.user.first_name || ''} ${friendProfileData?.user.last_name || ''}`?.trim() ||
    (params['friendName'] as string | undefined)?.trim() ||
    t('common.unknown_user');

  const friendEmailParam =
    friendProfileData?.user.email?.trim() ||
    (params['friendEmail'] as string | undefined);

  const [isSettingsSheetVisible, setIsSettingsSheetVisible] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'roadmaps' | 'habits'>(
    'roadmaps',
  );

  const [localFriendshipStatus, setLocalFriendshipStatus] = useState<
    'none' | 'pending' | 'accepted' | null
  >(null);

  const roadmaps = friendProfileData?.allowed_roadmaps || [];
  const habits = friendProfileData?.allowed_habits || [];

  const [removeFriend, { isLoading: isRemoving }] = useRemoveFriendMutation();
  const [blockFriend, { isLoading: isBlocking }] = useBlockFriendMutation();
  const [sendFriendRequest, { isLoading: isSendingRequest }] =
    useSendFriendRequestMutation();

  const is403Error = useMemo(() => {
    if (!error) return false;
    if ('status' in error) {
      return error.status === 403;
    }
    return false;
  }, [error]);

  const friendshipStatus = useMemo(() => {
    if (localFriendshipStatus !== null) {
      return localFriendshipStatus;
    }

    if (is403Error) {
      return (params['friendshipStatus'] as string) || 'none';
    }
    if (friendProfileData && !error) {
      return 'accepted';
    }
    return 'none';
  }, [localFriendshipStatus, is403Error, friendProfileData, params, error]);

  useEffect(() => {
    if (friendProfileData && !is403Error) {
      setLocalFriendshipStatus('accepted');
    } else if (is403Error) {
      setLocalFriendshipStatus((prev) =>
        prev === 'pending' || prev === 'none' ? prev : null,
      );
    }
  }, [friendProfileData, is403Error]);

  const handleSendFriendRequest = useCallback(async () => {
    try {
      await sendFriendRequest(friendId).unwrap();
      setLocalFriendshipStatus('pending');
      showToast({
        type: 'success',
        message: t('settings.friend_request_sent'),
      });
    } catch (e: unknown) {
      showToast({
        type: 'failure',
        message: getApiErrorMessage(e) || t('common.error_occurred'),
      });
    }
  }, [friendId, sendFriendRequest, showToast, t]);

  const handleBlockFriend = useCallback(async () => {
    try {
      await blockFriend(friendId).unwrap();
      setLocalFriendshipStatus('none');

      showToast({
        type: 'success',
        message: t('settings.friend_blocked'),
      });
      router.back();
    } catch (e: unknown) {
      showToast({
        type: 'failure',
        message: getApiErrorMessage(e) || t('common.error_occurred'),
      });
    }
  }, [blockFriend, friendId, showToast, t]);

  const confirmRemoveAndBlock = useCallback(() => {
    Alert.alert(
      t('settings.remove_and_block'),
      t('settings.remove_and_block_description'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('settings.remove_and_block'),
          style: 'destructive',
          onPress: handleBlockFriend,
        },
      ],
    );
  }, [handleBlockFriend, t]);

  const handleRemoveFriend = useCallback(() => {
    Alert.alert(
      t('settings.remove'),
      t('settings.remove_friend_confirmation'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.remove'),
          style: 'destructive',
          onPress: async () => {
            try {
              await removeFriend(friendId).unwrap();
              setLocalFriendshipStatus('none');

              showToast({
                type: 'success',
                message: t('settings.friend_removed'),
              });
            } catch (e: unknown) {
              showToast({
                type: 'failure',
                message: getApiErrorMessage(e) || t('common.error_occurred'),
              });
            }
          },
        },
      ],
    );
  }, [friendId, removeFriend, showToast, t]);

  const handleFriendshipRequest = useCallback(async () => {
    if (friendshipStatus === 'accepted') {
      handleRemoveFriend();
    } else {
      handleSendFriendRequest();
    }
  }, [friendshipStatus, handleRemoveFriend, handleSendFriendRequest]);

  const onChatPress = () => {
    if (friendProfileData?.thread_id) {
      router.navigate({
        pathname: '/messages/[threadId]',
        params: {
          threadId: friendProfileData.thread_id,
          threadName: friendProfileData.user.first_name,
          threadUserId: friendId,
        },
      });
    }
  };

  const renderEmptyRoadmaps = useCallback(() => {
    return (
      <AppCard paddingV-48 center>
        <AppView center gap-20>
          <AppIcon set="Feather" name="map" size={48} />
          <TranslatedText body2 translationKey="settings.no_roadmaps_shared" />
        </AppView>
      </AppCard>
    );
  }, []);

  const renderEmptyHabits = useCallback(() => {
    return (
      <AppCard paddingV-48 center>
        <AppView center gap-20>
          <TranslatedText body2 translationKey="settings.no_habits_shared" />
        </AppView>
      </AppCard>
    );
  }, []);

  const renderHabitItem = useCallback(
    ({ item: habit }: { item: HabitType }) => {
      return (
        <AppCard
          paddingV-20
          marginB-16
          onPress={() => {
            storeHabit(habit);
            router.navigate({ pathname: '/settings/readonly-habit-details' });
          }}>
          <AppView row centerV flex-1 gap-4>
            <AppText body2 textColor flex-1>
              {habit.title}
            </AppText>
            <AppView bg-accent paddingH-8 paddingV-4 br100>
              <AppText
                white
                xsm
                regular
                style={{ textTransform: 'capitalize' }}>
                {habit.recurrence_type === 'none'
                  ? t('habits.recurrence.none')
                  : habit.recurrence_type}
              </AppText>
            </AppView>
          </AppView>
          {habit.description ? (
            <AppText xsm textColor marginT-4>
              {habit.description}
            </AppText>
          ) : null}
        </AppCard>
      );
    },
    [t],
  );

  const handleRoadmapPress = useCallback((roadmap: RoadmapType) => {
    storeRoadmap(roadmap);
    router.navigate({
      pathname: '/settings/readonly-roadmap-details',
      params: { roadmapId: roadmap.roadmap_id },
    });
  }, []);

  const renderRoadmapItem = useCallback(
    ({ item: roadmap }: { item: RoadmapType }) => {
      return (
        <AppCard
          paddingV-20
          marginB-16
          onPress={() => handleRoadmapPress(roadmap)}>
          <AppView row gap-16>
            <AppView bg-primary br30 center style={styles.roadmapIcon}>
              <AppIcon set="Feather" name="map" color={Colors.white} />
            </AppView>
            <AppView flex gap-4>
              <AppText body2 textColor numberOfLines={2}>
                {roadmap.goal}
              </AppText>
              <AppText xsm textColor numberOfLines={2}>
                {roadmap.description || ''}
              </AppText>
            </AppView>
          </AppView>
        </AppCard>
      );
    },
    [handleRoadmapPress],
  );

  if (isLoading) {
    return (
      <AppScreen>
        <AppView flex height={40}>
          <Loader transparent size="small" />
        </AppView>
      </AppScreen>
    );
  }

  if (is403Error) {
    return (
      <AppScreen paddingH-0 paddingT-60>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior="always">
          <HeaderWithBack marginH-16 marginT-8 />
          <AppView centerH marginT-20>
            {/* <AppImage source={{ uri: friendProfileData?.data.user. }} style={styles.image} /> */}
            <AppAvatar size={40} />
            <AppText body1 textColor marginT-18 center>
              {friendNameParam}
            </AppText>
            <AppText
              caption
              textColor
              marginT-4
              center
              style={styles.emailText}>
              {friendEmailParam}
            </AppText>
          </AppView>
          <AppCard marginH-16 marginT-24 centerH style={styles.detailsCard}>
            <AppView row spread>
              <AppView centerH flex>
                <TranslatedText
                  xsm
                  textColor
                  translationKey="settings.roadmaps"
                  style={styles.statLabel}
                />
                <AppText body1 textColor marginT-8>
                  {roadmaps.length}
                </AppText>
              </AppView>
              {friendshipStatus === '' && (
                <AppView>
                  <AppIcon name="message" />
                </AppView>
              )}
              <AppView centerH flex centerV>
                <AppButton
                  onPress={handleFriendshipRequest}
                  disabled={
                    isRemoving ||
                    isBlocking ||
                    isSendingRequest ||
                    friendshipStatus === 'pending'
                  }>
                  {isRemoving || isBlocking || isSendingRequest ? (
                    <AppView center>
                      <Loader
                        transparent
                        containerStyle={{ position: 'relative' }}
                      />
                    </AppView>
                  ) : (
                    <>
                      <TranslatedText
                        xsm
                        textColor
                        translationKey={
                          friendshipStatus === 'accepted'
                            ? 'settings.remove'
                            : friendshipStatus === 'pending'
                              ? 'settings.pending_request'
                              : 'settings.send_friend_request'
                        }
                        style={styles.statLabel}
                        center
                      />
                      <AppView centerH marginT-8>
                        <AppIcon
                          set="Feather"
                          name={
                            friendshipStatus === 'accepted'
                              ? 'user-minus'
                              : friendshipStatus === 'pending'
                                ? 'user'
                                : 'user-plus'
                          }
                          size={22}
                          color={Colors.textColor}
                        />
                      </AppView>
                    </>
                  )}
                </AppButton>
              </AppView>
            </AppView>
          </AppCard>

          <AppCard marginH-16 marginT-24 paddingH-24 paddingV-48 center>
            <AppView center marginB-24>
              <AppIcon set="Feather" name="lock" size={40} />
            </AppView>
            <TranslatedText
              body1
              textColor
              center
              marginB-8
              translationKey="settings.profile_locked"
            />
            <TranslatedText
              xsm
              secondary
              center
              marginB-16
              translationKey={
                friendshipStatus === 'pending'
                  ? 'settings.profile_request_pending_description'
                  : 'settings.profile_locked_description'
              }
            />
          </AppCard>
        </ScrollView>
      </AppScreen>
    );
  }

  if (error || !friendProfileData) {
    return (
      <AppScreen paddingH-0 paddingT-60>
        <HeaderWithBack marginH-16 marginT-8 />
        <AppView flex center paddingH-32>
          <AppIcon name="exclamation-circle" size={48} color={Colors.error} />
          <TranslatedText
            body2
            textColor
            marginT-16
            center
            translationKey="settings.error_loading_friend"
          />
        </AppView>
      </AppScreen>
    );
  }

  return (
    <AppScreen paddingH-0>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="always">
        <AppView row centerV spread>
          <HeaderWithBack marginH-16 />
          <AppButton marginH-16 onPress={() => setIsSettingsSheetVisible(true)}>
            <AppIcon set="Feather" name="settings" size={20} />
          </AppButton>
        </AppView>
        {isFetching && (
          <AppView flex height={40}>
            <Loader transparent size="small" />
          </AppView>
        )}
        <AppView centerH marginT-20>
          <AppAvatar size={40} />
          <AppText body1 textColor marginT-18 center>
            {friendNameParam}
          </AppText>
          <AppText caption textColor marginT-8 center style={styles.emailText}>
            {friendEmailParam}
          </AppText>
        </AppView>
        <AppCard marginH-16 marginT-24 centerH style={styles.detailsCard}>
          <AppView row spread gap-20 style={styles.detailsCardContent}>
            <AppView centerH style={styles.statBox}>
              <TranslatedText
                xsm
                textColor
                translationKey="settings.roadmaps"
                style={styles.statLabel}
              />
              <AppText body1 textColor marginT-8>
                {roadmaps.length}
              </AppText>
            </AppView>
            {friendshipStatus === 'accepted' && (
              <AppButton
                centerH
                style={styles.statBox}
                disabled={!friendProfileData?.thread_id}
                onPress={onChatPress}>
                <AppView center>
                  <TranslatedText
                    xsm
                    textColor
                    translationKey="tabs.messages"
                    style={styles.statLabel}
                    marginB-8
                  />
                  <AppIcon name="message" size={20} />
                </AppView>
              </AppButton>
            )}
            <AppView center style={styles.statBox}>
              <AppButton
                center
                paddingB-4
                onPress={handleFriendshipRequest}
                disabled={
                  isRemoving ||
                  isBlocking ||
                  isSendingRequest ||
                  friendshipStatus === 'pending'
                }>
                {isRemoving || isBlocking || isSendingRequest ? (
                  <AppView center>
                    <Loader
                      transparent
                      containerStyle={{ position: 'relative' }}
                    />
                  </AppView>
                ) : (
                  <>
                    <TranslatedText
                      xsm
                      textColor
                      translationKey={
                        friendshipStatus === 'accepted'
                          ? 'settings.remove'
                          : friendshipStatus === 'pending'
                            ? 'settings.pending_request'
                            : 'settings.send_friend_request'
                      }
                      style={styles.statLabel}
                      center
                    />
                    <AppView centerH marginT-8>
                      <AppIcon
                        set="Feather"
                        name={
                          friendshipStatus === 'accepted'
                            ? 'user-minus'
                            : friendshipStatus === 'pending'
                              ? 'user'
                              : 'user-plus'
                        }
                        size={20}
                        color={Colors.textColor}
                      />
                    </AppView>
                  </>
                )}
              </AppButton>
            </AppView>
          </AppView>
        </AppCard>

        <AppView marginH-16 marginT-24>
          <AppSegmentControl
            segments={[
              t('settings.roadmaps'),
              `${t('settings.habits')}/${t('common.tasks')}`,
            ]}
            selectedIndex={selectedTab === 'roadmaps' ? 0 : 1}
            onSegmentChange={(index) =>
              setSelectedTab(index === 0 ? 'roadmaps' : 'habits')
            }
          />
        </AppView>
        <AppView paddingH-16 marginT-16>
          {selectedTab === 'roadmaps' ? (
            <AppList
              scrollEnabled={false}
              data={roadmaps}
              ListEmptyComponent={renderEmptyRoadmaps}
              renderItem={renderRoadmapItem}
            />
          ) : (
            <AppList
              scrollEnabled={false}
              data={habits}
              ListEmptyComponent={renderEmptyHabits}
              renderItem={renderHabitItem}
            />
          )}
        </AppView>
      </ScrollView>
      <AppActionSheetModal
        title={t('settings.settings')}
        visible={isSettingsSheetVisible}
        onDismiss={() => setIsSettingsSheetVisible(false)}
        options={[
          {
            label: t('notifications.settings_title'),
            onPress: () => {
              setIsSettingsSheetVisible(false);
              router.navigate({
                pathname: '/settings/friend-notification-override',
                params: { friendId, friendName: friendNameParam },
              });
            },
            icon: <AppIcon set="Feather" name="bell" size={20} />,
          },
          {
            label: t('settings.report'),
            onPress: () => {
              setIsSettingsSheetVisible(false);
              router.navigate({
                pathname: '/report',
                params: { friendId },
              });
            },
            icon: <AppIcon name="exclamation-circle" size={20} />,
          },
          {
            label: t('settings.remove_and_block'),
            onPress: () => {
              setIsSettingsSheetVisible(false);
              confirmRemoveAndBlock();
            },
            icon: (
              <AppIcon
                set="MaterialCommunityIcons"
                name="account-cancel-outline"
                size={20}
                color={Colors.error}
              />
            ),
          },
        ]}
      />
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  avatar: {
    width: 96,
    height: 96,
  },
  emailText: {
    color: '#A8ADB2',
  },
  statLabel: {
    textAlign: 'center',
  },
  statBox: {
    minWidth: 90,
    maxWidth: 120,
    flex: 1,
    alignItems: 'center',
  },
  roadmapIcon: {
    width: 48,
    height: 48,
  },
  progressBar: {
    height: 3,
    width: '60%',
  },
  detailsCard: { minHeight: 85 },
  detailsCardContent: {
    alignSelf: 'stretch',
  },
  lockedCard: {},
  lockedTextPlaceholder: {
    height: 16,
    width: '80%',
    borderRadius: 4,
  },
  image: {
    width: 96,
    height: 96,
    borderRadius: 100,
    alignSelf: 'center',
  },
});

export default FriendDetails;

import { AppAvatar } from '@/components/AppAvatar';
import { AppButton } from '@/components/AppButton';
import { AppIcon } from '@/components/AppIcon';
import { AppList } from '@/components/AppList';
import { AppModal } from '@/components/AppModal';
import { Divider } from '@/components/Divider';
import { LineDivider } from '@/components/LineDivider';
import { Loader } from '@/components/Loader';
import { TranslatedText } from '@/components/TranslatedText';
import { AppText, AppView } from '@/components/ui';
import { FriendResponse } from '@/hooks/friends/types/friends.types';
import {
  useCreateAnchorRequestMutation,
  useRemoveAnchorMutation,
} from '@/hooks/roadmap';
import { RoadmapType } from '@/hooks/roadmap/types/roadmap.types';
import { useLocalization } from '@/hooks/useLocalization';
import { useToast } from '@/hooks/useToast';
import { useGetFriendsQuery } from '@/store/apis/friendsApi';
import { useAppSelector } from '@/store/hooks/store.hooks';
import { selectUser } from '@/store/slices/authSlice';
import { selectDraftRoadmap } from '@/store/slices/roadmapDraftSlice';
import { getApiErrorMessage } from '@/utils/apiErrors.utils';
import { LegendListRenderItemProps } from '@legendapp/list';
import { useCallback, useRef, useState } from 'react';
import { Dimensions, Platform, Share, StyleSheet, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import {
  SlideInLeft,
  SlideInRight,
  SlideOutLeft,
  SlideOutRight,
} from 'react-native-reanimated';
import { Colors } from 'react-native-ui-lib';

const APP_STORE_URL = 'https://apps.apple.com/app/dead-reckoner';
const PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.deadreckoner';

interface AnchorSelectionModalProps {
  roadmapId: string;
  roadmap?: RoadmapType;
  isLoading: boolean;
  isAnchorSheetVisible: boolean;
  setIsAnchorSheetVisible: (_visible: boolean) => void;
}

export const AnchorSelectionModal = ({
  roadmap,
  roadmapId,
  isLoading,
  isAnchorSheetVisible,
  setIsAnchorSheetVisible,
}: AnchorSelectionModalProps) => {
  const selectedRoadmap = useAppSelector(selectDraftRoadmap);
  const user = useAppSelector(selectUser);

  const { t } = useLocalization();
  const { showToast } = useToast();

  const [showInviteView, setShowInviteView] = useState(false);
  const hasOpenedInvite = useRef(false);

  const { data: friendsData = [], isLoading: isLoadingFriends } =
    useGetFriendsQuery(undefined, {
      refetchOnMountOrArgChange: true,
    });

  const [createAnchorRequest, { isLoading: isCreatingAnchorRequest }] =
    useCreateAnchorRequestMutation();
  const [removeAnchor, { isLoading: isRemovingAnchor }] =
    useRemoveAnchorMutation();

  const anchorID = roadmap?.anchor_id || selectedRoadmap?.anchor_id;
  const isAnchorAssigned = !!anchorID;

  const onSelectAnchor = useCallback(
    async (friendId: string, friendName: string) => {
      if (!roadmapId) return;

      try {
        await createAnchorRequest({
          roadmapId: roadmapId,
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
    [roadmapId, createAnchorRequest, showToast, t, setIsAnchorSheetVisible],
  );

  const onRemoveAnchor = useCallback(async () => {
    if (!roadmapId) return;

    try {
      await removeAnchor(roadmapId).unwrap();
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
  }, [removeAnchor, showToast, t, roadmapId, setIsAnchorSheetVisible]);

  const getInviteMessage = useCallback(() => {
    const storeUrl = Platform.OS === 'ios' ? APP_STORE_URL : PLAY_STORE_URL;
    return t('settings.invite_message', { appStoreUrl: storeUrl });
  }, [t]);

  const handleInviteOther = useCallback(async () => {
    try {
      const message = getInviteMessage();
      if (Platform.OS === 'web') {
        showToast({
          message: t('settings.share_not_available'),
          type: 'failure',
        });
        return;
      }
      await Share.share({ message });
    } catch (error) {
      if ((error as { code?: string }).code !== 'CANCEL') {
        showToast({ message: t('settings.invite_failed'), type: 'failure' });
      }
    }
  }, [getInviteMessage, showToast, t]);

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

  const qrSize = Dimensions.get('screen').width / 2.2;

  return (
    <AppModal
      snapPoints={['50%']}
      visible={isAnchorSheetVisible}
      setIsVisible={(visible) => {
        if (!visible) setShowInviteView(false);
        setIsAnchorSheetVisible(visible);
      }}
      onClose={() => {
        hasOpenedInvite.current = false;
      }}>
      <View style={styles.overflow}>
        {!showInviteView ? (
          <AppView
            reanimated
            key="main-view"
            entering={
              hasOpenedInvite.current ? SlideInLeft.duration(300) : undefined
            }
            exiting={SlideOutLeft.duration(300)}
            paddingB-24
            flex-1>
            <AppView row centerV spread>
              <TranslatedText
                body2
                semibold
                textColor
                translationKey={
                  isAnchorAssigned
                    ? 'roadmap.manage_anchor'
                    : 'roadmap.select_anchor'
                }
              />
              {friendsData?.length !== 0 && (
                <AppButton
                  br20
                  bg-accent
                  paddingV-4
                  paddingH-8
                  onPress={() => {
                    hasOpenedInvite.current = true;
                    setShowInviteView(true);
                  }}>
                  <AppView row spread gap-4 centerV>
                    <AppIcon
                      set="Ionicons"
                      name="person-add-outline"
                      size={16}
                      color={Colors.textOnPrimary}
                    />
                    <TranslatedText
                      xsm
                      regular
                      textOnPrimary
                      translationKey="settings.invite"
                    />
                    <AppView />
                  </AppView>
                </AppButton>
              )}
            </AppView>
            <LineDivider />
            <AppView flex-1>
              {(isLoading || isLoadingFriends) && (
                <AppView center marginT-8 marginB-20>
                  <Loader
                    transparent
                    containerStyle={{ position: 'relative' }}
                  />
                </AppView>
              )}
              <AppList
                data={friendsData}
                keyExtractor={(item, index) => item.friendship_id + index}
                showsVerticalScrollIndicator={false}
                bounces={false}
                extraData={[roadmap, roadmap?.anchor_id]}
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
                    <AppButton
                      marginT-16
                      paddingH-24
                      paddingV-8
                      br20
                      bg-primary
                      onPress={() => {
                        hasOpenedInvite.current = true;
                        setShowInviteView(true);
                      }}>
                      <AppView row spread gap-8 centerV>
                        <AppIcon
                          set="Ionicons"
                          name="person-add-outline"
                          size={20}
                          color={Colors.white}
                        />
                        <TranslatedText
                          body2
                          translationKey="settings.add_friends"
                        />
                        <AppView />
                      </AppView>
                    </AppButton>
                  </AppView>
                )}
              />
            </AppView>
          </AppView>
        ) : (
          <AppView
            reanimated
            key="invite-view"
            entering={SlideInRight.duration(300)}
            exiting={SlideOutRight.duration(300)}
            paddingB-24
            flex-1>
            <AppView row centerV>
              <AppButton marginR-8 onPress={() => setShowInviteView(false)}>
                <AppIcon set="Ionicons" name="arrow-back" size={24} />
              </AppButton>
            </AppView>
            <AppView flex-1 centerH gap-24 paddingT-16>
              <TranslatedText
                body1
                marginH-38
                center
                textColor
                translationKey="common.scan_qr_code"
              />
              {!!user.id && (
                <QRCode
                  value={`deadreckoner://settings/friend-details/${user.id}`}
                  logoSize={40}
                  logoBackgroundColor="transparent"
                  size={qrSize}
                />
              )}

              <AppButton
                bg-accent
                br20
                paddingH-24
                paddingV-12
                onPress={handleInviteOther}>
                <AppView row centerV spread gap-12>
                  <AppText body1 textOnPrimary>
                    {t('settings.share_via')}
                  </AppText>
                  <AppIcon
                    set="AntDesign"
                    name="sharealt"
                    size={20}
                    color={Colors.textOnPrimary}
                  />
                </AppView>
              </AppButton>
            </AppView>
          </AppView>
        )}
      </View>
    </AppModal>
  );
};

const styles = StyleSheet.create({
  overflow: {
    flex: 1,
    overflow: 'hidden',
  },
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
  inviteOptions: {
    width: '100%',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 16,
  },
});

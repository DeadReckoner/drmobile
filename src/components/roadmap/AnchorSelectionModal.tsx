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
import { selectDraftRoadmap } from '@/store/slices/roadmapDraftSlice';
import { getApiErrorMessage } from '@/utils/apiErrors.utils';
import { LegendListRenderItemProps } from '@legendapp/list';
import { router } from 'expo-router';
import { useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

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

  const { t } = useLocalization();
  const { showToast } = useToast();

  const { data: friendsData, isLoading: isLoadingFriends } = useGetFriendsQuery(
    undefined,
    {
      refetchOnMountOrArgChange: true,
    },
  );

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

  return (
    <AppModal
      visible={isAnchorSheetVisible}
      setIsVisible={setIsAnchorSheetVisible}>
      <AppView paddingB-24 flex-1>
        <TranslatedText
          body1
          semibold
          textColor
          translationKey={
            isAnchorAssigned ? 'roadmap.manage_anchor' : 'roadmap.select_anchor'
          }
        />
        <LineDivider />
        <AppView flex-1>
          {(isLoading || isLoadingFriends) && (
            <AppView center marginT-8 marginB-20>
              <Loader transparent containerStyle={{ position: 'relative' }} />
            </AppView>
          )}
          <AppList
            data={friendsData || []}
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
                    router.navigate('/settings/my-friends');
                  }}>
                  <AppView row spread gap-16 centerV>
                    <AppIcon
                      set="Ionicons"
                      name="person-add-outline"
                      size={20}
                      color={Colors.white}
                    />
                    <TranslatedText
                      body2
                      translationKey="settings.add_friend"
                    />
                    <AppView />
                  </AppView>
                </AppButton>
              </AppView>
            )}
          />
        </AppView>
      </AppView>
    </AppModal>
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

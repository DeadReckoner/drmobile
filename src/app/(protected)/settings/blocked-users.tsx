import { AppAvatar } from '@/components/AppAvatar';
import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppIcon } from '@/components/AppIcon';
import { AppList } from '@/components/AppList';
import { AppScreen } from '@/components/AppScreen';
import { Divider } from '@/components/Divider';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { Loader } from '@/components/Loader';
import { TranslatedText } from '@/components/TranslatedText';
import { AppText, AppView } from '@/components/ui';
import { BlockedUser } from '@/hooks/friends/types/friends.types';
import { useLocalization } from '@/hooks/useLocalization';
import { useToast } from '@/hooks/useToast';
import {
  useGetBlockedUsersQuery,
  useUnblockFriendMutation,
} from '@/store/apis/friendsApi';
import { getApiErrorMessage } from '@/utils/apiErrors.utils';
import React, { useCallback, useState } from 'react';
import { Alert, RefreshControl, StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

const BlockedUsers = () => {
  const { t } = useLocalization();
  const { showToast } = useToast();
  const {
    data: blockedUsers = [],
    isLoading,
    isFetching,
    refetch,
  } = useGetBlockedUsersQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const [unblockFriend] = useUnblockFriendMutation();
  const [unblockingId, setUnblockingId] = useState<string | null>(null);

  const handleUnblock = useCallback(
    async (user: BlockedUser) => {
      try {
        setUnblockingId(user.user_id);
        await unblockFriend(user.user_id).unwrap();
        showToast({
          type: 'success',
          message: t('settings.user_unblocked'),
        });
      } catch (error) {
        showToast({
          type: 'failure',
          message: getApiErrorMessage(error),
        });
      } finally {
        setUnblockingId(null);
      }
    },
    [showToast, t, unblockFriend],
  );

  const confirmUnblock = useCallback(
    (user: BlockedUser) => {
      Alert.alert(t('settings.unblock'), t('settings.unblock_confirmation'), [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('settings.unblock'),
          onPress: () => handleUnblock(user),
        },
      ]);
    },
    [handleUnblock, t],
  );

  const renderItem = useCallback(
    ({ item }: { item: BlockedUser }) => {
      const name = `${item.first_name || ''} ${item.last_name || ''}`.trim();
      return (
        <AppCard marginB-8 paddingV-16 paddingH-16 style={styles.card}>
          <AppView row centerV spread gap-12>
            <AppView row centerV gap-16 flex>
              <AppAvatar />
              <AppView flex gap-4>
                <AppText body2 textColor>
                  {name || t('common.unknown_user')}
                </AppText>
                {!!item.email && (
                  <AppText xsm secondary>
                    {item.email}
                  </AppText>
                )}
              </AppView>
            </AppView>
            <AppButton
              bg-accent
              br20
              paddingV-8
              paddingH-16
              disabled={unblockingId === item.user_id}
              onPress={() => confirmUnblock(item)}>
              {unblockingId === item.user_id ? (
                <Loader
                  transparent
                  size="small"
                  containerStyle={styles.btnLoader}
                />
              ) : (
                <TranslatedText
                  xsm
                  style={styles.btnLabel}
                  translationKey="settings.unblock"
                />
              )}
            </AppButton>
          </AppView>
        </AppCard>
      );
    },
    [confirmUnblock, t, unblockingId],
  );

  const renderEmpty = useCallback(
    () => (
      <AppView center paddingV-48 gap-16>
        <AppIcon
          set="MaterialCommunityIcons"
          name="account-cancel-outline"
          size={48}
          color={Colors.secondary}
        />
        <TranslatedText
          body2
          secondary
          center
          translationKey="settings.no_blocked_users"
        />
      </AppView>
    ),
    [],
  );

  return (
    <AppScreen paddingH-16 safeArea>
      <HeaderWithBack headerKey="settings.blocked_users" />
      <Divider />
      {isLoading ? (
        <AppView flex center>
          <Loader transparent />
        </AppView>
      ) : (
        <AppList<BlockedUser>
          data={blockedUsers}
          renderItem={renderItem}
          keyExtractor={(item) => item.user_id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              tintColor={Colors.secondary}
              refreshing={isFetching}
              onRefresh={refetch}
            />
          }
        />
      )}
    </AppScreen>
  );
};

export default BlockedUsers;

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
  },
  listContent: {
    paddingTop: 16,
    flexGrow: 1,
  },
  btnLabel: {
    color: Colors.textOnPrimary,
  },
  btnLoader: {
    position: 'relative',
  },
});

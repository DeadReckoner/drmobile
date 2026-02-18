import { AppButton } from '@/components/AppButton';
import { AppIcon } from '@/components/AppIcon';
import { AppScreen } from '@/components/AppScreen';
import { Divider } from '@/components/Divider';
import { Loader } from '@/components/Loader';
import { ThreadsList } from '@/components/messages/ThreadsList';
import { TranslatedText } from '@/components/TranslatedText';
import { AppView } from '@/components/ui';
import { Env } from '@/constants/Env';
import { useLocalization } from '@/hooks/useLocalization';
import { useToast } from '@/hooks/useToast';
import { messagesApi, useGetThreadsQuery } from '@/store/apis/messagesApi';
import { ThreadType } from '@/store/apis/types/messagesApi.types';
import { useAppDispatch, useAppSelector } from '@/store/hooks/store.hooks';
import { selectUser } from '@/store/slices/authSlice';
import { Animations } from '@/utils/animation.utils';
import { router, Tabs } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  AppState,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
} from 'react-native';
import { Colors } from 'react-native-ui-lib';

const Messages = () => {
  const { data, isLoading, refetch, isUninitialized } = useGetThreadsQuery();
  const { showToast } = useToast();
  const dispatch = useAppDispatch();
  const { email: currentUserEmail } = useAppSelector(selectUser);
  const { t } = useLocalization();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const hadUnreadMessages = data?.some((thread) => thread.total_unread > 0);

  useEffect(() => {
    const appStateSubscription = AppState.addEventListener(
      'change',
      (nextAppState) => {
        if (nextAppState === 'active' && !isUninitialized && !isLoading) {
          refetch();
        }
      },
    );

    return () => {
      appStateSubscription.remove();
    };
  }, [refetch, isLoading, isUninitialized]);

  const onRefresh = async () => {
    try {
      dispatch(messagesApi.util.resetApiState());
      setIsRefreshing(true);
      await refetch();
    } catch {
    } finally {
      setIsRefreshing(false);
    }
  };

  const onThreadClick = (thread: ThreadType) => {
    const otherParticipant = thread.participants?.find(
      (participant) => participant.email !== currentUserEmail,
    );

    const displayName = otherParticipant
      ? `${otherParticipant.first_name} ${otherParticipant.last_name}`.trim() ||
        t('settings.unknown_contact')
      : thread.name || t('settings.unknown_contact');

    router.push({
      pathname: '/messages/[threadId]',
      params: {
        threadId: thread.thread_id,
        threadName: displayName,
        threadUserId: thread.participants.find(
          (user) => currentUserEmail !== user.email,
        )?.user_id,
      },
    });
  };

  const handleShare = async () => {
    try {
      const message = t('settings.invite_message', {
        appStoreUrl: Env.EXPO_PUBLIC_STORE_UNIVERSAL_LINK,
      });

      await Share.share({ message });
    } catch (error) {
      if ((error as { code?: string }).code !== 'CANCEL') {
        showToast({
          message: t('settings.invite_failed'),
          type: 'failure',
        });
      }
    }
  };
  return (
    <>
      <Tabs.Screen
        options={{ tabBarBadgeStyle: { opacity: hadUnreadMessages ? 1 : 0 } }}
      />
      <AppScreen>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior="always"
          contentContainerStyle={styles.scrollContainer}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor={Colors.secondary}
            />
          }>
          <Divider />
          <AppView row centerV flex spread>
            <TranslatedText h2 translationKey="tabs.messages" />
            <AppView centerV>
              <AppButton centerV onPress={handleShare}>
                <AppIcon set="Feather" name="user-plus" />
              </AppButton>
            </AppView>
          </AppView>
          <Divider />
          {isLoading ? (
            <AppView height={100}>
              <Loader transparent />
            </AppView>
          ) : (
            <AppView
              reanimated
              entering={Animations.Entry.FadeInDownWithSpring()}
              exiting={Animations.Exit.FadeOutDown()}>
              <ThreadsList threads={data || []} onThreadClick={onThreadClick} />
            </AppView>
          )}
        </ScrollView>
      </AppScreen>
    </>
  );
};

export default Messages;

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: 24,
  },
});

import { AppAvatar } from '@/components/AppAvatar';
import { AppCard } from '@/components/AppCard';
import { AppIcon } from '@/components/AppIcon';
import { AppList } from '@/components/AppList';
import { AppScreen } from '@/components/AppScreen';
import { Divider } from '@/components/Divider';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { Loader } from '@/components/Loader';
import { PrimaryButton } from '@/components/PrimaryButton';
import { TranslatedText } from '@/components/TranslatedText';
import { AppImage, AppText, AppView } from '@/components/ui';
import { Env } from '@/constants/Env';
import { AnchoringUser } from '@/hooks/friends/types/friends.types';
import { useLocalization } from '@/hooks/useLocalization';
import { useToast } from '@/hooks/useToast';
import { useGetAnchoringQuery } from '@/store/apis/friendsApi';
import { Animations } from '@/utils/animation.utils';
import { router } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { Share, StyleSheet } from 'react-native';

const AnchoringScreen = () => {
  const { t } = useLocalization();
  const { data, isLoading, error } = useGetAnchoringQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const { showToast } = useToast();

  useEffect(() => {
    if (error) {
      showToast({ type: 'failure', message: t('common.something_went_wrong') });
    }
  }, [error, showToast, t]);

  const handlePersonPress = (userId: string) => {
    router.navigate({
      pathname: '/messages/allowed-roadmaps/[threadUserId]',
      params: { threadUserId: userId },
    });
  };

  const handleInviteFriend = useCallback(async () => {
    try {
      const message = t('settings.invite_message', {
        appStoreUrl: Env.EXPO_PUBLIC_STORE_UNIVERSAL_LINK,
      });
      await Share.share({ message });
    } catch (error) {
      if ((error as { code?: string }).code !== 'CANCEL') {
        showToast({ message: t('settings.invite_failed'), type: 'failure' });
      }
    }
  }, [showToast, t]);

  const renderUserCard = ({ item }: { item: AnchoringUser }) => {
    const { user } = item;
    const fullName = `${user.first_name} ${user.last_name}`.trim();

    return (
      <AppCard
        paddingV-16
        paddingH-16
        onPress={() => handlePersonPress(user.user_id)}>
        <AppView row centerV gap-12>
          {user.profile_image_url ? (
            <AppImage
              source={{ uri: user.profile_image_url }}
              style={styles.avatar}
            />
          ) : (
            <AppAvatar size={18} />
          )}
          <AppView flex>
            <AppText body2 textColor>
              {fullName}
            </AppText>
          </AppView>
          <AppIcon set="Ionicons" name="arrow-forward-outline" size={20} />
        </AppView>
      </AppCard>
    );
  };
  const renderEmpty = useCallback(() => {
    return (
      <AppView
        reanimated
        flex
        paddingT-40
        entering={Animations.Entry.FadeInDownWithSpring()}
        exiting={Animations.Exit.FadeOutDown()}>
        <AppView center bg-cardBG style={styles.anchorIconContainer} marginB-24>
          <AppIcon set="Feather" name="anchor" size={48} />
        </AppView>

        <TranslatedText
          subtitle2
          textColor
          center
          translationKey="settings.not_anchoring_anyone"
          marginB-12
        />

        <TranslatedText
          xsm
          secondary
          center
          translationKey="settings.not_anchoring_description"
          marginB-32
          style={styles.descriptionText}
        />

        <PrimaryButton
          label="settings.invite_a_friend"
          onPress={handleInviteFriend}
        />
      </AppView>
    );
  }, [handleInviteFriend]);

  return (
    <AppScreen safeArea>
      <HeaderWithBack />

      {isLoading && (
        <AppView height={120}>
          <Loader transparent />
        </AppView>
      )}

      <AppView
        flex
        reanimated
        entering={Animations.Entry.FadeInDownWithSpring()}
        exiting={Animations.Exit.FadeOutDown()}>
        <AppList<AnchoringUser>
          keyExtractor={(i) => i.user.user_id}
          data={data?.users ?? []}
          renderItem={renderUserCard}
          ItemSeparatorComponent={() => <Divider />}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmpty}
        />
      </AppView>
    </AppScreen>
  );
};

export default AnchoringScreen;

const styles = StyleSheet.create({
  listContainer: {
    paddingVertical: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  anchorIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignSelf: 'center',
  },
  descriptionText: {
    lineHeight: 20,
  },
  inviteButton: {
    alignSelf: 'stretch',
    alignItems: 'center',
  },
});

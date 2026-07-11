import { AppIcon } from '@/components/AppIcon';
import { AppList } from '@/components/AppList';
import { AppScreen } from '@/components/AppScreen';
import { AnchoringItem } from '@/components/friends/AnchoringItem';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { Loader } from '@/components/Loader';
import { PrimaryButton } from '@/components/PrimaryButton';
import { TranslatedText } from '@/components/TranslatedText';
import { AppView } from '@/components/ui';
import { Env } from '@/constants/Env';
import { useLocalization } from '@/hooks/useLocalization';
import { useToast } from '@/hooks/useToast';
import { useGetAnchoringQuery } from '@/store/apis/friendsApi';
import { Animations } from '@/utils/animation.utils';
import { useCallback } from 'react';
import { Share, StyleSheet } from 'react-native';

export const Anchoring = () => {
  const { data, isFetching } = useGetAnchoringQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const { showToast } = useToast();
  const { t } = useLocalization();

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
    <AppScreen>
      {isFetching && <Loader transparent />}
      <AppList
        keyExtractor={(i) => i.user.user_id}
        contentInsetAdjustmentBehavior="automatic"
        ListHeaderComponent={() => (
          <AppView marginB-16>
            <HeaderWithBack />
          </AppView>
        )}
        data={data?.users || []}
        ListEmptyComponent={!isFetching ? renderEmpty : null}
        renderItem={({ item: anchoringUser }) => (
          <AnchoringItem
            key={anchoringUser.user.user_id}
            anchoringUser={anchoringUser}
          />
        )}
      />
    </AppScreen>
  );
};

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

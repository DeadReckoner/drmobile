import { AppActionSheetModal } from '@/components/AppActionSheetModal';
import { AppIcon } from '@/components/AppIcon';
import { AppImage } from '@/components/ui';
import { AppURLs } from '@/constants/AppURLs.constants';
import { useLocalization } from '@/hooks/useLocalization';
import React from 'react';
import { Linking, StyleSheet } from 'react-native';

interface FollowOnSocialMediaProps {
  isVisible: boolean;
  setIsVisible: (_visible: boolean) => void;
}

export const FollowOnSocialMedia = ({
  isVisible,
  setIsVisible,
}: FollowOnSocialMediaProps) => {
  const { t } = useLocalization();

  const SOCIAL_MEDIA: {
    socialMediaType: string;
    url: string;
    icon: React.ReactNode;
  }[] = [
    {
      socialMediaType: t('settings.website'),
      url: AppURLs.WEBSITE,
      icon: <AppIcon set="Feather" name="globe" />,
    },
    {
      socialMediaType: t('settings.facebook'),
      url: AppURLs.FACEBOOK,
      icon: (
        <AppImage
          source={{ uri: AppURLs.ICON_FACEBOOK }}
          style={styles.image}
        />
      ),
    },
    {
      socialMediaType: t('settings.instagram'),
      url: AppURLs.INSTAGRAM,
      icon: (
        <AppImage
          source={{ uri: AppURLs.ICON_INSTAGRAM }}
          style={styles.image}
        />
      ),
    },
    {
      socialMediaType: t('settings.linkedin'),
      url: AppURLs.LINKEDIN,
      icon: (
        <AppImage
          source={{ uri: AppURLs.ICON_LINKEDIN }}
          style={styles.image}
        />
      ),
    },
  ];
  const openURL = async (url: string) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    }
  };
  return (
    <>
      <AppIcon name="globe" set="Feather" size={22} />

      <AppActionSheetModal
        options={SOCIAL_MEDIA.map((option) => ({
          label: option.socialMediaType,
          onPress: () => openURL(option.url),
          icon: option.icon,
        }))}
        title={'Social Media'}
        visible={isVisible}
        onDismiss={() => setIsVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  image: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
});

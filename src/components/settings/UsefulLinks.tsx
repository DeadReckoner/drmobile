import { AppButton } from '@/components/AppButton';
import { AppIcon } from '@/components/AppIcon';
import { FollowOnSocialMedia } from '@/components/FollowOnSocialMedia';
import { LineDivider } from '@/components/LineDivider';
import { SettingsItem } from '@/components/SettingsItem';
import { AppView } from '@/components/ui';
import { router } from 'expo-router';
import React, { useState } from 'react';

export const UsefulLinks = () => {
  const [isSocialMediaDialogVisible, setIsSocialMediaDialogVisible] =
    useState(false);
  const SettingsItemDivider = () => <LineDivider marginV-0 />;

  return (
    <AppView>
      <AppButton gap-8 onPress={() => setIsSocialMediaDialogVisible(true)}>
        <SettingsItem
          translationKey="settings.follow_us"
          rightElement={
            <FollowOnSocialMedia
              isVisible={isSocialMediaDialogVisible}
              setIsVisible={setIsSocialMediaDialogVisible}
            />
          }
        />
      </AppButton>
      <SettingsItemDivider />

      <AppButton
        onPress={() => router.navigate('/settings/terms-and-services')}>
        <SettingsItem
          translationKey="settings.terms_of_service"
          rightElement={<AppIcon set="Feather" name="file-text" size={20} />}
        />
      </AppButton>
      <SettingsItemDivider />

      <AppButton onPress={() => router.navigate('/settings/privacy-policy')}>
        <SettingsItem
          translationKey="settings.privacy_policy"
          rightElement={<AppIcon set="Feather" name="help-circle" size={20} />}
        />
      </AppButton>
      <SettingsItemDivider />
    </AppView>
  );
};

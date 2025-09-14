import { AppActionSheetModal } from '@/components/AppActionSheetModal';
import { AppButton } from '@/components/AppButton';
import { AppIcon } from '@/components/AppIcon';
import { AppScreen } from '@/components/AppScreen';
import { AppSwitch } from '@/components/AppSwitch';
import { ConfirmationDialog } from '@/components/ConfirmationDialog';
import { FollowOnSocialMedia } from '@/components/FollowOnSocialMedia';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { LineDivider } from '@/components/LineDivider';
import { SettingsItem } from '@/components/SettingsItem';
import { TranslatedText } from '@/components/TranslatedText';
import { AppImage, AppText, AppView } from '@/components/ui';
import { AppURLs } from '@/constants/AppURLs.constants';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { SupportedLanguagesType } from '@/lib/localization/types/i18n.types';
import { supabaseClient } from '@/lib/supabase/supabaseClient';
import { useAppDispatch, useAppSelector } from '@/store/hooks/store.hooks';
import { clearAuthAction, selectUser } from '@/store/slices/authSlice';
import { selectSettings } from '@/store/slices/settingsSlice';
import { router } from 'expo-router';
import { useState } from 'react';
import { Linking, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from 'react-native-ui-lib';

const SUPPORTED_LANGUAGES: SupportedLanguagesType[] = [
  { languageName: 'English', languageCode: 'en' },
  { languageName: 'Español', languageCode: 'es' },
  { languageName: 'Français', languageCode: 'fr' },
];

const Settings = () => {
  const user = useAppSelector(selectUser);
  const settings = useAppSelector(selectSettings);
  const dispatch = useAppDispatch();
  const { t, setLanguage } = useLocalization();
  const { toggleTheme, theme } = useAppTheme();
  const { top } = useSafeAreaInsets();

  const [isLogoutDialogVisible, setIsLogoutDialogVisible] = useState(false);
  const [isLanguageDialogVisible, setIsLanguageDialogVisible] = useState(false);
  const [isSocialMediaDialogVisible, setIsSocialMediaDialogVisible] =
    useState(false);

  const onDarkModeToggle = () => {
    toggleTheme();
  };

  const hideLogoutDialog = () => setIsLogoutDialogVisible(false);
  const showLogoutDialog = () => setIsLogoutDialogVisible(true);

  const onLogoutConfirmation = async () => {
    hideLogoutDialog();
    dispatch(clearAuthAction());
    await supabaseClient.auth.signOut();
  };

  const handleLanguageSelection = (language: SupportedLanguagesType) => {
    setIsLanguageDialogVisible(false);
    setLanguage(language);
  };

  const openURL = async (url: string) => {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    }
  };

  return (
    <AppScreen paddingH-0>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContainer, { paddingTop: top }]}>
        <HeaderWithBack headerKey="settings.profile" paddingH-16 />
        <AppView style={styles.content}>
          <AppView gap-16 center paddingH-16>
            <AppImage source={{ uri: user.avatar }} style={styles.image} />
            <AppView gap-6 center key={theme}>
              <AppText body1 textColor>
                {user.name}
              </AppText>
              <AppText xsm textColor>
                {user.email}
              </AppText>
            </AppView>
          </AppView>

          <AppView>
            <TranslatedText
              marginH-16
              subtitle1
              translationKey="settings.settings"
            />
            <LineDivider />
            <SettingsItem
              translationKey="settings.dark_mode"
              rightElement={
                <AppSwitch
                  value={settings.theme === 'dark'}
                  onValueChange={onDarkModeToggle}
                />
              }
            />
            <LineDivider />
            <AppButton
              paddingV-4
              onPress={() => setIsLanguageDialogVisible(true)}>
              <SettingsItem
                translationKey="settings.language"
                rightElement={
                  <AppText textColor caption key={theme}>
                    {settings.language.languageName}
                  </AppText>
                }
              />
            </AppButton>
            <LineDivider />

            <AppButton
              gap-8
              onPress={() => setIsSocialMediaDialogVisible(true)}>
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
            <LineDivider />

            <AppButton
              onPress={() => router.navigate('/settings/privacy-policy')}>
              <SettingsItem
                translationKey="settings.privacy_policy"
                rightElement={<AppIcon set="Feather" name="help-circle" />}
              />
            </AppButton>
            <LineDivider />

            <AppButton onPress={() => openURL(AppURLs.HELP_SUPPORT)}>
              <SettingsItem
                translationKey="settings.help_support"
                rightElement={<AppIcon name="customerservice" />}
              />
            </AppButton>
            <LineDivider />

            <AppButton onPress={showLogoutDialog}>
              <SettingsItem
                translationKey="settings.logout"
                rightElement={
                  <AppIcon set="Feather" name="log-out" color={Colors.error} />
                }
              />
            </AppButton>
          </AppView>
        </AppView>
      </ScrollView>
      <ConfirmationDialog
        isDialogOpen={isLogoutDialogVisible}
        onDismiss={hideLogoutDialog}
        title="common.are_you_sure"
        subtitle="settings.logout_dialog"
        onNegativePress={hideLogoutDialog}
        onPositivePress={onLogoutConfirmation}
        negativeText="common.cancel"
        positiveText="settings.logout"
        negativeButtonIcon={
          <AppIcon name="close" color={Colors.textOnPrimary} size={16} />
        }
        positiveButtonIcon={
          <AppIcon
            set="Feather"
            name="log-out"
            color={Colors.textOnPrimary}
            size={16}
          />
        }
      />
      <AppActionSheetModal
        options={SUPPORTED_LANGUAGES.map((option) => ({
          label: option.languageName,
          onPress: () => handleLanguageSelection(option),
          icon: settings.language.languageName === option.languageName && (
            <AppIcon name="checkcircle" size={20} color={Colors.success} />
          ),
        }))}
        title={t('settings.select_language')}
        visible={isLanguageDialogVisible}
        onDismiss={() => setIsLanguageDialogVisible(false)}
      />
    </AppScreen>
  );
};

export default Settings;

const styles = StyleSheet.create({
  image: {
    width: 160,
    height: 160,
    borderRadius: 100,
    alignSelf: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  content: { flex: 1, justifyContent: 'space-evenly' },
});

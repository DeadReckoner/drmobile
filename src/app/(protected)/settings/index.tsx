import { AppActionSheetModal } from '@/components/AppActionSheetModal';
import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
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
import { useGetFriendsQuery } from '@/hooks/friends';
import { useGetRoadmapsQuery } from '@/hooks/roadmap';
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
  const { data = [] } = useGetRoadmapsQuery();

  const [isLogoutDialogVisible, setIsLogoutDialogVisible] = useState(false);
  const [isLanguageDialogVisible, setIsLanguageDialogVisible] = useState(false);
  const [isSocialMediaDialogVisible, setIsSocialMediaDialogVisible] =
    useState(false);

  const { data: friendsData } = useGetFriendsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

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

  const SettingsItemDivider = () => <LineDivider marginV-0 />;

  return (
    <AppScreen paddingH-0 safeArea>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}>
        <AppView paddingH-16 row center spread>
          <AppView flex-1>
            <HeaderWithBack headerKey="settings.profile" />
          </AppView>
          <AppButton onPress={() => router.navigate('/settings/edit-profile')}>
            <AppIcon set="Feather" name="settings" size={20} />
          </AppButton>
        </AppView>
        <AppView style={styles.content} key={theme}>
          <AppView gap-16 center paddingH-16>
            <AppButton>
              <AppView>
                {user.avatar ? (
                  <AppImage
                    source={{ uri: user.avatar }}
                    style={styles.image}
                  />
                ) : (
                  <AppView
                    bg-primary
                    br100
                    padding-20
                    style={styles.image}
                    center>
                    <AppIcon name="user" size={40} color={Colors.white} />
                  </AppView>
                )}
              </AppView>
            </AppButton>
            <AppView gap-6 center>
              <AppText body1 textColor>
                {user.name}
              </AppText>
              <AppText captionLight textColor>
                {user.email}
              </AppText>
            </AppView>
          </AppView>
          <AppView center>
            <AppCard row center style={{ maxWidth: '80%' }}>
              <AppButton
                onPress={() =>
                  router.dismissTo('/(protected)/(tabs)/progress')
                }>
                <AppView center paddingH-16 gap-8>
                  <TranslatedText xsm translationKey="settings.roadmaps" />
                  <AppText textColor body1>
                    {data?.length}
                  </AppText>
                </AppView>
              </AppButton>
              <AppButton
                onPress={() => router.navigate('/settings/my-friends')}>
                <AppView center paddingH-16 gap-8>
                  <TranslatedText xsm translationKey="settings.my_friends" />
                  <AppText textColor body1>
                    {friendsData?.length || 0}
                  </AppText>
                </AppView>
              </AppButton>
            </AppCard>
          </AppView>

          <AppView>
            <TranslatedText
              marginH-16
              marginB-16
              subtitle1
              translationKey="settings.settings"
            />
            <LineDivider marginT-0 marginV-0 />
            <SettingsItem
              translationKey="settings.dark_mode"
              rightElement={
                <AppSwitch
                  value={settings.theme === 'dark'}
                  onValueChange={onDarkModeToggle}
                />
              }
            />
            <SettingsItemDivider />
            <AppButton onPress={() => setIsLanguageDialogVisible(true)}>
              <SettingsItem
                translationKey="settings.language"
                rightElement={
                  <AppText textColor caption key={theme}>
                    {settings.language.languageName}
                  </AppText>
                }
              />
            </AppButton>
            <SettingsItemDivider />

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
            <SettingsItemDivider />

            <AppButton
              onPress={() => router.navigate('/settings/terms-and-services')}>
              <SettingsItem
                translationKey="settings.terms_of_service"
                rightElement={<AppIcon set="Feather" name="file-text" />}
              />
            </AppButton>
            <SettingsItemDivider />

            <AppButton
              onPress={() => router.navigate('/settings/privacy-policy')}>
              <SettingsItem
                translationKey="settings.privacy_policy"
                rightElement={<AppIcon set="Feather" name="help-circle" />}
              />
            </AppButton>
            <SettingsItemDivider />

            <AppButton onPress={() => openURL(AppURLs.HELP_SUPPORT)}>
              <SettingsItem
                translationKey="settings.help_support"
                rightElement={<AppIcon name="customerservice" />}
              />
            </AppButton>
            <SettingsItemDivider />

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
        onPositivePress={onLogoutConfirmation}
        onNegativePress={hideLogoutDialog}
        positiveText="settings.logout"
        negativeText="common.cancel"
        positiveButtonIcon={
          <AppIcon
            set="Feather"
            name="log-out"
            color={Colors.textOnPrimary}
            size={16}
          />
        }
        negativeButtonIcon={
          <AppIcon name="close" color={Colors.textOnPrimary} size={16} />
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
    width: 96,
    height: 96,
    borderRadius: 100,
    alignSelf: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  content: { flex: 1, justifyContent: 'space-evenly' },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
});

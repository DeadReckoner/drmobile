import { AppActionSheetModal } from '@/components/AppActionSheetModal';
import { AppButton } from '@/components/AppButton';
import { AppIcon } from '@/components/AppIcon';
import { AppScreen } from '@/components/AppScreen';
import { AppSwitch } from '@/components/AppSwitch';
import { Divider } from '@/components/Divider';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { LineDivider } from '@/components/LineDivider';
import { SettingsItem } from '@/components/SettingsItem';
import { AppText, AppView } from '@/components/ui';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useToast } from '@/hooks/useToast';
import { SupportedLanguagesType } from '@/lib/localization/types/i18n.types';
import { useAppDispatch, useAppSelector } from '@/store/hooks/store.hooks';
import {
  selectHapticsEnabled,
  selectSettings,
  setHapticsEnabled,
} from '@/store/slices/settingsSlice';
import { Animations } from '@/utils/animation.utils';
import { useState } from 'react';
import { ActivityIndicator, ScrollView } from 'react-native';
import { Colors } from 'react-native-ui-lib';

const SUPPORTED_LANGUAGES: SupportedLanguagesType[] = [
  { languageName: 'English', languageCode: 'en' },
  { languageName: 'Español', languageCode: 'es' },
  { languageName: 'Français', languageCode: 'fr' },
];

const SettingsPreferences = () => {
  const SettingsItemDivider = () => <LineDivider marginV-0 />;
  const settings = useAppSelector(selectSettings);
  const hapticsEnabled = useAppSelector(selectHapticsEnabled);
  const dispatch = useAppDispatch();

  const { toggleTheme, theme } = useAppTheme();
  const { t, setLanguage } = useLocalization();
  const { showToast } = useToast();
  const [isLanguageDialogVisible, setIsLanguageDialogVisible] = useState(false);
  const { requestPermissions, disableNotifications, isLoading } =
    usePushNotifications();

  const onDarkModeToggle = () => {
    toggleTheme();
  };

  const onHapticsToggle = (isEnabled: boolean) => {
    dispatch(setHapticsEnabled(isEnabled));
  };

  const handleLanguageSelection = (language: SupportedLanguagesType) => {
    setIsLanguageDialogVisible(false);
    setLanguage(language);
  };

  const onNotificationToggle = async (isEnabled: boolean) => {
    if (isEnabled) {
      const granted = await requestPermissions();
      if (granted) {
        showToast({
          type: 'success',
          message: t('notifications.enabled_title'),
        });
      } else {
        showToast({
          type: 'failure',
          message: t('common.something_went_wrong'),
        });
      }
    } else {
      await disableNotifications();
      showToast({
        type: 'success',
        message: t('notifications.disabled_title'),
      });
    }
  };

  return (
    <AppScreen safeArea paddingH-0 key={theme}>
      <ScrollView
        contentInsetAdjustmentBehavior="always"
        showsVerticalScrollIndicator={false}>
        <AppView paddingH-12 marginB-8>
          <HeaderWithBack headerKey="settings.settings_preferences" />
        </AppView>
        {isLoading && (
          <AppView
            reanimated
            entering={Animations.Entry.FadeInDown()}
            exiting={Animations.Exit.FadeOut().duration(50)}
            flex
            center
            gap-16
            marginV-16
            row>
            <ActivityIndicator />
            <AppText xsm textColor regular>
              {t('notifications.updating_settings')}
            </AppText>
          </AppView>
        )}
        <Divider />
        <SettingsItemDivider />

        <SettingsItem
          leftElement={
            <AppIcon set="Ionicons" name="notifications-outline" size={22} />
          }
          translationKey="notifications.title"
          rightElement={
            <AppSwitch
              value={settings.notificationsEnabled}
              onValueChange={onNotificationToggle}
              disabled={isLoading}
            />
          }
        />
        <SettingsItemDivider />

        <SettingsItem
          leftElement={
            <AppIcon set="MaterialCommunityIcons" name="vibrate" size={22} />
          }
          translationKey={'settings.haptics' as any}
          rightElement={
            <AppSwitch value={hapticsEnabled} onValueChange={onHapticsToggle} />
          }
        />
        <SettingsItemDivider />

        <SettingsItem
          leftElement={<AppIcon set="Ionicons" name="moon-outline" size={22} />}
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
            leftElement={
              <AppIcon set="Ionicons" name="language-outline" size={22} />
            }
            rightElement={
              <AppText textColor xsm semibold key={theme}>
                {settings.language.languageName}
              </AppText>
            }
          />
        </AppButton>
        <SettingsItemDivider />
      </ScrollView>

      <AppActionSheetModal
        options={SUPPORTED_LANGUAGES.map((option) => ({
          label: option.languageName,
          onPress: () => handleLanguageSelection(option),
          icon: settings.language.languageName === option.languageName && (
            <AppIcon name="check-circle" size={20} color={Colors.success} />
          ),
        }))}
        title={t('settings.select_language')}
        visible={isLanguageDialogVisible}
        onDismiss={() => setIsLanguageDialogVisible(false)}
      />
    </AppScreen>
  );
};

export default SettingsPreferences;

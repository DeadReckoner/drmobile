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
import { SupportedLanguagesType } from '@/lib/localization/types/i18n.types';
import { useAppDispatch, useAppSelector } from '@/store/hooks/store.hooks';
import {
  selectHapticsEnabled,
  selectSettings,
  setHapticsEnabled,
} from '@/store/slices/settingsSlice';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView } from 'react-native';
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
  const [isLanguageDialogVisible, setIsLanguageDialogVisible] = useState(false);

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

  return (
    <AppScreen safeArea paddingH-0 key={theme}>
      <ScrollView
        contentInsetAdjustmentBehavior="always"
        showsVerticalScrollIndicator={false}>
        <AppView paddingH-12 marginB-8>
          <HeaderWithBack headerKey="settings.settings_preferences" />
        </AppView>
        <Divider />
        <SettingsItemDivider />

        <AppButton
          onPress={() => router.navigate('/settings/notification-settings')}>
          <SettingsItem
            leftElement={
              <AppIcon set="Ionicons" name="notifications-outline" size={22} />
            }
            translationKey="notifications.title"
            rightElement={
              <AppIcon set="Feather" name="chevron-right" size={20} />
            }
          />
        </AppButton>
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

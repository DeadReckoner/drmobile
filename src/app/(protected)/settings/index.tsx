import { AppActionSheetModal } from '@/components/AppActionSheetModal';
import { AppAvatar } from '@/components/AppAvatar';
import { AppButton } from '@/components/AppButton';
import { AppIcon } from '@/components/AppIcon';
import { AppScreen } from '@/components/AppScreen';
import { ConfirmationDialog } from '@/components/ConfirmationDialog';
import { Divider } from '@/components/Divider';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { LineDivider } from '@/components/LineDivider';
import { UsefulLinks } from '@/components/settings/UsefulLinks';
import { UserStats } from '@/components/settings/UserStats';
import { SettingsItem } from '@/components/SettingsItem';
import { AppImage, AppText, AppView } from '@/components/ui';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { supabaseClient } from '@/lib/supabase/supabaseClient';
import { useAppDispatch, useAppSelector } from '@/store/hooks/store.hooks';
import { clearAuthAction, selectUser } from '@/store/slices/authSlice';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

const Settings = () => {
  const user = useAppSelector(selectUser);
  const dispatch = useAppDispatch();
  const { theme } = useAppTheme();
  const { t } = useLocalization();
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const [isLogoutDialogVisible, setIsLogoutDialogVisible] = useState(false);

  const hideLogoutDialog = () => setIsLogoutDialogVisible(false);
  const showLogoutDialog = () => setIsLogoutDialogVisible(true);

  const onLogoutConfirmation = async () => {
    hideLogoutDialog();
    dispatch(clearAuthAction());
    await supabaseClient.auth.signOut();
  };

  // const openURL = async (url: string) => {
  //   const canOpen = await Linking.canOpenURL(url);
  //   if (canOpen) {
  //     await Linking.openURL(url);
  //   }
  // };

  const SettingsItemDivider = () => <LineDivider marginV-0 />;

  return (
    <AppScreen paddingH-0 safeArea>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}>
        <AppView paddingH-16 row center spread>
          <AppView flex-1>
            <HeaderWithBack headerKey="settings.account" />
          </AppView>
        </AppView>
        <Divider marginT-24 />
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
                  <AppAvatar size={48} />
                )}
              </AppView>
            </AppButton>
            <AppView gap-6 center>
              <AppText body1 textColor>
                {user.name}
              </AppText>
            </AppView>
          </AppView>

          <Divider />
          <UserStats />
          <Divider margin-16 />

          <AppView>
            <LineDivider marginT-0 marginV-0 />
            <AppButton bg-accent br20 onPress={() => setIsMenuVisible(true)}>
              <SettingsItem
                textColor={Colors.textOnPrimary}
                translationKey="settings.friends_accountability"
                rightElement={
                  <AppIcon
                    set="Feather"
                    name="users"
                    size={22}
                    color={Colors.textOnPrimary}
                  />
                }
              />
            </AppButton>
            <LineDivider marginT-0 marginV-0 />
            <AppButton
              onPress={() => router.navigate('/settings/edit-profile')}>
              <SettingsItem
                translationKey="settings.edit_profile"
                rightElement={<AppIcon set="Feather" name="edit-2" size={20} />}
              />
            </AppButton>
            <SettingsItemDivider />
            <AppButton
              onPress={() => router.navigate('/settings/settings-preferences')}>
              <SettingsItem
                translationKey="settings.settings_preferences"
                rightElement={
                  <AppIcon set="Feather" name="settings" size={22} />
                }
              />
            </AppButton>

            <SettingsItemDivider />
            <AppButton
              onPress={() => router.navigate('/settings/send-feedback')}>
              <SettingsItem
                translationKey="feedback.submit_feedback"
                rightElement={
                  <AppIcon set="Feather" name="message-square" size={22} />
                }
              />
            </AppButton>
            <SettingsItemDivider />

            <AppButton onPress={() => router.navigate('/settings/archieved')}>
              <SettingsItem
                translationKey="habits.archive"
                rightElement={
                  <AppIcon set="Feather" name="archive" size={20} />
                }
              />
            </AppButton>
            <SettingsItemDivider />

            <AppButton
              onPress={() => router.navigate('/settings/contact-support')}>
              <SettingsItem
                translationKey="settings.contact_support"
                rightElement={
                  <AppIcon set="Feather" name="help-circle" size={22} />
                }
              />
            </AppButton>
            <SettingsItemDivider />

            <UsefulLinks />
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
        options={[
          {
            label: t('settings.friends'),
            onPress: () => {
              setIsMenuVisible(false);
              router.navigate('/settings/my-friends');
            },
            icon: <AppIcon set="Ionicons" name="people-outline" size={20} />,
          },
          {
            label: t('settings.accountability'),
            onPress: () => {
              setIsMenuVisible(false);
              router.navigate('/settings/accountability');
            },
            icon: (
              <AppIcon
                set="MaterialCommunityIcons"
                name="account-eye-outline"
                size={22}
              />
            ),
          },
        ]}
        title={t('settings.friends_accountability')}
        visible={isMenuVisible}
        onDismiss={() => setIsMenuVisible(false)}
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
    paddingBottom: 48,
  },
  content: { flex: 1 },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
});

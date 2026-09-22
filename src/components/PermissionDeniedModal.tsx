import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppDialog } from '@/components/AppDialog';
import { AppIcon } from '@/components/AppIcon';
import { Divider } from '@/components/Divider';
import { TranslatedText } from '@/components/TranslatedText';
import { AppText, AppView } from '@/components/ui';
import { useLocalization } from '@/hooks/useLocalization';
import { TranslationKeysType } from '@/lib/localization/types/i18n.types';
import { Platform } from 'react-native';
import { Colors } from 'react-native-ui-lib';

interface PermissionDeniedModalProps {
  visible: boolean;
  onDismiss: () => void;
  onOpenSettings: () => void;
  title?: TranslationKeysType;
  description?: TranslationKeysType;
  permissionType?: string;
}

export const PermissionDeniedModal = ({
  visible,
  onDismiss,
  onOpenSettings,
  title = 'permissions.contacts_denied_title',
  description = 'permissions.contacts_denied_description',
  permissionType = 'Contacts',
}: PermissionDeniedModalProps) => {
  const { t } = useLocalization();
  const platformText = Platform.OS === 'ios' ? 'iOS' : 'Android';

  return (
    <AppDialog visible={visible} onDismiss={onDismiss}>
      <AppCard padding-24 bg-cardBG>
        <AppView centerH marginB-16>
          <AppView
            bg-error
            center
            style={{ width: 64, height: 64, borderRadius: 32 }}>
            <AppIcon set="Feather" name="alert-circle" size={32} />
          </AppView>
        </AppView>

        <TranslatedText subtitle2 textColor center translationKey={title} />
        <Divider margin-8 />

        <TranslatedText xsm textColor center translationKey={description} />
        <Divider margin-4 />

        <AppView bg-lightCardBG padding-12 br10 marginV-12>
          <AppText xsm textColor>
            <AppText xsm textColor style={{ fontWeight: '600' }}>
              {`${t('permissions.instructions_header', { platform: platformText, permissionType })}\n`}
            </AppText>
            {Platform.OS === 'ios'
              ? t('permissions.ios_steps', { permissionType })
              : t('permissions.android_steps', { permissionType })}
          </AppText>
        </AppView>

        <Divider margin-12 />

        <AppView row centerV gap-8>
          <AppButton
            row
            bg-primary
            br20
            padding-12
            flex
            center
            onPress={onDismiss}>
            <AppIcon name="close" color={Colors.textOnPrimary} size={16} />
            <Divider margin-4 />
            <TranslatedText
              caption
              textOnPrimary
              translationKey="common.cancel"
            />
          </AppButton>
          <AppButton
            row
            bg-success
            br20
            padding-12
            flex
            center
            onPress={onOpenSettings}>
            <AppIcon
              set="Feather"
              name="settings"
              color={Colors.white}
              size={16}
            />
            <Divider margin-4 />
            <TranslatedText
              caption
              white
              translationKey="permissions.open_settings"
            />
          </AppButton>
        </AppView>
      </AppCard>
    </AppDialog>
  );
};

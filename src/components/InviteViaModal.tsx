import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppIcon } from '@/components/AppIcon';
import { AppModal } from '@/components/AppModal';
import { AppText, AppView } from '@/components/ui';
import { useLocalization } from '@/hooks/useLocalization';
import { useToast } from '@/hooks/useToast';
import React from 'react';
import { Linking, Platform, Share, StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

interface InviteViaModalProps {
  visible: boolean;
  setIsVisible: (_visible: boolean) => void;
  phoneNumber?: string;
  contactName?: string;
}

const APP_STORE_URL = 'https://apps.apple.com/app/dead-reckoner'; // TODO: Update with actual URL
const PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.deadreckoner'; // TODO: Update with actual URL

export const InviteViaModal: React.FC<InviteViaModalProps> = ({
  visible,
  setIsVisible,
  phoneNumber,
  contactName: _contactName,
}) => {
  const { t } = useLocalization();
  const { showToast } = useToast();

  const onDismiss = () => setIsVisible(false);

  const getInviteMessage = () => {
    const storeUrl = Platform.OS === 'ios' ? APP_STORE_URL : PLAY_STORE_URL;
    return t('settings.invite_message', {
      appStoreUrl: storeUrl,
    });
  };

  const handleSMS = async () => {
    try {
      const message = getInviteMessage();
      const phone = phoneNumber || '';
      const url = Platform.select({
        ios: `sms:${phone}&body=${encodeURIComponent(message)}`,
        android: `sms:${phone}?body=${encodeURIComponent(message)}`,
        default: `sms:${phone}?body=${encodeURIComponent(message)}`,
      });

      if (url) {
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
          await Linking.openURL(url);
          onDismiss();
        } else {
          showToast({
            message: t('settings.sms_not_available'),
            type: 'failure',
          });
        }
      }
    } catch {
      showToast({
        message: t('settings.invite_failed'),
        type: 'failure',
      });
    }
  };

  const handleWhatsApp = async () => {
    try {
      const message = getInviteMessage();

      const phone = phoneNumber ? phoneNumber.replace(/[^0-9]/g, '') : '';

      let url = `https://wa.me/+91${phone}?text=${encodeURIComponent(message)}`;

      let canOpen = await Linking.canOpenURL(url);

      if (!canOpen) {
        url = `whatsapp://send?text=${encodeURIComponent(message)}`;
        canOpen = await Linking.canOpenURL(url);
      }

      if (canOpen) {
        await Linking.openURL(url);
        onDismiss();
      } else {
        showToast({
          message: t('settings.whatsapp_not_available'),
          type: 'failure',
        });
      }
    } catch {
      showToast({
        message: t('settings.invite_failed'),
        type: 'failure',
      });
    }
  };

  const handleOther = async () => {
    try {
      const message = getInviteMessage();

      if (Platform.OS === 'web') {
        showToast({
          message: t('settings.share_not_available'),
          type: 'failure',
        });
        return;
      }

      await Share.share({
        message,
      });
      onDismiss();
    } catch (error) {
      if ((error as { code?: string }).code !== 'CANCEL') {
        showToast({
          message: t('settings.invite_failed'),
          type: 'failure',
        });
      }
    }
  };

  const inviteOptions = [
    {
      label: t('settings.invite_via_sms'),
      onPress: handleSMS,
      icon: <AppIcon set="AntDesign" name="message" size={20} />,
    },
    {
      label: t('settings.invite_via_whatsapp'),
      onPress: handleWhatsApp,
      icon: <AppIcon set="Ionicons" name="logo-whatsapp" size={20} />,
    },
    {
      label: t('settings.invite_via_other'),
      onPress: handleOther,
      icon: <AppIcon set="AntDesign" name="share-alt" size={20} />,
    },
  ];

  return (
    <AppModal
      visible={visible}
      setIsVisible={setIsVisible}
      snapPoints={['40%']}
      enablePanDownToClose={true}
      backgroundStyle={styles.modalBackground}
      contentContainerStyle={styles.contentContainer}>
      <AppView>
        <AppView row centerV spread marginB-24>
          <AppText textColor subtitle2>
            {t('settings.invite_via_title')}
          </AppText>
          <AppButton onPress={onDismiss}>
            <AppIcon set="AntDesign" name="close" size={24} />
          </AppButton>
        </AppView>

        <AppCard bg-pickerBG padding-0>
          {inviteOptions.map((option, index) => (
            <React.Fragment key={option.label}>
              <AppButton padding-16 onPress={option.onPress}>
                <AppView row centerV spread>
                  <AppText body2 textColor>
                    {option.label}
                  </AppText>
                  {option.icon}
                </AppView>
              </AppButton>
              {index < inviteOptions.length - 1 && (
                <AppView
                  style={[
                    styles.divider,
                    { backgroundColor: Colors.lineDivider },
                  ]}
                />
              )}
            </React.Fragment>
          ))}
        </AppCard>
      </AppView>
    </AppModal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },

  divider: {
    height: 1,
    width: '100%',
  },
});

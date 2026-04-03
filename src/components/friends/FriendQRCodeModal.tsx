import { AppModal } from '@/components/AppModal';
import { TranslatedText } from '@/components/TranslatedText';
import { AppView } from '@/components/ui';
import React from 'react';
import { Dimensions } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

interface FriendQRCodeModalProps {
  visible: boolean;
  setIsVisible: (_visible: boolean) => void;
  userId: string;
}

export const FriendQRCodeModal = ({
  visible,
  setIsVisible,
  userId,
}: FriendQRCodeModalProps) => {
  return (
    <AppModal visible={visible} setIsVisible={setIsVisible}>
      <AppView padding-32 centerH gap-32>
        <TranslatedText subtitle1 center translationKey="common.scan_qr_code" />
        <QRCode
          value={`deadreckoner://settings/friend-details/${userId}`}
          logoSize={40}
          logoBackgroundColor="transparent"
          size={Dimensions.get('screen').width / 1.5}
        />
      </AppView>
    </AppModal>
  );
};

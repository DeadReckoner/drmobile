import { AppButton } from '@/components/AppButton';
import { AppIcon } from '@/components/AppIcon';
import { AppModal } from '@/components/AppModal';
import { TranslatedText } from '@/components/TranslatedText';
import { AppText, AppView } from '@/components/ui';
import { useLocalization } from '@/hooks/useLocalization';
import { useEffect, useRef, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';
import { HOUR_ITEM_HEIGHT } from './constants';

type Props = {
  visible: boolean;
  currentHour24: number;
  onClose: () => void;
  onConfirm: (_hour24: number) => void;
};

const SCROLL_HEIGHT = Dimensions.get('window').height * 0.3;

export const HourPickerModal = ({
  visible,
  currentHour24,
  onClose,
  onConfirm,
}: Props) => {
  const { t } = useLocalization();
  const scrollRef = useRef<ScrollView>(null);
  const [pickerHour, setPickerHour] = useState(currentHour24 % 12 || 12);
  const [pickerPeriod, setPickerPeriod] = useState<'AM' | 'PM'>(
    currentHour24 >= 12 ? 'PM' : 'AM',
  );

  useEffect(() => {
    if (!visible) return;
    const h = currentHour24 % 12 || 12;
    setPickerHour(h);
    setPickerPeriod(currentHour24 >= 12 ? 'PM' : 'AM');
    const offset = Math.max(
      0,
      (h - 1) * HOUR_ITEM_HEIGHT - SCROLL_HEIGHT / 2 + HOUR_ITEM_HEIGHT / 2,
    );
    const timer = setTimeout(() => {
      scrollRef.current?.scrollTo({ y: offset, animated: false });
    }, 50);
    return () => clearTimeout(timer);
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleConfirm = () => {
    const hour24 =
      pickerPeriod === 'AM'
        ? pickerHour === 12
          ? 0
          : pickerHour
        : pickerHour === 12
          ? 12
          : pickerHour + 12;
    onConfirm(hour24);
  };

  return (
    <AppModal
      visible={visible}
      setIsVisible={(v) => {
        if (!v) onClose();
      }}
      snapPoints={['55%']}>
      <AppView row centerV spread marginB-20>
        <AppText body1 textColor semibold>
          {t('notifications.digest_delivery_hour')}
        </AppText>
        <AppButton onPress={onClose}>
          <AppIcon name="close" size={20} />
        </AppButton>
      </AppView>

      <AppView row style={styles.hourGrid} marginT-16>
        <AppView>
          <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((hour) => (
              <AppButton
                center
                key={hour}
                onPress={() => setPickerHour(hour)}
                style={styles.hourCellWrapper}>
                <AppView center style={styles.hourCell}>
                  <AppText
                    subtitle1
                    bold={pickerHour === hour}
                    color={pickerHour === hour ? Colors.white : Colors.outline}>
                    {hour}
                  </AppText>
                </AppView>
              </AppButton>
            ))}
          </ScrollView>
        </AppView>
        <AppView gap-16 padding-8 br10>
          <AppButton
            paddingH-16
            paddingV-8
            onPress={() => setPickerPeriod('AM')}>
            <AppText
              subtitle2
              bold={pickerPeriod === 'AM'}
              color={pickerPeriod === 'AM' ? Colors.white : Colors.outline}>
              AM
            </AppText>
          </AppButton>
          <AppButton
            paddingH-16
            paddingV-8
            onPress={() => setPickerPeriod('PM')}>
            <AppText
              subtitle2
              bold={pickerPeriod === 'PM'}
              color={pickerPeriod === 'PM' ? Colors.white : Colors.outline}>
              PM
            </AppText>
          </AppButton>
        </AppView>
      </AppView>

      <AppButton
        onPress={handleConfirm}
        style={[styles.doneButton, { backgroundColor: Colors.primary }]}>
        <TranslatedText
          body2
          semibold
          textOnPrimary
          translationKey="common.done"
        />
      </AppButton>
    </AppModal>
  );
};

const styles = StyleSheet.create({
  hourGrid: {
    height: SCROLL_HEIGHT,
    width: '50%',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hourCellWrapper: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  hourCell: {
    width: 100,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneButton: {
    marginTop: 20,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
});

import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppDialog } from '@/components/AppDialog';
import { AppIcon } from '@/components/AppIcon';
import { Divider } from '@/components/Divider';
import { Loader } from '@/components/Loader';
import { TranslatedText } from '@/components/TranslatedText';
import { AppText, AppTextField, AppView } from '@/components/ui';
import { useShiftRoadmapDatesMutation } from '@/hooks/roadmap';
import { useLocalization } from '@/hooks/useLocalization';
import { useToast } from '@/hooks/useToast';
import { useAppDispatch } from '@/store/hooks/store.hooks';
import { setDraftRoadmapAction } from '@/store/slices/roadmapDraftSlice';
import { getApiErrorMessage } from '@/utils/apiErrors.utils';
import { useCallback, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

interface ShiftDatesModalProps {
  roadmapId: string;
  visible: boolean;
  onDismiss: () => void;
}

export const ShiftDatesModal = ({
  roadmapId,
  visible,
  onDismiss,
}: ShiftDatesModalProps) => {
  const { t } = useLocalization();
  const { showToast } = useToast();
  const dispatch = useAppDispatch();

  const [daysInput, setDaysInput] = useState('');
  const [shiftRoadmapDates, { isLoading }] = useShiftRoadmapDatesMutation();

  const handleShift = useCallback(async () => {
    const days = parseInt(daysInput, 10);
    if (isNaN(days) || days === 0) {
      showToast({
        type: 'failure',
        message: t('roadmap.shift_dates.invalid_input'),
      });
      return;
    }

    try {
      const updated = await shiftRoadmapDates({
        roadmap_id: roadmapId,
        days,
      }).unwrap();
      dispatch(setDraftRoadmapAction(updated));
      showToast({ type: 'success', message: t('roadmap.shift_dates.success') });
      setDaysInput('');
    } catch (error) {
      showToast({ type: 'failure', message: getApiErrorMessage(error) });
    } finally {
      onDismiss();
    }
  }, [
    daysInput,
    dispatch,
    onDismiss,
    roadmapId,
    shiftRoadmapDates,
    showToast,
    t,
  ]);

  const handleDismiss = useCallback(() => {
    setDaysInput('');
    onDismiss();
  }, [onDismiss]);

  return (
    <AppDialog visible={visible} onDismiss={handleDismiss}>
      <AppCard padding-20 bg-cardBG>
        <AppView row centerV gap-8 marginB-4>
          <AppIcon
            set="MaterialCommunityIcons"
            name="calendar-arrow-right"
            color={Colors.textColor}
            size={22}
          />
          <TranslatedText
            subtitle2
            textColor
            translationKey="roadmap.shift_dates.title"
          />
        </AppView>
        <TranslatedText
          xsm
          textColor
          marginT-4
          translationKey="roadmap.shift_dates.description"
        />
        <Divider />
        <TranslatedText
          sm
          textColor
          marginB-8
          translationKey="roadmap.shift_dates.input_label"
        />
        <AppTextField
          body2
          value={daysInput}
          onChangeText={setDaysInput}
          keyboardType="number-pad"
          placeholder="ex. 7 or -3"
          placeholderTextColor={Colors.textSecondary}
          fieldStyle={[styles.input, { borderColor: Colors.accent }]}
          style={{ color: Colors.textColor }}
        />
        <AppView gap-8 marginT-16>
          <AppButton
            disabled={isLoading || !daysInput.trim()}
            bg-accent
            br20
            center
            style={styles.btn}
            padding-12
            onPress={handleShift}>
            {isLoading ? (
              <Loader transparent containerStyle={{ position: 'relative' }} />
            ) : (
              <AppView row center gap-8>
                <AppIcon
                  set="MaterialCommunityIcons"
                  name="calendar-arrow-right"
                  color={Colors.textOnPrimary}
                  size={20}
                />
                <AppText body2 white>
                  {t('roadmap.shift_dates.confirm_button')}
                </AppText>
              </AppView>
            )}
          </AppButton>
          <AppButton
            disabled={isLoading}
            br20
            center
            style={styles.btn}
            padding-12
            onPress={handleDismiss}>
            <AppText body2 textColor>
              {t('common.cancel')}
            </AppText>
          </AppButton>
        </AppView>
      </AppCard>
    </AppDialog>
  );
};

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 14,
    lineHeight: 28,
  },
  btn: {
    width: '100%',
  },
});

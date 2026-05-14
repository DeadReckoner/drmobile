import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppDialog } from '@/components/AppDialog';
import { AppIcon } from '@/components/AppIcon';
import { Divider } from '@/components/Divider';
import { Loader } from '@/components/Loader';
import { TranslatedText } from '@/components/TranslatedText';
import { AppText, AppTextField, AppView } from '@/components/ui';
import { useRealignRoadmapDatesMutation } from '@/hooks/roadmap';
import { useLocalization } from '@/hooks/useLocalization';
import { useToast } from '@/hooks/useToast';
import { useAppDispatch } from '@/store/hooks/store.hooks';
import { setDraftRoadmapAction } from '@/store/slices/roadmapDraftSlice';
import { getApiErrorMessage } from '@/utils/apiErrors.utils';
import { useCallback, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

interface RealignDatesModalProps {
  roadmapId: string;
  visible: boolean;
  onDismiss: () => void;
}

export const RealignDatesModal = ({
  roadmapId,
  visible,
  onDismiss,
}: RealignDatesModalProps) => {
  const { t } = useLocalization();
  const { showToast } = useToast();
  const dispatch = useAppDispatch();

  const [offsetInput, setOffsetInput] = useState('0');
  const [realignRoadmapDates, { isLoading }] = useRealignRoadmapDatesMutation();

  const handleRealign = useCallback(async () => {
    const offset_days = parseInt(offsetInput, 10);
    const safeOffset = isNaN(offset_days) || offset_days < 0 ? 0 : offset_days;

    try {
      const response = await realignRoadmapDates({
        roadmap_id: roadmapId,
        offset_days: safeOffset,
      }).unwrap();
      dispatch(setDraftRoadmapAction(response.roadmap));
      showToast({
        type: 'success',
        message: t('roadmap.realign_dates.success'),
      });
      setOffsetInput('0');
    } catch (error) {
      showToast({ type: 'failure', message: getApiErrorMessage(error) });
    } finally {
      onDismiss();
    }
  }, [
    dispatch,
    offsetInput,
    onDismiss,
    realignRoadmapDates,
    roadmapId,
    showToast,
    t,
  ]);

  const handleDismiss = useCallback(() => {
    setOffsetInput('0');
    onDismiss();
  }, [onDismiss]);

  return (
    <AppDialog visible={visible} onDismiss={handleDismiss}>
      <AppCard padding-20 bg-cardBG>
        <AppView row centerV gap-8 marginB-4>
          <AppIcon
            set="MaterialCommunityIcons"
            name="calendar-sync-outline"
            color={Colors.textColor}
            size={22}
          />
          <TranslatedText
            subtitle2
            textColor
            translationKey="roadmap.realign_dates.title"
          />
        </AppView>
        <TranslatedText
          xsm
          textColor
          marginT-4
          translationKey="roadmap.realign_dates.description"
        />
        <Divider margin-12 />
        <TranslatedText
          sm
          textColor
          marginB-8
          translationKey="roadmap.realign_dates.offset_label"
        />
        <AppTextField
          body2
          value={offsetInput}
          onChangeText={setOffsetInput}
          keyboardType="number-pad"
          placeholder="0"
          placeholderTextColor={Colors.textSecondary}
          fieldStyle={[styles.input, { borderColor: Colors.accent }]}
          style={{ color: Colors.textColor }}
        />
        <AppView gap-8 marginT-16>
          <AppButton
            disabled={isLoading}
            bg-accent
            br20
            center
            style={styles.btn}
            padding-12
            onPress={handleRealign}>
            {isLoading ? (
              <Loader transparent containerStyle={{ position: 'relative' }} />
            ) : (
              <AppView row center gap-8>
                <AppIcon
                  set="MaterialCommunityIcons"
                  name="calendar-sync-outline"
                  color={Colors.textOnPrimary}
                  size={20}
                />
                <AppText body2 white>
                  {t('roadmap.realign_dates.confirm_button')}
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

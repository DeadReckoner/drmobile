import { AppButton } from '@/components/AppButton';
import { AppIcon } from '@/components/AppIcon';
import { AppModal } from '@/components/AppModal';
import { Divider } from '@/components/Divider';
import { Loader } from '@/components/Loader';
import { TranslatedText } from '@/components/TranslatedText';
import { AppView } from '@/components/ui';
import { useNudgeRoadmapMutation } from '@/hooks/roadmap';
import { useLocalization } from '@/hooks/useLocalization';
import { useToast } from '@/hooks/useToast';
import { getApiErrorMessage } from '@/utils/apiErrors.utils';
import { useCallback, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

interface RoadmapNudgeButtonProps {
  roadmapId: string;
  disabled?: boolean;
}

export const RoadmapNudgeButton = ({
  roadmapId,
  disabled,
}: RoadmapNudgeButtonProps) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [nudgeRoadmap, { isLoading: isNudging }] = useNudgeRoadmapMutation();
  const { showToast } = useToast();
  const { t } = useLocalization();

  const onSendNudgePress = useCallback(async () => {
    try {
      await nudgeRoadmap({ roadmapId }).unwrap();
      showToast({ type: 'success', message: t('roadmap.nudge_sent') });
    } catch (error) {
      showToast({
        type: 'failure',
        message: getApiErrorMessage(error) || t('roadmap.nudge_failed'),
      });
    } finally {
      setIsModalVisible(false);
    }
  }, [nudgeRoadmap, roadmapId, showToast, t]);

  return (
    <>
      <AppButton
        center
        bg-accent
        br100
        disabled={disabled || isNudging}
        style={styles.nudgeButton}
        onPress={() => setIsModalVisible(true)}>
        <AppIcon
          set="Ionicons"
          name="paper-plane-outline"
          size={32}
          color={Colors.textOnPrimary}
        />
      </AppButton>

      <AppModal
        visible={isModalVisible}
        setIsVisible={setIsModalVisible}
        snapPoints={['30%']}
        dismissible={!isNudging}>
        <AppView flex-1 style={styles.modalContent}>
          <TranslatedText
            subtitle1
            semibold
            textColor
            translationKey="roadmap.send_nudge"
          />
          <Divider marginV-4 />
          <TranslatedText
            body2
            light
            textColor
            translationKey="roadmap.send_nudge_details"
          />

          <AppView row gap-8 marginT-20>
            <AppButton
              center
              br20
              bg-error
              disabled={isNudging}
              style={styles.modalActionButton}
              onPress={() => setIsModalVisible(false)}>
              <TranslatedText textOnPrimary translationKey="common.cancel" />
            </AppButton>
            <AppButton
              center
              br20
              bg-accent
              disabled={isNudging}
              style={styles.modalActionButton}
              onPress={onSendNudgePress}>
              {isNudging ? (
                <Loader transparent />
              ) : (
                <TranslatedText
                  textOnPrimary
                  translationKey="roadmap.send_nudge"
                />
              )}
            </AppButton>
          </AppView>
        </AppView>
      </AppModal>
    </>
  );
};

const styles = StyleSheet.create({
  nudgeButton: {
    width: 70,
    height: 70,

    position: 'absolute',
    bottom: 32,
    right: 24,
  },
  modalContent: {
    position: 'relative',
  },
  modalActionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
});

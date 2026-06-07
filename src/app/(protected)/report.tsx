import { AppScreen } from '@/components/AppScreen';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { PrimaryButton } from '@/components/PrimaryButton';
import { TranslatedTextInput } from '@/components/TranslatedTextInput';
import { AppView } from '@/components/ui';
import { useLocalization } from '@/hooks/useLocalization';
import { useToast } from '@/hooks/useToast';
import { useSubmitReportMutation } from '@/store/apis/reportApi';
import { SubmitReportParamsType } from '@/store/apis/types/reportApi.types';
import { getNonEmptyObject } from '@/utils/validation.utils';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

const ReportScreen = () => {
  const { t } = useLocalization();
  const { showToast } = useToast();
  const params = useLocalSearchParams<{
    messageId?: string;
    friendId?: string;
  }>();
  const [submitReport, { isLoading }] = useSubmitReportMutation();

  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const handleNoteChange = (text: string) => {
    setNote(text);
    if (error) setError('');
  };

  const handleSubmit = async () => {
    const trimmedNote = note.trim();
    if (!trimmedNote) {
      setError(t('report.validation.note_required'));
      return;
    }

    try {
      const payload = {
        message_id: params.messageId,
        friend_id: params.friendId,
        note: trimmedNote,
      };

      await submitReport(
        getNonEmptyObject<SubmitReportParamsType>(payload),
      ).unwrap();

      showToast({
        type: 'success',
        message: t('report.success_message'),
      });

      router.back();
    } catch {
      showToast({
        type: 'failure',
        message: t('report.error_message'),
      });
    }
  };

  return (
    <AppScreen safeArea paddingH-16>
      <HeaderWithBack headerKey="report.title" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}>
        <AppView marginT-24>
          <TranslatedTextInput
            body1
            labelKey="report.note_label"
            placeholderKey="report.note_placeholder"
            value={note}
            onChangeText={handleNoteChange}
            error={error}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            style={styles.noteInput}
          />
        </AppView>
        <PrimaryButton
          label={'report.submit_button'}
          onPress={handleSubmit}
          shouldShowLoader
          isLoading={isLoading}
          disabled={isLoading}
        />
      </ScrollView>
    </AppScreen>
  );
};

export default ReportScreen;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  noteInput: {
    minHeight: 120,
  },
});

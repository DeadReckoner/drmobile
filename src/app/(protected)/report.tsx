import { AppScreen } from '@/components/AppScreen';
import { Divider } from '@/components/Divider';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { PrimaryButton } from '@/components/PrimaryButton';
import {
  ReportReasonOptionType,
  ReportReasonPicker,
} from '@/components/report/ReportReasonPicker';
import { TranslatedTextInput } from '@/components/TranslatedTextInput';
import { AppView } from '@/components/ui';
import { useLocalization } from '@/hooks/useLocalization';
import { useToast } from '@/hooks/useToast';
import { useSubmitReportMutation } from '@/store/apis/reportApi';
import { UserReportReasonType } from '@/store/apis/types/reportApi.types';
import { getApiErrorMessage } from '@/utils/apiErrors.utils';
import { getDeviceInfo } from '@/utils/device.utils';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

const USER_REPORT_REASONS: ReportReasonOptionType[] = [
  { value: 'harassment', labelKey: 'report.reasons.harassment' },
  { value: 'spam', labelKey: 'report.reasons.spam' },
  {
    value: 'inappropriate_content',
    labelKey: 'report.reasons.inappropriate_content',
  },
  { value: 'impersonation', labelKey: 'report.reasons.impersonation' },
  { value: 'other', labelKey: 'report.reasons.other' },
];

const ReportScreen = () => {
  const { t } = useLocalization();
  const { showToast } = useToast();
  const params = useLocalSearchParams<{
    messageId?: string;
    friendId?: string;
    threadId?: string;
  }>();
  const [submitReport, { isLoading }] = useSubmitReportMutation();

  const [reason, setReason] = useState<UserReportReasonType | ''>('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const handleReasonSelect = (value: string) => {
    setReason(value as UserReportReasonType);
    setError('');
  };

  const handleNoteChange = (text: string) => {
    setNote(text);
    if (error) setError('');
  };

  const handleSubmit = async () => {
    if (!reason || !params.friendId) return;

    const trimmedNote = note.trim();
    if (reason === 'other' && !trimmedNote) {
      setError(t('report.validation.note_required'));
      return;
    }

    try {
      await submitReport({
        type: 'user',
        reason,
        reported_user_id: params.friendId,
        thread_id: params.threadId,
        message_id: params.messageId,
        note: reason === 'other' ? trimmedNote : undefined,
        ...getDeviceInfo(),
      }).unwrap();

      showToast({
        type: 'success',
        message: t('report.success_message'),
      });

      router.back();
    } catch (apiError) {
      showToast({
        type: 'failure',
        message: getApiErrorMessage(apiError),
      });
    }
  };

  return (
    <AppScreen safeArea paddingH-16>
      <HeaderWithBack headerKey="report.title" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}>
        <AppView marginT-24 gap-16>
          <ReportReasonPicker
            reasons={USER_REPORT_REASONS}
            selected={reason}
            onSelect={handleReasonSelect}
          />
          {reason === 'other' && (
            <TranslatedTextInput
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
          )}
        </AppView>
        <Divider />
        <PrimaryButton
          label={'report.submit_button'}
          onPress={handleSubmit}
          shouldShowLoader
          isLoading={isLoading}
          disabled={isLoading || !reason}
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
    minHeight: 80,
  },
});

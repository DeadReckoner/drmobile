import { AppScreen } from '@/components/AppScreen';
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
import { AIReportReasonType } from '@/store/apis/types/reportApi.types';
import { getApiErrorMessage } from '@/utils/apiErrors.utils';
import { getDeviceInfo } from '@/utils/device.utils';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

const AI_REPORT_REASONS: ReportReasonOptionType[] = [
  { value: 'unsafe', labelKey: 'roadmap.report_ai_output.reasons.unsafe' },
  {
    value: 'inaccurate',
    labelKey: 'roadmap.report_ai_output.reasons.inaccurate',
  },
  {
    value: 'offensive',
    labelKey: 'roadmap.report_ai_output.reasons.offensive',
  },
  {
    value: 'medical_mental_health',
    labelKey: 'roadmap.report_ai_output.reasons.medical_mental_health',
  },
  {
    value: 'legal_financial',
    labelKey: 'roadmap.report_ai_output.reasons.legal_financial',
  },
  { value: 'other', labelKey: 'roadmap.report_ai_output.reasons.other' },
];

const ReportAIOutputScreen = () => {
  const { t } = useLocalization();
  const { showToast } = useToast();
  const params = useLocalSearchParams<{
    outputType?: string;
    outputId?: string;
    roadmapId?: string;
    jobId?: string;
    contextText?: string;
    contextSurface?: string;
  }>();
  const outputType = params.outputType || 'roadmap';
  const [submitReport, { isLoading }] = useSubmitReportMutation();

  const [reason, setReason] = useState<AIReportReasonType | ''>('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const handleReasonSelect = (value: string) => {
    setReason(value as AIReportReasonType);
    setError('');
  };

  const handleNoteChange = (text: string) => {
    setNote(text);
    if (error) setError('');
  };

  const handleSubmit = async () => {
    if (!reason) return;

    const trimmedNote = note.trim();
    if (reason === 'other' && !trimmedNote) {
      setError(t('report.validation.note_required'));
      return;
    }

    // An AI report needs either a stable output_id or a context snapshot.
    const outputId = params.outputId || params.roadmapId;
    const context = params.contextText
      ? {
          surface: params.contextSurface || outputType,
          text: params.contextText,
        }
      : undefined;

    try {
      await submitReport({
        type: 'ai',
        reason,
        output_type: outputType,
        output_id: outputId,
        roadmap_id: params.roadmapId,
        job_id: params.jobId,
        context: outputId ? undefined : context,
        note: reason === 'other' ? trimmedNote : undefined,
        ...getDeviceInfo(),
      }).unwrap();

      showToast({
        type: 'success',
        message: t('roadmap.report_ai_output.success_message'),
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
      <HeaderWithBack headerKey="roadmap.report_ai_output.title" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}>
        <AppView marginT-24 marginB-16 gap-16>
          <ReportReasonPicker
            reasons={AI_REPORT_REASONS}
            selected={reason}
            onSelect={handleReasonSelect}
          />
          {reason === 'other' && (
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
          )}
        </AppView>
        <PrimaryButton
          label={'report.submit_button'}
          onPress={handleSubmit}
          shouldShowLoader
          isLoading={isLoading}
          disabled={isLoading || !reason || (reason === 'other' && !note)}
        />
      </ScrollView>
    </AppScreen>
  );
};

export default ReportAIOutputScreen;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  noteInput: {
    minHeight: 120,
  },
});

import { Env } from '@/constants/Env';
import { useLocalization } from '@/hooks/useLocalization';
import * as MailComposer from 'expo-mail-composer';
import { Alert } from 'react-native';

interface SendFeedbackEmailParams {
  subject: string;
  body: string;
}

export const useMail = () => {
  const { t } = useLocalization();

  const sendFeedbackEmail = async ({
    subject,
    body,
  }: SendFeedbackEmailParams) => {
    const isAvailable = await MailComposer.isAvailableAsync();
    if (!isAvailable) {
      Alert.alert(t('app_feedback.email_composer_not_available'));
      return;
    }

    const options = {
      recipients: [Env.EXPO_PUBLIC_FEEDBACK_MAIL],
      subject,
      body,
    };

    try {
      await MailComposer.composeAsync(options);
    } catch {
      Alert.alert(t('common.something_went_wrong'));
    }
  };

  return { sendFeedbackEmail };
};

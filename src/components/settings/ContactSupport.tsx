import { AppScreen } from '@/components/AppScreen';
import { Divider } from '@/components/Divider';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { PrimaryButton } from '@/components/PrimaryButton';
import { TranslatedTextInput } from '@/components/TranslatedTextInput';
import { AppView } from '@/components/ui';
import { useLocalization } from '@/hooks/useLocalization';
import { useMail } from '@/hooks/useMail';
import React, { useState } from 'react';
import { Alert, StyleSheet } from 'react-native';
import {
  KeyboardAwareScrollView,
  KeyboardGestureArea,
  KeyboardToolbar,
} from 'react-native-keyboard-controller';

export const ContactSupport = () => {
  const { sendFeedbackEmail } = useMail();
  const { t } = useLocalization();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const onSendMessage = () => {
    if (!subject || !message) {
      Alert.alert(
        t('common.error_occurred'),
        t('app_feedback.fill_subject_message'),
      );
      return;
    }

    sendFeedbackEmail({ subject, body: message });
  };

  return (
    <>
      <AppScreen safeArea>
        <KeyboardGestureArea style={styles.gestureWrapper} interpolator="ios">
          <KeyboardAwareScrollView
            bottomOffset={100}
            keyboardDismissMode="interactive"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentScrollview}>
            <Divider margin-4 />
            <HeaderWithBack headerKey="settings.contact_support" />
            <Divider />

            <AppView>
              <TranslatedTextInput
                labelKey="app_feedback.subject_label"
                placeholderKey="app_feedback.subject_placeholder"
                value={subject}
                onChangeText={setSubject}
                next
              />
              <TranslatedTextInput
                labelKey="app_feedback.email_body_label"
                placeholderKey="app_feedback.email_body_placeholder"
                value={message}
                onChangeText={setMessage}
              />
              <PrimaryButton
                label="app_feedback.review_and_send"
                onPress={onSendMessage}
              />
            </AppView>
          </KeyboardAwareScrollView>
        </KeyboardGestureArea>
      </AppScreen>
      <KeyboardToolbar />
    </>
  );
};

const styles = StyleSheet.create({
  gestureWrapper: {
    flex: 1,
  },
  contentScrollview: {
    flexGrow: 1,
  },
});

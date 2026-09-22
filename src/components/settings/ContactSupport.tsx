import { AppScreen } from '@/components/AppScreen';
import { Divider } from '@/components/Divider';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { PrimaryButton } from '@/components/PrimaryButton';
import { TranslatedTextInput } from '@/components/TranslatedTextInput';
import { AppView } from '@/components/ui';
import { useLocalization } from '@/hooks/useLocalization';
import { useToast } from '@/hooks/useToast';
import { useSubmitFeedbackMutation } from '@/store/apis/feedbackApi';
import { getDeviceInfo } from '@/utils/device.utils';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import {
  KeyboardAwareScrollView,
  KeyboardGestureArea,
  KeyboardToolbar,
} from 'react-native-keyboard-controller';

/** Mirrors the min=10 binding on CreateFeedbackRequest server-side. */
const MIN_MESSAGE_LENGTH = 10;

export const ContactSupport = () => {
  const { t } = useLocalization();
  const { showToast } = useToast();
  const [submitFeedback, { isLoading }] = useSubmitFeedbackMutation();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const onSendMessage = async () => {
    const trimmedSubject = subject.trim();
    const trimmedMessage = message.trim();

    if (!trimmedSubject || !trimmedMessage) {
      showToast({
        type: 'warning',
        message: t('app_feedback.fill_subject_message'),
      });
      return;
    }

    if (trimmedMessage.length < MIN_MESSAGE_LENGTH) {
      showToast({
        type: 'warning',
        message: t('app_feedback.validation.message_min_length'),
      });
      return;
    }

    try {
      const deviceInfo = getDeviceInfo();

      await submitFeedback({
        category: 'support',
        subject: trimmedSubject,
        message: trimmedMessage,
        app_version: deviceInfo.appVersion,
        os: deviceInfo.os,
        device: deviceInfo.device,
      }).unwrap();

      showToast({
        type: 'success',
        message: t('app_feedback.success_message'),
      });

      router.back();
    } catch {
      showToast({
        type: 'warning',
        message: t('app_feedback.error_message'),
      });
    }
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
                label="app_feedback.send_message"
                onPress={onSendMessage}
                isLoading={isLoading}
                shouldShowLoader
                disabled={isLoading}
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

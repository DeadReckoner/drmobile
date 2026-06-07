import { AppCard } from '@/components/AppCard';
import { AppIcon } from '@/components/AppIcon';
import { AppScreen } from '@/components/AppScreen';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { PrimaryButton } from '@/components/PrimaryButton';
import { TranslatedText } from '@/components/TranslatedText';
import { TranslatedTextInput } from '@/components/TranslatedTextInput';
import { AppText, AppView } from '@/components/ui';
import {
  FeedbackFormValuesType,
  useFeedbackValidation,
} from '@/hooks/feedback/useFeedbackValidation';
import { useLocalization } from '@/hooks/useLocalization';
import { useToast } from '@/hooks/useToast';
import { TranslationKeysType } from '@/lib/localization/types/i18n.types';
import { useSubmitFeedbackMutation } from '@/store/apis/feedbackApi';
import { FeedbackCategoryType } from '@/store/apis/types/feedbackApi.types';
import { getDeviceInfo } from '@/utils/device.utils';
import { router } from 'expo-router';
import { useFormik } from 'formik';
import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

const FEEDBACK_CATEGORIES: {
  value: FeedbackCategoryType;
  labelKey: TranslationKeysType;
  icon: 'bug' | 'bulb' | 'message';
}[] = [
  { value: 'bug', labelKey: 'app_feedback.categories.bug', icon: 'bug' },
  {
    value: 'feature',
    labelKey: 'app_feedback.categories.feature',
    icon: 'bulb',
  },
  {
    value: 'general',
    labelKey: 'app_feedback.categories.general',
    icon: 'message',
  },
];

const SendFeedbackPage = () => {
  const { t } = useLocalization();
  const { showToast } = useToast();
  const { schema } = useFeedbackValidation();
  const [submitFeedback, { isLoading }] = useSubmitFeedbackMutation();

  const [selectedCategory, setSelectedCategory] = useState<
    FeedbackCategoryType | ''
  >('');

  const initialValues: FeedbackFormValuesType = {
    category: '',
    message: '',
  };

  const onSubmit = async (values: FeedbackFormValuesType) => {
    try {
      const deviceInfo = getDeviceInfo();

      await submitFeedback({
        category: values.category as FeedbackCategoryType,
        message: values.message,
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

  const formik = useFormik({
    initialValues,
    validationSchema: schema,
    onSubmit,
  });

  const handleCategorySelect = (category: FeedbackCategoryType) => {
    setSelectedCategory(category);
    formik.setFieldValue('category', category);
  };

  return (
    <AppScreen safeArea paddingH-16>
      <HeaderWithBack headerKey="app_feedback.title" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}>
        <AppView flex-1>
          <AppView marginV-24>
            <AppView row flex-1 spread>
              {FEEDBACK_CATEGORIES.map((category) => {
                const isSelected = selectedCategory === category.value;
                return (
                  <AppCard
                    key={category.value}
                    padding-16
                    style={[
                      styles.categoryCard,
                      isSelected && {
                        backgroundColor: Colors.blue,
                      },
                      { flexWrap: 'wrap', maxWidth: '30%' },
                    ]}
                    onPress={() => handleCategorySelect(category.value)}>
                    <AppView center>
                      {category.value === 'bug' && (
                        <AppIcon
                          name="exclamation-circle"
                          size={24}
                          color={
                            isSelected ? Colors.textOnPrimary : Colors.textColor
                          }
                        />
                      )}
                      {category.value === 'feature' && (
                        <AppIcon
                          name="bulb"
                          size={24}
                          color={
                            isSelected ? Colors.textOnPrimary : Colors.textColor
                          }
                        />
                      )}
                      {category.value === 'general' && (
                        <AppIcon
                          name="message"
                          size={24}
                          color={
                            isSelected ? Colors.textOnPrimary : Colors.textColor
                          }
                        />
                      )}
                    </AppView>
                    <TranslatedText
                      marginT-8
                      center
                      xsm
                      color={
                        isSelected ? Colors.textOnPrimary : Colors.textColor
                      }
                      style={{ flexWrap: 'wrap', maxWidth: '100%' }}
                      translationKey={category.labelKey}
                    />
                  </AppCard>
                );
              })}
            </AppView>
            {formik.touched.category && formik.errors.category && (
              <AppText error sm marginT-8>
                {formik.errors.category}
              </AppText>
            )}
          </AppView>

          <TranslatedTextInput
            labelKey="app_feedback.message_label"
            placeholderKey="app_feedback.message_placeholder"
            onChangeText={formik.handleChange('message')}
            onBlur={formik.handleBlur('message')}
            error={formik.touched.message && formik.errors.message}
            value={formik.values.message}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            style={styles.messageInput}
          />
        </AppView>

        <PrimaryButton
          label={'app_feedback.submit_button'}
          onPress={formik.handleSubmit}
          shouldShowLoader
          isLoading={isLoading}
          disabled={isLoading}
        />
      </ScrollView>
    </AppScreen>
  );
};

export default SendFeedbackPage;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  categoryCard: {
    borderRadius: 12,
  },
  messageInput: {
    minHeight: 120,
  },
});

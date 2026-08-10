import { OrDivider } from '@/components/auth/OrDivider';
import { SocialLogin } from '@/components/auth/SocialLogin';
import { Divider } from '@/components/Divider';
import { PrimaryButton } from '@/components/PrimaryButton';
import { TranslatedText } from '@/components/TranslatedText';
import { TranslatedTextInput } from '@/components/TranslatedTextInput';
import {
  AppCheckbox,
  AppText,
  AppTouchableOpacity,
  AppView,
} from '@/components/ui';
import { AppURLs } from '@/constants/AppURLs.constants';
import {
  AuthErrorType,
  SessionLessUserType,
} from '@/hooks/auth/types/auth.types';
import { useSignupForm } from '@/hooks/auth/useSignupForm';
import { useToast } from '@/hooks/useToast';
import { router } from 'expo-router';
import { useState } from 'react';
import { Colors } from 'react-native-ui-lib';

export const SignupForm = () => {
  const { showToast } = useToast();
  const [isChecked, setIsChecked] = useState(false);
  const [showCheckError, setShowChekError] = useState(false);

  const onSuccess = (user: SessionLessUserType) => {
    if (!user?.access_token) {
      router.replace('/check-email');
    }
  };

  const onError = (error: AuthErrorType) => {
    if (error.message === 'privacy_not_accepted') {
      setShowChekError(true);
      return;
    }
    setShowChekError(false);
    showToast({
      type: 'failure',
      message: error.message,
    });
  };
  const { isLoading, handleSubmit, handleChange, handleBlur, touched, errors } =
    useSignupForm({
      onSuccess,
      onError,
      isTermsAccepted: isChecked,
    });

  const onSubmitPress = () => {
    if (!isChecked) {
      setShowChekError(true);
    }
    handleSubmit();
  };

  return (
    <AppView marginV-40>
      <TranslatedTextInput
        labelKey="authentication.first_name"
        placeholderKey="authentication.first_name"
        onChangeText={handleChange('firstName')}
        onBlur={handleBlur('firstName')}
        error={touched.firstName && errors.firstName}
      />
      <TranslatedTextInput
        labelKey="authentication.last_name"
        placeholderKey="authentication.last_name"
        onChangeText={handleChange('lastName')}
        onBlur={handleBlur('lastName')}
        error={touched.lastName && errors.lastName}
      />
      <TranslatedTextInput
        labelKey="authentication.your_email"
        placeholderKey="authentication.email_placeholder"
        onChangeText={handleChange('email')}
        onBlur={handleBlur('email')}
        error={touched.email && errors.email}
      />
      <TranslatedTextInput
        labelKey="authentication.password"
        placeholderKey="authentication.password_placeholder"
        onChangeText={handleChange('password')}
        onBlur={handleBlur('password')}
        error={touched.password && errors.password}
        secureTextEntry
      />
      <AppView row centerV gap-8>
        <AppCheckbox
          color={showCheckError ? Colors.error : Colors.primary}
          style={{
            backgroundColor: showCheckError
              ? Colors.transparent
              : Colors.primary,
            borderColor: showCheckError ? Colors.error : Colors.primary,
            borderWidth: 1,
          }}
          value={isChecked}
          onValueChange={(v) => {
            setIsChecked(v);
            if (v) {
              setShowChekError(false);
            }
          }}
        />
        <AppView row centerV style={{ flexWrap: 'wrap' }}>
          <TranslatedText sm secondary translationKey="common.terms_policy" />

          <AppTouchableOpacity
            onPress={() =>
              router.navigate({
                pathname: '/webview-page',
                params: {
                  url: AppURLs.TERMS_AND_SERVICE,
                },
              })
            }>
            <TranslatedText
              sm
              regular
              secondary
              translationKey="settings.terms_of_service"
            />
          </AppTouchableOpacity>
          <AppText sm secondary center>
            {' & '}
          </AppText>

          <AppTouchableOpacity
            onPress={() =>
              router.navigate({
                pathname: '/webview-page',
                params: {
                  url: AppURLs.PRIVACY_POLICY,
                },
              })
            }>
            <TranslatedText
              sm
              regular
              secondary
              translationKey="settings.privacy_policy"
            />
          </AppTouchableOpacity>
        </AppView>
      </AppView>
      <Divider />
      <PrimaryButton
        shouldShowLoader
        label="authentication.sign_up"
        onPress={onSubmitPress}
        isLoading={isLoading}
      />
      <OrDivider />
      <SocialLogin />
    </AppView>
  );
};

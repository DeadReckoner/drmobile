import { AppAvatar } from '@/components/AppAvatar';
import { AppButton } from '@/components/AppButton';
import { PrimaryButton } from '@/components/PrimaryButton';
import { TranslatedTextInput } from '@/components/TranslatedTextInput';
import { AppImage, AppView } from '@/components/ui';
import { useAuth } from '@/hooks/auth/useAuth';
import { useLocalization } from '@/hooks/useLocalization';
import { useToast } from '@/hooks/useToast';
import { TranslationKeysType } from '@/lib/localization/types/i18n.types';
import { useAppSelector } from '@/store/hooks/store.hooks';
import { selectUser } from '@/store/slices/authSlice';
import { getApiErrorMessage } from '@/utils/apiErrors.utils';
import { isInvalidMessage, isRequiredMessage } from '@/utils/form.utils';
import { VALIDATION_RULES } from '@/utils/validation.utils';
import * as ImagePicker from 'expo-image-picker';
import { useFormik } from 'formik';
import { useState } from 'react';
import { StyleSheet } from 'react-native';
import * as Yup from 'yup';

interface UpdateProfileFormProps {
  onSuccess?: () => void;
  initialFirstName?: string;
  initialLastName?: string;
}

const createUpdateProfileValidationSchema = (
  t: (_: TranslationKeysType) => string,
) => {
  const email = t('authentication.your_email');
  return Yup.object({
    first_name: Yup.string()
      .label(t('authentication.first_name'))
      .trim()
      .min(2, t('authentication.update_profile.first_name_min_length'))
      .required(t('authentication.update_profile.first_name_required')),
    last_name: Yup.string()
      .label(t('authentication.last_name'))
      .trim()
      .min(2, t('authentication.update_profile.last_name_min_length'))
      .required(t('authentication.update_profile.last_name_required')),
    email: Yup.string()
      .label(email)
      .matches(VALIDATION_RULES.email, isInvalidMessage(email, t))
      .required(isRequiredMessage(email, t)),
  });
};

export const UpdateProfileForm = ({
  onSuccess,
  initialFirstName = '',
  initialLastName = '',
}: UpdateProfileFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();
  const { updateUserWithAuthProvider } = useAuth();
  const { t } = useLocalization();

  const user = useAppSelector(selectUser);
  const [selectedImage, setSelectedImage] = useState<string | undefined>(
    user.avatar,
  );

  const onProfilePicturePress = async () => {
    const image = await ImagePicker.launchImageLibraryAsync();
    if (!image.canceled) {
      setSelectedImage(image.assets[0].uri);
    }
  };

  const formik = useFormik({
    initialValues: {
      first_name: initialFirstName,
      last_name: initialLastName,
      email: user.email || '',
    },
    validationSchema: createUpdateProfileValidationSchema(t),
    enableReinitialize: true,
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        const { error } = await updateUserWithAuthProvider({
          data: {
            full_name: `${values.first_name.trim()} ${values.last_name.trim()}`,
            email: values.email.trim(),
          },
        });
        if (error) {
          throw error;
        }
        showToast({
          message: t('authentication.update_profile.profile_updated_success'),
          type: 'success',
        });
        onSuccess?.();
      } catch (error: unknown) {
        showToast({
          message: getApiErrorMessage(error),
          type: 'failure',
        });
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <AppView>
      <AppButton
        style={styles.iconContainer}
        center
        onPress={onProfilePicturePress}>
        <AppView center marginB-32>
          {selectedImage ? (
            <AppImage source={{ uri: selectedImage }} style={styles.image} />
          ) : user.avatar ? (
            <AppImage source={{ uri: user.avatar }} style={styles.image} />
          ) : (
            <AppAvatar size={48} />
          )}
        </AppView>
      </AppButton>
      <TranslatedTextInput
        labelKey="authentication.first_name"
        placeholderKey="authentication.complete_profile.first_name_placeholder"
        value={formik.values.first_name}
        onChangeText={formik.handleChange('first_name')}
        onBlur={formik.handleBlur('first_name')}
        error={
          formik.touched.first_name && formik.errors.first_name
            ? formik.errors.first_name
            : undefined
        }
        editable={!isLoading}
        autoCapitalize="words"
        autoCorrect={false}
      />

      <TranslatedTextInput
        labelKey="authentication.last_name"
        placeholderKey="authentication.complete_profile.last_name_placeholder"
        value={formik.values.last_name}
        onChangeText={formik.handleChange('last_name')}
        onBlur={formik.handleBlur('last_name')}
        error={
          formik.touched.last_name && formik.errors.last_name
            ? formik.errors.last_name
            : undefined
        }
        editable={!isLoading}
        autoCapitalize="words"
        autoCorrect={false}
      />

      <TranslatedTextInput
        labelKey="authentication.your_email"
        placeholderKey="authentication.complete_profile.email_placeholder"
        value={formik.values.email}
        onChangeText={formik.handleChange('email')}
        onBlur={formik.handleBlur('email')}
        error={
          formik.touched.email && formik.errors.email
            ? formik.errors.email
            : undefined
        }
        editable={!isLoading}
        autoCorrect={false}
      />

      <PrimaryButton
        label="authentication.complete_profile.submit_button"
        onPress={() => formik.handleSubmit()}
        isLoading={isLoading}
        shouldShowLoader
      />
    </AppView>
  );
};

const styles = StyleSheet.create({
  image: {
    width: 96,
    height: 96,
    borderRadius: 100,
    alignSelf: 'center',
  },
  iconContainer: {
    alignSelf: 'center',
  },
});

import { PrimaryButton } from '@/components/PrimaryButton';
import { TranslatedTextInput } from '@/components/TranslatedTextInput';
import { AppView } from '@/components/ui';
import { useAuth } from '@/hooks/auth/useAuth';
import { useLocalization } from '@/hooks/useLocalization';
import { useToast } from '@/hooks/useToast';
import { getApiErrorMessage } from '@/utils/apiErrors.utils';
import { useFormik } from 'formik';
import { useState } from 'react';
import * as Yup from 'yup';

interface UpdateProfileFormProps {
  onSuccess?: () => void;
  initialFirstName?: string;
  initialLastName?: string;
}

export const UpdateProfileForm = ({
  onSuccess,
  initialFirstName = '',
  initialLastName = '',
}: UpdateProfileFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();
  const { updateUserWithAuthProvider } = useAuth();
  const { t } = useLocalization();

  const validationSchema = Yup.object().shape({
    first_name: Yup.string()
      .trim()
      .min(2, t('authentication.update_profile.first_name_min_length'))
      .required(t('authentication.update_profile.first_name_required')),
    last_name: Yup.string()
      .trim()
      .min(2, t('authentication.update_profile.last_name_min_length'))
      .required(t('authentication.update_profile.last_name_required')),
  });

  const formik = useFormik({
    initialValues: {
      first_name: initialFirstName,
      last_name: initialLastName,
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        const { error } = await updateUserWithAuthProvider({
          data: {
            full_name: `${values.first_name.trim()} ${values.last_name.trim()}`,
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

      <PrimaryButton
        label="authentication.complete_profile.submit_button"
        onPress={() => formik.handleSubmit()}
        isLoading={isLoading}
        shouldShowLoader
      />
    </AppView>
  );
};

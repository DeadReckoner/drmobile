import {
  AuthErrorType,
  SessionLessUserType,
} from '@/hooks/auth/types/auth.types';
import { useAuth } from '@/hooks/auth/useAuth';
import { useLocalization } from '@/hooks/useLocalization';
import { TranslationKeysType } from '@/lib/localization/types/i18n.types';
import { isInvalidMessage, isRequiredMessage } from '@/utils/form.utils';
import { VALIDATION_RULES } from '@/utils/validation.utils';
import { useFormik } from 'formik';
import { useState } from 'react';
import * as Yup from 'yup';

const createSignupValidationSchema = (
  t: (_: TranslationKeysType) => string,
) => {
  const firstName = t('authentication.first_name');
  const lastName = t('authentication.last_name');
  const email = t('authentication.your_email');
  const passwordLabel = t('authentication.password');
  return Yup.object({
    firstName: Yup.string()
      .label(firstName)
      .min(2, isInvalidMessage(firstName, t))
      .required(isRequiredMessage(firstName, t)),
    lastName: Yup.string()
      .label(lastName)
      .min(2, isInvalidMessage(lastName, t))
      .required(isRequiredMessage(lastName, t)),
    email: Yup.string()
      .label(email)
      .matches(VALIDATION_RULES.email, isInvalidMessage(email, t))
      .required(isRequiredMessage(email, t)),
    password: Yup.string()
      .label(passwordLabel)
      .matches(
        VALIDATION_RULES.password,
        t('authentication.errors.email.password_complexity'),
      )
      .required(isRequiredMessage(passwordLabel, t)),
  });
};

type SignupSchemaType = Yup.InferType<
  ReturnType<typeof createSignupValidationSchema>
>;

interface SignupFormHookProps {
  onSuccess?: (_user: SessionLessUserType) => void;
  onError?: (_error: AuthErrorType) => void;
}

export const useSignupForm = ({ onSuccess, onError }: SignupFormHookProps) => {
  const { t } = useLocalization();
  const schema = createSignupValidationSchema(t);

  const { signUpEmailWithAuthProvider } = useAuth();

  const [isLoading, setIsLoading] = useState(false);

  const onSignupSubmit = async ({
    email,
    password,
    firstName,
    lastName,
  }: SignupSchemaType) => {
    setIsLoading(true);

    const { data, error } = await signUpEmailWithAuthProvider(email, password, {
      full_name: `${firstName} ${lastName}`.trim(),
    });
    setIsLoading(false);

    if (error) {
      onError?.(error);
      return;
    }
    if (data) onSuccess?.(data);
  };

  const { handleChange, handleBlur, ...restFormikOptions } =
    useFormik<SignupSchemaType>({
      initialValues: { email: '', password: '', firstName: '', lastName: '' },
      validationSchema: schema,
      onSubmit: onSignupSubmit,
    });

  return {
    isLoading,
    handleChange: handleChange<keyof SignupSchemaType>,
    handleBlur: handleBlur<keyof SignupSchemaType>,
    ...restFormikOptions,
  };
};

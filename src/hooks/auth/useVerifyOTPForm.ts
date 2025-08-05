import { AuthErrorType, UserType } from '@/hooks/auth/types/auth.types';
import { useAuth } from '@/hooks/auth/useAuth';
import { useLocalization } from '@/hooks/useLocalization';
import { TranslationKeysType } from '@/lib/localization/types/i18n.types';
import { isRequiredMessage } from '@/utils/form.utils';
import { useFormik } from 'formik';
import { useState } from 'react';
import * as Yup from 'yup';

const createVerifyOTPValidationSchema = (
  t: (_: TranslationKeysType) => string,
) => {
  const otp = t('authentication.your_otp');
  return Yup.object({
    otp: Yup.string().label(otp).required(isRequiredMessage(otp, t)),
  });
};

type VerifyOTPSchemaType = Yup.InferType<
  ReturnType<typeof createVerifyOTPValidationSchema>
>;

interface VerifyOTPFormHookProps {
  email: string;
  onSuccess?: (_otpResponse: UserType) => void;
  onError?: (_error: AuthErrorType) => void;
}

export const useVerifyOTPForm = ({
  email,
  onSuccess,
  onError,
}: VerifyOTPFormHookProps) => {
  const { t } = useLocalization();
  const schema = createVerifyOTPValidationSchema(t);
  const { verifyOTPViaEmailWithAuthProvider } = useAuth();

  const [isLoading, setIsLoading] = useState(false);

  const onVerifyOTPSubmit = async ({ otp }: VerifyOTPSchemaType) => {
    setIsLoading(true);

    const { data, error } = await verifyOTPViaEmailWithAuthProvider(email, otp);
    setIsLoading(false);

    if (error) {
      onError?.(error);
      return;
    }
    if (data) onSuccess?.(data);
  };

  const { handleChange, handleBlur, ...restFormikOptions } =
    useFormik<VerifyOTPSchemaType>({
      initialValues: { otp: '' },
      validationSchema: schema,
      onSubmit: onVerifyOTPSubmit,
    });

  return {
    isLoading,
    handleChange: handleChange<keyof VerifyOTPSchemaType>,
    handleBlur: handleBlur<keyof VerifyOTPSchemaType>,
    ...restFormikOptions,
  };
};

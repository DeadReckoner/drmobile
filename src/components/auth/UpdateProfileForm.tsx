import { AppAvatar } from '@/components/AppAvatar';
import { AppButton } from '@/components/AppButton';
import { AppIcon } from '@/components/AppIcon';
import { PrimaryButton } from '@/components/PrimaryButton';
import { TranslatedTextInput } from '@/components/TranslatedTextInput';
import { AppImage, AppView } from '@/components/ui';
import { useAuth } from '@/hooks/auth/useAuth';
import { useLocalization } from '@/hooks/useLocalization';
import { useToast } from '@/hooks/useToast';
import {
  useDeleteUserImageMutation,
  useUpdateUserMutation,
  useUpdateUserWithImageMutation,
} from '@/hooks/user';
import { TranslationKeysType } from '@/lib/localization/types/i18n.types';
import { useAppSelector } from '@/store/hooks/store.hooks';
import { selectUser } from '@/store/slices/authSlice';
import { getApiErrorMessage } from '@/utils/apiErrors.utils';
import { isInvalidMessage, isRequiredMessage } from '@/utils/form.utils';
import { VALIDATION_RULES } from '@/utils/validation.utils';
import * as ImagePicker from 'expo-image-picker';
import { useFormik } from 'formik';
import { useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from 'react-native-ui-lib';
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
  const [updateUser] = useUpdateUserMutation();
  const [updateUserWithImage] = useUpdateUserWithImageMutation();
  const [deleteUserImage] = useDeleteUserImageMutation();

  const user = useAppSelector(selectUser);

  const [pendingImageUri, setPendingImageUri] = useState<string | undefined>(
    undefined,
  );
  const [imageDeleted, setImageDeleted] = useState(false);

  const currentDisplayImage = imageDeleted
    ? undefined
    : (pendingImageUri ?? user.avatar ?? undefined);

  const onProfilePicturePress = async () => {
    const image = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!image.canceled) {
      setPendingImageUri(image.assets[0].uri);
      setImageDeleted(false);
    }
  };

  const onDeletePhoto = () => {
    setPendingImageUri(undefined);
    setImageDeleted(true);
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
        if (imageDeleted) {
          await deleteUserImage().unwrap();
          const { error } = await updateUserWithAuthProvider({
            data: {
              full_name: `${values.first_name.trim()} ${values.last_name.trim()}`,
              email: values.email.trim(),
              avatar_url: '',
            },
          });

          if (error) {
            throw error;
          }
        } else if (pendingImageUri) {
          const response = await updateUserWithImage({
            userPayload: {
              first_name: values.first_name.trim(),
              last_name: values.last_name.trim(),
              email: values.email.trim(),
            },
            imageUri: pendingImageUri,
          }).unwrap();
          const { error } = await updateUserWithAuthProvider({
            data: {
              full_name: `${values.first_name.trim()} ${values.last_name.trim()}`,
              email: values.email.trim(),
              avatar_url: response.profile_image_url || user.avatar,
            },
          });

          if (error) {
            throw error;
          }
        } else {
          await updateUser({
            first_name: values.first_name.trim(),
            last_name: values.last_name.trim(),
            email: values.email.trim(),
          }).unwrap();
          const { error } = await updateUserWithAuthProvider({
            data: {
              full_name: `${values.first_name.trim()} ${values.last_name.trim()}`,
              email: values.email.trim(),
              avatar_url: user.avatar || '',
            },
          });

          if (error) {
            throw error;
          }
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
      <AppView center marginB-32>
        <AppView style={styles.avatarWrapper}>
          <AppButton
            style={styles.iconContainer}
            center
            onPress={onProfilePicturePress}>
            {currentDisplayImage ? (
              <AppImage
                source={{ uri: currentDisplayImage }}
                style={styles.image}
              />
            ) : (
              <AppAvatar size={48} />
            )}
          </AppButton>
          {currentDisplayImage && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={onDeletePhoto}
              hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
              <AppIcon
                set="Feather"
                name="x-circle"
                size={20}
                color={Colors.white}
              />
            </TouchableOpacity>
          )}
        </AppView>
      </AppView>
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
  avatarWrapper: {
    position: 'relative',
  },
  deleteButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: Colors.red30,
    borderRadius: 12,
  },
});

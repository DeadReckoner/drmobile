import { TranslatedText } from '@/components/TranslatedText';
import { AppImage, AppTouchableOpacity } from '@/components/ui';
import { useGoogleAuthentication } from '@/hooks/auth/useGoogleAuthentication';
import useToast from '@/hooks/useToast';
import React from 'react';
import { StyleSheet } from 'react-native';
import { Assets } from 'react-native-ui-lib';

interface GoogleAuthButtonProps {
  onSuccessfullLogin: () => void;
}

export const GoogleAuthButton = ({
  onSuccessfullLogin,
}: GoogleAuthButtonProps) => {
  const { signInWithGoogle } = useGoogleAuthentication();
  const { showToast } = useToast();

  const onPress = async () => {
    const { error } = await signInWithGoogle();
    if (error?.message) {
      return showToast({ message: error.message });
    }
    onSuccessfullLogin();
  };

  return (
    <AppTouchableOpacity
      row
      center
      br30
      bg-btnAuth
      style={styles.googleSigninButton}
      activeOpacity={0.6}
      onPress={onPress}>
      <AppImage source={Assets.logo.google} style={styles.logo} />
      <TranslatedText
        style={styles.continue}
        translationKey="authentication.continue_with_google"
        textOnButtonAuth
        marginL-6
      />
    </AppTouchableOpacity>
  );
};

const styles = StyleSheet.create({
  googleSigninButton: {
    width: '100%',
    height: 50,
  },
  continue: { fontSize: 19, fontWeight: '500', fontFamily: undefined },
  logo: {
    height: 20,
    width: 20,
  },
});

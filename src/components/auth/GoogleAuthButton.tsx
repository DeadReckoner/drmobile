import { AppButton } from '@/components/AppButton';
import { Loader } from '@/components/Loader';
import { TranslatedText } from '@/components/TranslatedText';
import { AppImage, AppView } from '@/components/ui';
import { useGoogleAuthentication } from '@/hooks/auth/useGoogleAuthentication';
import { useToast } from '@/hooks/useToast';
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Assets } from 'react-native-ui-lib';

export const GoogleAuthButton = () => {
  const { signInWithGoogle } = useGoogleAuthentication();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const onPress = async () => {
    setIsLoading(true);
    const { error } = await signInWithGoogle();
    if (error?.message) {
      showToast({ message: error.message, type: 'failure' });
    }
    setIsLoading(false);
  };

  return (
    <AppView>
      {isLoading && <Loader shouldAnimate={false} />}
      <AppButton
        row
        center
        br30
        bg-inverseBackground
        style={styles.googleSigninButton}
        disabled={isLoading}
        onPress={onPress}>
        <AppImage source={Assets.logo.google} style={styles.logo} />
        <TranslatedText
          style={styles.continue}
          translationKey="authentication.continue_with_google"
          inverseText
          marginL-6
        />
      </AppButton>
    </AppView>
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

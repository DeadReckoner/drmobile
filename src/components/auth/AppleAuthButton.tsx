import { Loader } from '@/components/Loader';
import { useAppleAuthentication } from '@/hooks/auth/useAppleAuthentication';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useToast } from '@/hooks/useToast';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

export const AppleAuthButton = () => {
  const { theme } = useAppTheme();
  const { signInWithApple } = useAppleAuthentication();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const onPress = async () => {
    setIsLoading(true);
    const { error } = await signInWithApple();
    if (error?.message) {
      showToast({
        message: error.message,
        type: 'failure',
      });
    }
    setIsLoading(false);
  };

  return (
    <Pressable pointerEvents="auto" disabled={isLoading}>
      {isLoading && <Loader />}
      <AppleAuthentication.AppleAuthenticationButton
        buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
        buttonStyle={
          theme === 'dark'
            ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
            : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
        }
        cornerRadius={10}
        style={styles.button}
        onPress={onPress}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 50,
  },
});

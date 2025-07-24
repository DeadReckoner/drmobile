import { useAppleAuthentication } from '@/hooks/auth/useAppleAuthentication';
import { useAppTheme } from '@/hooks/useAppTheme';
import useToast from '@/hooks/useToast';
import * as AppleAuthentication from 'expo-apple-authentication';
import { StyleSheet } from 'react-native';

interface AppleAuthButtonProps {
  onSuccessfullLogin: () => void;
}

export const AppleAuthButton = ({
  onSuccessfullLogin,
}: AppleAuthButtonProps) => {
  const { theme } = useAppTheme();
  const { signInWithApple } = useAppleAuthentication();
  const { showToast } = useToast();

  const onPress = async () => {
    const { error } = await signInWithApple();
    if (error?.message) {
      return showToast({ message: error.message });
    }
    onSuccessfullLogin();
  };
  return (
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
  );
};

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 50,
  },
});

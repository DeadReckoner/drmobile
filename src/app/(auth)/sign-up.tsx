import { AppRouterLink } from '@/components/AppLink';
import { AppScreen } from '@/components/AppScreen';
import { SignupForm } from '@/components/auth/SignupForm';
import { ScreenHeader } from '@/components/ScreenHeader';
import { TranslatedText } from '@/components/TranslatedText';
import { AppView } from '@/components/ui';
import { StyleSheet } from 'react-native';
import {
  KeyboardAwareScrollView,
  KeyboardGestureArea,
  KeyboardToolbar,
} from 'react-native-keyboard-controller';

const SignUp = () => {
  return (
    <>
      <AppScreen>
        <KeyboardGestureArea style={styles.gestureWrapper} interpolator="ios">
          <KeyboardAwareScrollView
            bottomOffset={100}
            contentContainerStyle={styles.contentScrollview}
            showsVerticalScrollIndicator={false}>
            <AppView flex paddingT-60 spread>
              <ScreenHeader
                title="authentication.sign_up"
                subtitle="authentication.signup_subtitle"
              />
              <SignupForm />
              <AppView row center gap-8 marginB-40>
                <TranslatedText
                  secondary
                  translationKey="authentication.already_have_an_account"
                />
                <AppRouterLink
                  dismissTo
                  href="/login"
                  translationKey="authentication.login"
                />
              </AppView>
            </AppView>
          </KeyboardAwareScrollView>
        </KeyboardGestureArea>
      </AppScreen>
      <KeyboardToolbar />
    </>
  );
};

export default SignUp;

const styles = StyleSheet.create({
  gestureWrapper: {
    flex: 1,
  },
  contentScrollview: {
    flexGrow: 1,
  },
});

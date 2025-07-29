import { AppRouterLink } from '@/components/AppLink';
import { AppScreen } from '@/components/AppScreen';
import { SignupForm } from '@/components/auth/SignupForm';
import { ScreenHeader } from '@/components/ScreenHeader';
import { TranslatedText } from '@/components/TranslatedText';
import { AppView } from '@/components/ui';
import {
  KeyboardAwareScrollView,
  KeyboardGestureArea,
} from 'react-native-keyboard-controller';

const SignUp = () => {
  return (
    <AppScreen>
      <KeyboardGestureArea style={{ flex: 1 }} interpolator="ios">
        <KeyboardAwareScrollView
          bottomOffset={100}
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}>
          <AppView paddingT-60>
            <ScreenHeader
              title="authentication.sign_up"
              subtitle="authentication.signup_subtitle"
            />
            <SignupForm />
            <AppView row center gap-8 marginB-40 marginT-24>
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
  );
};

export default SignUp;

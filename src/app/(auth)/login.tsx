import { AppRouterLink } from '@/components/AppLink';
import { AppScreen } from '@/components/AppScreen';
import { LoginForm } from '@/components/auth/LoginForm';
import { ScreenHeader } from '@/components/ScreenHeader';
import { TranslatedText } from '@/components/TranslatedText';
import { AppView } from '@/components/ui';
import {
  KeyboardAwareScrollView,
  KeyboardGestureArea,
  KeyboardToolbar,
} from 'react-native-keyboard-controller';

const Login = () => {
  return (
    <>
      <AppScreen>
        <KeyboardGestureArea style={{ flex: 1 }} interpolator="ios">
          <KeyboardAwareScrollView
            bottomOffset={100}
            keyboardDismissMode="interactive"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1 }}>
            <AppView flex paddingT-60 spread>
              <ScreenHeader
                title="authentication.login"
                subtitle="authentication.login_subtitle"
              />
              <LoginForm />
              <AppView row center gap-8 marginB-40 marginT-24>
                <TranslatedText
                  secondary
                  translationKey="authentication.dont_have_an_account"
                />
                <AppRouterLink
                  href="/sign-up"
                  translationKey="authentication.sign_up"
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

export default Login;

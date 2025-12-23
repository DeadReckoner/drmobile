import { AppIcon } from '@/components/AppIcon';
import { AppRouterLink } from '@/components/AppLink';
import { AppScreen } from '@/components/AppScreen';
import { TranslatedText } from '@/components/TranslatedText';
import { AppView } from '@/components/ui';
import { FadeIn } from 'react-native-reanimated';
import { Colors } from 'react-native-ui-lib';

const CheckEmail = () => {
  return (
    <AppScreen entering={FadeIn} spread paddingH-32>
      <AppView />
      <AppView center>
        <AppView center bg-success br100 width={100} height={100}>
          <AppIcon name="check" color={Colors.white} size={48} />
        </AppView>
        <TranslatedText
          marginT-32
          h2
          translationKey="authentication.check_your_email"
        />
        <TranslatedText
          marginT-16
          captionLight
          center
          translationKey="authentication.check_your_email_subtitle"
        />
      </AppView>
      <AppView row center gap-8 marginB-40>
        <TranslatedText
          secondary
          translationKey="authentication.remember_password"
        />
        <AppRouterLink
          dismissTo
          href="/login"
          translationKey="authentication.login"
        />
      </AppView>
    </AppScreen>
  );
};

export default CheckEmail;

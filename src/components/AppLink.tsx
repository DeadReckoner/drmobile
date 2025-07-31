import AppButton from '@/components/AppButton';
import { TranslatedText } from '@/components/TranslatedText';
import { TranslationKeysType } from '@/lib/localization/types/i18n.types';
import { Link, LinkProps } from 'expo-router';

interface AppRouterLinkProps extends LinkProps {
  translationKey: TranslationKeysType;
}

export const AppRouterLink = (props: AppRouterLinkProps) => {
  return (
    <Link {...props} asChild>
      <AppButton>
        <TranslatedText translationKey={props.translationKey} />
      </AppButton>
    </Link>
  );
};

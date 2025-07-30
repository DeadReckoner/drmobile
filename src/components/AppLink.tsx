import { TranslatedText } from '@/components/TranslatedText';
import { AppTouchableOpacity } from '@/components/ui';
import { TranslationKeysType } from '@/lib/localization/types/i18n.types';
import { Link, LinkProps } from 'expo-router';

interface AppRouterLinkProps extends LinkProps {
  translationKey: TranslationKeysType;
}

export const AppRouterLink = (props: AppRouterLinkProps) => {
  return (
    <Link {...props} asChild>
      <AppTouchableOpacity>
        <TranslatedText translationKey={props.translationKey} />
      </AppTouchableOpacity>
    </Link>
  );
};

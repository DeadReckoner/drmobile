import { TranslatedText } from '@/components/TranslatedText';
import { AppText, AppView } from '@/components/ui';
import { TranslationKeysType } from '@/lib/localization/types/i18n.types';
import { ReactNode } from 'react';
import { LayoutChangeEvent } from 'react-native';

interface FormQuestionProps {
  labelKey: TranslationKeysType;
  helperKey?: TranslationKeysType;
  /** Already-translated error text. Rendered under the control when present. */
  error?: string;
  children: ReactNode;
  /**
   * Reports this question's y offset inside the scroll view so a failed submit
   * can scroll to the first invalid one.
   */
  onLayout?: (_event: LayoutChangeEvent) => void;
}

/** Label, optional helper, control, and inline error — one question's frame. */
export const FormQuestion = ({
  labelKey,
  helperKey,
  error,
  children,
  onLayout,
}: FormQuestionProps) => (
  <AppView marginB-24 onLayout={onLayout}>
    <TranslatedText body2 translationKey={labelKey} />
    {!!helperKey && <TranslatedText xsm marginT-4 translationKey={helperKey} />}
    <AppView marginT-12>{children}</AppView>
    {!!error && (
      <AppText error sm marginT-8>
        {error}
      </AppText>
    )}
  </AppView>
);

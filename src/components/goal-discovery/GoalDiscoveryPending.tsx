import { AppCard } from '@/components/AppCard';
import { AppIcon } from '@/components/AppIcon';
import { Divider } from '@/components/Divider';
import { PrimaryButtonContainer } from '@/components/PrimaryButtonContainer';
import { TranslatedText } from '@/components/TranslatedText';
import { AppView } from '@/components/ui';
import { TranslationKeysType } from '@/lib/localization/types/i18n.types';
import { ActivityIndicator } from 'react-native';
import { Colors } from 'react-native-ui-lib';

interface GoalDiscoveryPendingProps {
  titleKey: TranslationKeysType;
  bodyKey: TranslationKeysType;
  hintKey?: TranslationKeysType;
}

/**
 * In-progress state for a generation job.
 *
 * The "we will notify you" copy is only used because it is true: the server
 * writes a real in-app notification (and a push when a device token exists) on
 * completion, through the same notifications.Dispatch path the AI roadmap flow
 * already uses. If that ever stops being true, this copy must change with it.
 */
export const GoalDiscoveryPending = ({
  titleKey,
  bodyKey,
  hintKey,
}: GoalDiscoveryPendingProps) => (
  <AppCard paddingV-24 disabled testID="goal-discovery-pending">
    <AppView center>
      <ActivityIndicator color={Colors.primary} size="large" />
      <Divider margin-8 />
      <TranslatedText body1 marginT-8 translationKey={titleKey} />
      <TranslatedText xsm marginT-8 center translationKey={bodyKey} />
      {!!hintKey && (
        <TranslatedText xsm marginT-12 center translationKey={hintKey} />
      )}
    </AppView>
  </AppCard>
);

interface GoalDiscoveryFailureProps {
  titleKey: TranslationKeysType;
  bodyKey: TranslationKeysType;
  retryKey: TranslationKeysType;
  onRetry: () => void;
  secondaryKey?: TranslationKeysType;
  onSecondary?: () => void;
}

/**
 * Terminal failure with a way forward. The user's answers are never cleared by
 * a failure, so both actions here resume from what they already wrote.
 */
export const GoalDiscoveryFailure = ({
  titleKey,
  bodyKey,
  retryKey,
  onRetry,
  secondaryKey,
  onSecondary,
}: GoalDiscoveryFailureProps) => (
  <AppCard paddingV-20 disabled testID="goal-discovery-failure">
    <AppView row centerV gap-8>
      <AppIcon
        set="Ionicons"
        name="alert-circle-outline"
        size={20}
        color={Colors.error}
      />
      <TranslatedText body2 translationKey={titleKey} />
    </AppView>
    <TranslatedText xsm marginT-8 translationKey={bodyKey} />
    <Divider margin-8 />
    <PrimaryButtonContainer onPress={onRetry}>
      <TranslatedText textOnPrimary buttonLable translationKey={retryKey} />
    </PrimaryButtonContainer>
    {!!secondaryKey && !!onSecondary && (
      <AppView marginT-12 center>
        <TranslatedText
          body2
          translationKey={secondaryKey}
          onPress={onSecondary}
        />
      </AppView>
    )}
  </AppCard>
);

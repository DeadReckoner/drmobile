import { AppCard } from '@/components/AppCard';
import { Divider } from '@/components/Divider';
import { PrimaryButtonContainer } from '@/components/PrimaryButtonContainer';
import { TranslatedText } from '@/components/TranslatedText';
import { AppText, AppView } from '@/components/ui';
import {
  ACCOUNTABILITY_LABEL_KEYS,
  DIFFICULTY_LABEL_KEYS,
  PACE_LABEL_KEYS,
  PACE_ORDER,
  RANK_LABEL_KEYS,
} from '@/hooks/goalDiscovery/goalDiscoveryCatalog';
import { GoalOption } from '@/hooks/goalDiscovery/goalDiscovery.types';
import { effortFor } from '@/hooks/goalDiscovery/stage2';
import { useLocalization } from '@/hooks/useLocalization';
import { StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

interface GoalOptionCardProps {
  option: GoalOption;
  onChoose: (_option: GoalOption) => void;
  disabled?: boolean;
}

/**
 * One generated goal. "Choose this goal" is per-card; regenerating the whole set
 * is a separate screen-level action, because it replaces all three.
 */
export const GoalOptionCard = ({
  option,
  onChoose,
  disabled,
}: GoalOptionCardProps) => {
  const { t } = useLocalization();

  const rankKey = RANK_LABEL_KEYS[option.rank];

  return (
    <AppCard
      paddingV-20
      // The card itself is not the choose affordance; the button below is.
      disabled
      testID={`goal-option-${option.rank}`}>
      {!!rankKey && (
        <AppView
          paddingV-4
          paddingH-10
          br30
          bg-accent
          marginB-12
          style={styles.rankBadge}>
          <TranslatedText xsm textOnPrimary translationKey={rankKey} />
        </AppView>
      )}

      <AppText body1 textColor>
        {option.goal_title}
      </AppText>

      <Section titleKey="goal_discovery.options.why_this_fits">
        {option.why_this_fits}
      </Section>
      <Section titleKey="goal_discovery.options.target_outcome">
        {option.target_outcome}
      </Section>
      <Section titleKey="goal_discovery.options.why_worth_pursuing">
        {option.why_worth_pursuing}
      </Section>

      <AppView marginT-16>
        <TranslatedText
          xsm
          translationKey="goal_discovery.options.effort"
          style={styles.sectionTitle}
        />
        {PACE_ORDER.map((pace) => {
          const effort = effortFor(option, pace);
          if (!effort) return null;
          return (
            <AppView key={pace} row marginT-8 gap-8>
              <AppView
                paddingV-2
                paddingH-8
                br20
                style={styles.paceBadge}
                center>
                <AppText xsm textColor>
                  {t(PACE_LABEL_KEYS[pace])}
                </AppText>
              </AppView>
              <AppView flex-1>
                <AppText xsm textColor>
                  {effort.display_text}
                </AppText>
              </AppView>
            </AppView>
          );
        })}
      </AppView>

      <AppView row marginT-16 gap-16>
        <Meta
          titleKey="goal_discovery.options.difficulty"
          value={t(DIFFICULTY_LABEL_KEYS[option.difficulty.level])}
          explanation={option.difficulty.explanation}
        />
        <Meta
          titleKey="goal_discovery.options.accountability"
          value={t(
            ACCOUNTABILITY_LABEL_KEYS[option.accountability_strength.level],
          )}
          explanation={option.accountability_strength.explanation}
        />
      </AppView>

      <Divider margin-8 />

      <PrimaryButtonContainer
        disabled={disabled}
        style={{ opacity: disabled ? 0.5 : 1 }}
        onPress={() => onChoose(option)}>
        <TranslatedText
          textOnPrimary
          buttonLable
          translationKey="goal_discovery.options.choose"
        />
      </PrimaryButtonContainer>
    </AppCard>
  );
};

const Section = ({
  titleKey,
  children,
}: {
  titleKey: Parameters<typeof TranslatedText>[0]['translationKey'];
  children: string;
}) => (
  <AppView marginT-16>
    <TranslatedText xsm translationKey={titleKey} style={styles.sectionTitle} />
    <AppText xsm textColor marginT-4>
      {children}
    </AppText>
  </AppView>
);

const Meta = ({
  titleKey,
  value,
  explanation,
}: {
  titleKey: Parameters<typeof TranslatedText>[0]['translationKey'];
  value: string;
  explanation: string;
}) => (
  <AppView flex-1>
    <TranslatedText xsm translationKey={titleKey} style={styles.sectionTitle} />
    <AppText body2 textColor marginT-2>
      {value}
    </AppText>
    <AppText xsm marginT-2>
      {explanation}
    </AppText>
  </AppView>
);

const styles = StyleSheet.create({
  rankBadge: { alignSelf: 'flex-start' },
  sectionTitle: { textTransform: 'uppercase', letterSpacing: 0.6 },
  paceBadge: { borderWidth: 1, borderColor: Colors.secondary, minWidth: 72 },
});

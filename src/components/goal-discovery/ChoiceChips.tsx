import { AppButton } from '@/components/AppButton';
import { GoalDiscoveryChoice } from '@/hooks/goalDiscovery/goalDiscoveryCatalog';
import { useLocalization } from '@/hooks/useLocalization';
import { AppText, AppView } from '@/components/ui';
import { StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

interface ChoiceChipsProps<T extends string> {
  choices: GoalDiscoveryChoice<T>[];
  selected: T[];
  onToggle: (_value: T) => void;
  /**
   * When false, unselected chips are dimmed and non-interactive because the
   * selection cap is reached. Selected chips STAY interactive so the user can
   * always deselect one to free a slot — the alternative is a dead end.
   */
  canSelectMore?: boolean;
}

/**
 * Wrapping chip group used for every single- and multi-select question.
 * A single-select passes an array of one and toggles by replacing it.
 */
export const ChoiceChips = <T extends string>({
  choices,
  selected,
  onToggle,
  canSelectMore = true,
}: ChoiceChipsProps<T>) => {
  const { t } = useLocalization();

  return (
    <AppView row style={styles.wrap}>
      {choices.map((choice) => {
        const isSelected = selected.includes(choice.value);
        const isBlocked = !isSelected && !canSelectMore;

        return (
          <AppButton
            key={choice.value}
            disabled={isBlocked}
            onPress={() => onToggle(choice.value)}
            testID={`chip-${choice.value}`}>
            <AppView
              paddingV-10
              paddingH-14
              br30
              style={[
                styles.chip,
                {
                  backgroundColor: isSelected ? Colors.primary : Colors.cardBG,
                  borderColor: isSelected ? Colors.primary : Colors.secondary,
                  opacity: isBlocked ? 0.4 : 1,
                },
              ]}>
              <AppText
                xsm
                style={{
                  color: isSelected ? Colors.textOnPrimary : Colors.textColor,
                }}>
                {t(choice.labelKey)}
              </AppText>
            </AppView>
          </AppButton>
        );
      })}
    </AppView>
  );
};

const styles = StyleSheet.create({
  wrap: { flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1 },
});

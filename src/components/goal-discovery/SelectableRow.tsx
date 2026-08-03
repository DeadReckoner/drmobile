import { AppButton } from '@/components/AppButton';
import { AppIcon } from '@/components/AppIcon';
import { AppText, AppView } from '@/components/ui';
import { Colors } from 'react-native-ui-lib';

interface SelectableRowProps {
  /** Already-composed display text (e.g. "Focused — 8-10 h/wk, 2-3 months"). */
  label: string;
  isSelected: boolean;
  onPress: () => void;
  testID?: string;
}

/**
 * Full-width single-select row. Used where the option text is composed at
 * runtime from structured data and so cannot come from a translation key alone,
 * which is what the chip group expects.
 */
export const SelectableRow = ({
  label,
  isSelected,
  onPress,
  testID,
}: SelectableRowProps) => (
  <AppButton onPress={onPress} testID={testID}>
    <AppView
      row
      centerV
      gap-12
      padding-14
      br20
      style={{
        borderWidth: 1,
        borderColor: isSelected ? Colors.primary : Colors.secondary,
        backgroundColor: isSelected ? Colors.cardBG : 'transparent',
      }}>
      <AppIcon
        set="Ionicons"
        name={isSelected ? 'radio-button-on' : 'radio-button-off'}
        size={20}
        color={isSelected ? Colors.primary : Colors.secondary}
      />
      <AppView flex-1>
        <AppText xsm textColor>
          {label}
        </AppText>
      </AppView>
    </AppView>
  </AppButton>
);

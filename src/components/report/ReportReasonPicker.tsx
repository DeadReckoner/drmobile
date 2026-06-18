import { AppCard } from '@/components/AppCard';
import { AppIcon } from '@/components/AppIcon';
import { TranslatedText } from '@/components/TranslatedText';
import { AppView } from '@/components/ui';
import { TranslationKeysType } from '@/lib/localization/types/i18n.types';
import { Colors } from 'react-native-ui-lib';

export interface ReportReasonOptionType {
  value: string;
  labelKey: TranslationKeysType;
}

interface ReportReasonPickerProps {
  reasons: ReportReasonOptionType[];
  selected: string;
  onSelect: (_value: string) => void;
}

export const ReportReasonPicker = ({
  reasons,
  selected,
  onSelect,
}: ReportReasonPickerProps) => {
  return (
    <AppView gap-8>
      {reasons.map((reason) => {
        const isSelected = selected === reason.value;
        return (
          <AppCard
            key={reason.value}
            row
            centerV
            spread
            padding-16
            br20
            onPress={() => onSelect(reason.value)}>
            <TranslatedText
              body2
              textColor
              flex
              translationKey={reason.labelKey}
            />
            <AppIcon
              set="MaterialCommunityIcons"
              name={isSelected ? 'radiobox-marked' : 'radiobox-blank'}
              color={isSelected ? Colors.accent : Colors.textColor}
              size={22}
            />
          </AppCard>
        );
      })}
    </AppView>
  );
};

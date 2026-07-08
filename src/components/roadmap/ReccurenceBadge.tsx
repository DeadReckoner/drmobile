import { AppText, AppView } from '@/components/ui';
import { useLocalization } from '@/hooks/useLocalization';
import { RecurrenceType } from '@/store/apis/types/habitsApi.types';
import { StyleSheet } from 'react-native';
import { TextProps } from 'react-native-ui-lib';

const RECURRENCE_COLORS: Record<RecurrenceType, string> = {
  daily: '#4A90D9',
  weekly: '#7B68EE',
  monthly: '#E67E22',
  none: '#888888',
};

interface RecurrenceBadgeProps {
  type: RecurrenceType;
  textProps?: TextProps;
}

export const RecurrenceBadge = ({ type, textProps }: RecurrenceBadgeProps) => {
  const { t } = useLocalization();
  return (
    <AppView
      style={[
        styles.recurrenceBadge,
        { backgroundColor: RECURRENCE_COLORS[type] },
      ]}>
      <AppText sm regular textColor {...textProps}>
        {t(`habits.recurrence.${type}`)}
      </AppText>
    </AppView>
  );
};

const styles = StyleSheet.create({
  recurrenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 100,
    alignSelf: 'flex-start',
  },
});

import { DateUtils } from '@/utils/date.utils';
import { DateTimePicker, DateTimePickerProps } from 'react-native-ui-lib';

export const AppDateTimePicker = (props: DateTimePickerProps) => {
  const dateFormatter = (value: Date) => {
    if (!value) {
      //TODO: return proper error message
      return '';
    }

    return DateUtils.formatDate(value, 'MM/DD/YYYY');
  };

  return <DateTimePicker dateTimeFormatter={dateFormatter} {...props} />;
};

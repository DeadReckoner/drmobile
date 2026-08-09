import { DateUtils } from '@/utils/date.utils';
import { Dimensions, StyleSheet } from 'react-native';
import {
  Colors,
  DateTimePicker,
  DateTimePickerProps,
} from 'react-native-ui-lib';

export const AppDateTimePicker = (props: DateTimePickerProps) => {
  const dateFormatter = (value: Date) => {
    if (!value) {
      //TODO: return proper error message
      return '';
    }

    return DateUtils.formatDate(value, 'MM/DD/YYYY');
  };

  return (
    <DateTimePicker
      dateTimeFormatter={dateFormatter}
      dialogProps={{
        containerStyle: [
          styles.containerStyle,
          {
            backgroundColor: Colors.pickerBG,
          },
        ],
      }}
      confirmButtonProps={{
        iconStyle: { tintColor: Colors.textColor },
      }}
      cancelButtonProps={{
        iconStyle: { tintColor: Colors.textColor },
      }}
      headerStyle={styles.headerStyle}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  containerStyle: {
    borderRadius: 8,
    height: Dimensions.get('screen').height * 0.37,
    width: '100%',
  },
  headerStyle: { width: '100%' },
});

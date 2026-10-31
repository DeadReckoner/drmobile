import { DateUtils } from '@/utils/date.utils';
import { Dimensions, StyleSheet, useWindowDimensions } from 'react-native';
import {
  Colors,
  DateTimePicker,
  DateTimePickerProps,
} from 'react-native-ui-lib';

export const AppDateTimePicker = (props: DateTimePickerProps) => {
  // ui-lib wraps the header + picker in an unsized View inside a centerH dialog,
  // so percentage widths don't resolve and the header's confirm (check) button
  // gets pushed off-screen on iOS. Pin both to the window width instead.
  const { width: windowWidth } = useWindowDimensions();

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
      headerStyle={{ width: windowWidth }}
      pickerStyle={{ width: windowWidth }}
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
});

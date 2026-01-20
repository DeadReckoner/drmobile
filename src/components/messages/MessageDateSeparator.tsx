import { AppText, AppView } from '@/components/ui';
import { useLocalization } from '@/hooks/useLocalization';
import { DateUtils } from '@/utils/date.utils';
import dayjs from 'dayjs';
import React from 'react';
import { StyleSheet } from 'react-native';

interface MessageDateSeparatorProps {
  date: string;
}

export const MessageDateSeparator = ({ date }: MessageDateSeparatorProps) => {
  const { t } = useLocalization();

  const getDateLabel = (messageDate: string): string => {
    const dateObj = dayjs(messageDate);
    const now = dayjs();
    const startOfToday = now.startOf('day');
    const startOfYesterday = startOfToday.subtract(1, 'day');

    if (dateObj.isSame(startOfToday, 'day')) {
      return t('messages.today');
    }

    if (dateObj.isSame(startOfYesterday, 'day')) {
      return t('messages.yesterday');
    }

    return DateUtils.formatDate(messageDate, 'MMM D, YYYY');
  };

  return (
    <AppView center paddingV-12>
      <AppView paddingH-12 paddingV-4 bg-primary br100 style={styles.chip}>
        {/* <TranslatedText caption1 white center>
          {getDateLabel(date)}
        </TranslatedText> */}

        <AppText sm textColor regular>
          {getDateLabel(date)}
        </AppText>
      </AppView>
    </AppView>
  );
};

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'center',
  },
});

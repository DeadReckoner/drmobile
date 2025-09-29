import { AppButton } from '@/components/AppButton';
import { AppIcon } from '@/components/AppIcon';
import { AppScreen } from '@/components/AppScreen';
import { Divider } from '@/components/Divider';
import { Loader } from '@/components/Loader';
import { TasksList } from '@/components/roadmap/TasksList';
import { TranslatedText } from '@/components/TranslatedText';
import { AppView } from '@/components/ui';
import { useGetUserTasksByStartDateQuery } from '@/hooks/task';
import { useAppTheme } from '@/hooks/useAppTheme';
import { DateUtils } from '@/utils/date.utils';
import dayjs from 'dayjs';
import { router } from 'expo-router';
import { RefreshControl, ScrollView, StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

const Today = () => {
  const { theme } = useAppTheme();
  const { data, isLoading, refetch, isFetching } =
    useGetUserTasksByStartDateQuery(
      DateUtils.formatDate(dayjs(), 'YYYY-MM-DD'),
    );

  const onCalendarClick = () => {
    // router.navigate('/calendar');
  };

  const onUserProfileClick = () => {
    router.navigate('/settings');
  };

  return (
    <>
      {isLoading && <Loader transparent />}
      <AppScreen key={theme}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior="always"
          contentContainerStyle={styles.scrollContainer}
          refreshControl={
            <RefreshControl
              refreshing={isFetching && !isLoading}
              onRefresh={refetch}
              tintColor={Colors.secondary}
            />
          }>
          <Divider />
          <AppView row centerV spread>
            <TranslatedText h2 translationKey="tabs.today" />
            <AppView center row gap-18>
              <AppButton onPress={onCalendarClick}>
                <AppIcon set="Feather" name="calendar" size={26} />
              </AppButton>
              <AppButton onPress={onUserProfileClick}>
                <AppIcon set="Feather" name="user" size={26} />
              </AppButton>
            </AppView>
          </AppView>
          <Divider />
          {data && <TasksList tasks={data} />}
        </ScrollView>
      </AppScreen>
    </>
  );
};

export default Today;

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: 24,
  },
});

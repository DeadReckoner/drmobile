import { AppButton } from '@/components/AppButton';
import { AppIcon } from '@/components/AppIcon';
import { AppScreen } from '@/components/AppScreen';
import { Divider } from '@/components/Divider';
import { Loader } from '@/components/Loader';
import { TasksList } from '@/components/roadmap/TasksList';
import { TranslatedText } from '@/components/TranslatedText';
import { AppView } from '@/components/ui';
import { TaskType } from '@/hooks/roadmap/types/roadmap.types';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useAppSelector } from '@/store/hooks/store.hooks';
import { selectUser } from '@/store/slices/authSlice';
import { router } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';

const Today = () => {
  const { id } = useAppSelector(selectUser);
  const { theme } = useAppTheme();
  // TODO: Replace with actual API call
  // const { data, isLoading } = useGetTasksByUserIdQuery(id);
  const data: TaskType[] = Array(5)
    .fill({})
    .map((_, index) => ({
      task_id:
        'f74b2586-7f4c-4f19-8170-8bfe05c9b6ca' + (index === 0 ? '' : index),
      title: 'Sample Task ' + index,
      description: 'This is a sample task description.',
      completed: false,
      steps: [],
      user_id: id,
      day: 0,
      milestone_id: '9ac4dcaf-5298-41f5-8c84-e911d920cb31',
    }));
  const isLoading = false;

  const onCalendarClick = () => {
    // router.navigate('/calendar');
  };

  const onUserProfileClick = () => {
    router.navigate('/settings');
  };

  return (
    <>
      {isLoading && <Loader />}
      <AppScreen key={theme}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior="always"
          contentContainerStyle={styles.scrollContainer}>
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
          <TasksList tasks={data} />
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

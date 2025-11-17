import { AppButton } from '@/components/AppButton';
import { AppIcon } from '@/components/AppIcon';
import { AppScreen } from '@/components/AppScreen';
import { Divider } from '@/components/Divider';
import { Loader } from '@/components/Loader';
import { ThreadsList } from '@/components/messages/ThreadsList';
import { TranslatedText } from '@/components/TranslatedText';
import { AppView } from '@/components/ui';
import { useGetThreadsQuery } from '@/store/apis/messagesApi';
import { ThreadType } from '@/store/apis/types/messagesApi.types';
import { Animations } from '@/utils/animation.utils';
import { RefreshControl, ScrollView, StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

const Messages = () => {
  const { data, isLoading, refetch, isFetching } = useGetThreadsQuery();

  const onNewMessageClick = () => {
    // TODO: Implement new message creation
  };

  const onThreadClick = (_thread: ThreadType) => {
    // TODO: Navigate to thread details
  };

  return (
    <AppScreen>
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
          <TranslatedText h2 translationKey="tabs.messages" />
          <AppView center row gap-18>
            <AppButton onPress={onNewMessageClick}>
              <AppIcon set="Feather" name="plus" size={26} />
            </AppButton>
          </AppView>
        </AppView>
        <Divider />

        {isLoading ? (
          <AppView height={100}>
            <Loader transparent />
          </AppView>
        ) : (
          <AppView
            pointerEvents={isFetching ? 'none' : 'auto'}
            reanimated
            entering={Animations.Entry.FadeInDownWithSpring()}
            exiting={Animations.Exit.FadeOutDown()}>
            <ThreadsList threads={data || []} onThreadClick={onThreadClick} />
          </AppView>
        )}
      </ScrollView>
    </AppScreen>
  );
};

export default Messages;

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: 24,
  },
});

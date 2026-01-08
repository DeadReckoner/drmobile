import { AppList } from '@/components/AppList';
import { Divider } from '@/components/Divider';
import { ThreadListItem } from '@/components/messages/ThreadListItem';
import { EmptyListItemPlaceholder } from '@/components/roadmap/EmptyListItemPlaceholder';
import { ThreadType } from '@/store/apis/types/messagesApi.types';
import { LegendListRenderItemProps } from '@legendapp/list';

interface ThreadsListProps {
  threads: ThreadType[];
  onThreadClick?: (_thread: ThreadType) => void;
}

export const ThreadsList = ({ threads, onThreadClick }: ThreadsListProps) => {
  const renderItem = ({ item }: LegendListRenderItemProps<ThreadType>) => {
    return (
      <ThreadListItem
        thread={item}
        lastMessage={item.LastMessage?.content}
        onThreadClick={onThreadClick}
      />
    );
  };

  const renderEmptyComponent = () => {
    return (
      <EmptyListItemPlaceholder
        title="messages.no_messages_yet"
        subtitle="messages.no_messages_description"
      />
    );
  };

  return (
    <AppList<ThreadType>
      keyExtractor={(i) => i.thread_id}
      data={threads || []}
      renderItem={renderItem}
      ListEmptyComponent={renderEmptyComponent}
      ListFooterComponent={() => <Divider />}
      ItemSeparatorComponent={() => <Divider />}
    />
  );
};

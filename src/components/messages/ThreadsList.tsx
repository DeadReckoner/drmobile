import { AppList } from '@/components/AppList';
import { Divider } from '@/components/Divider';
import { ThreadListItem } from '@/components/messages/ThreadListItem';
import { EmptyListItemPlaceholder } from '@/components/roadmap/EmptyListItemPlaceholder';
import { ThreadType } from '@/store/apis/types/messagesApi.types';
import { LegendListRenderItemProps } from '@legendapp/list';
import { useMemo } from 'react';

interface ThreadsListProps {
  threads: ThreadType[];
  onThreadClick?: (_thread: ThreadType) => void;
}

export const ThreadsList = ({
  threads = [],
  onThreadClick,
}: ThreadsListProps) => {
  const sortedThreadList = useMemo(() => {
    const threadsCopy = [...threads];
    threadsCopy.sort((a, b) => {
      const dateA = new Date(
        a.LastMessage?.created_at || a.created_at,
      ).getTime();
      const dateB = new Date(
        b.LastMessage?.created_at || b.created_at,
      ).getTime();
      return dateB - dateA;
    });
    return threadsCopy;
  }, [threads]);

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
      data={sortedThreadList || []}
      renderItem={renderItem}
      ListEmptyComponent={renderEmptyComponent}
      ListFooterComponent={() => <Divider />}
      ItemSeparatorComponent={() => <Divider />}
    />
  );
};

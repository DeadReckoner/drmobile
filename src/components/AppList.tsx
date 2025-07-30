import { AppView } from '@/components/ui';
import React from 'react';
import { FlatList, FlatListProps } from 'react-native';

export const AppList = <T,>(props: FlatListProps<T>) => {
  const renderFooter = () => <AppView />;
  return <FlatList ListFooterComponent={renderFooter} {...props} />;
};

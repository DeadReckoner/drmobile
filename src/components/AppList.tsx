import { LegendList, LegendListProps } from '@legendapp/list';
import React from 'react';

export const AppList = <T,>(props: LegendListProps<T>) => {
  return <LegendList<T> recycleItems {...props} />;
};

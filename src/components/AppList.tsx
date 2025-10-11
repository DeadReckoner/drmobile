import { LegendList, LegendListProps } from '@legendapp/list';

export const AppList = <T,>(props: LegendListProps<T>) => {
  return (
    <LegendList<T>
      recycleItems
      showsVerticalScrollIndicator={false}
      {...props}
    />
  );
};

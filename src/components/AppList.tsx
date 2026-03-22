import { LegendList, LegendListProps, LegendListRef } from '@legendapp/list';

export const AppList = <T,>({
  ref,
  style,
  ...props
}: LegendListProps<T> & { ref?: React.Ref<LegendListRef> }) => {
  return (
    <LegendList<T>
      style={[{ minHeight: 1 }, style]}
      contentContainerStyle={{ flexGrow: 1 }}
      ref={ref}
      recycleItems
      showsVerticalScrollIndicator={false}
      {...props}
    />
  );
};

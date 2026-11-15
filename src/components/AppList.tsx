import { LegendList, LegendListProps, LegendListRef } from '@legendapp/list';
import type { ScrollViewInstance } from 'react-native';

export const AppList = <T,>({
  ref,
  refScrollView,
  style,
  ...props
}: Omit<LegendListProps<T>, 'ref' | 'refScrollView'> & {
  ref?: React.Ref<LegendListRef>;
  refScrollView?: React.Ref<ScrollViewInstance>;
}) => {
  return (
    <LegendList<T>
      style={[{ minHeight: 1 }, style]}
      contentContainerStyle={{ flexGrow: 1 }}
      ref={ref}
      // LegendList still types this ref with the ScrollView component type;
      // React Native 0.88 refs are instance types.
      refScrollView={refScrollView as LegendListProps<T>['refScrollView']}
      recycleItems
      showsVerticalScrollIndicator={false}
      {...props}
    />
  );
};

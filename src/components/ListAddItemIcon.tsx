import { AppIcon } from '@/components/AppIcon';
import { AppView } from '@/components/ui';
import { StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

export const ListAddItemIcon = () => {
  return (
    <AppView
      center
      width={24}
      height={24}
      bg-primary
      style={[styles.icon, { borderColor: Colors.textColor }]}>
      <AppIcon name="plus" size={18} />
    </AppView>
  );
};

const styles = StyleSheet.create({
  icon: {
    borderWidth: 1,
    borderRadius: 4,
  },
});

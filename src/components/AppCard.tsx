import { AppTouchableOpacity, AppView } from '@/components/ui';
import { TouchableOpacityProps } from 'react-native-ui-lib';

export const AppCard = ({ children, ...props }: TouchableOpacityProps) => {
  return (
    <AppTouchableOpacity
      bg-cardBG
      padding-16
      br40
      activeOpacity={0.6}
      {...props}>
      <AppView row gap-16>
        {children}
      </AppView>
    </AppTouchableOpacity>
  );
};

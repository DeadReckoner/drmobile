import AppButton from '@/components/AppButton';
import { AppView } from '@/components/ui';
import { TouchableOpacityProps } from 'react-native-ui-lib';

export const AppCard = ({ children, ...props }: TouchableOpacityProps) => {
  return (
    <AppButton bg-cardBG padding-16 br40 {...props}>
      <AppView row gap-16>
        {children}
      </AppView>
    </AppButton>
  );
};

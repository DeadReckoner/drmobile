import { AppButton } from '@/components/AppButton';
import { TouchableOpacityProps } from 'react-native-ui-lib';

export const PrimaryButtonContainer = ({
  children,
  ...restProps
}: TouchableOpacityProps) => {
  return (
    <AppButton center padding-16 bg-primary br30 {...restProps}>
      {children}
    </AppButton>
  );
};

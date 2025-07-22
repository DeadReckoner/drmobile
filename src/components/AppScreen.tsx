import { ChildWrapperProps } from '@/components/types/component.types';
import { AppView } from '@/components/ui';

export const AppScreen = ({ children, ...restProps }: ChildWrapperProps) => {
  return (
    <AppView flex bg-screenBG padding-16 {...restProps}>
      {children}
    </AppView>
  );
};

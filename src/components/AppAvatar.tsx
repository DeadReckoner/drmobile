import { AppIcon } from '@/components/AppIcon';
import { AppView } from '@/components/ui';
import React, { ComponentProps } from 'react';
import { Colors } from 'react-native-ui-lib';

interface AppAvatarProps {
  size?: number;
  backgroundColor?: string;
  iconColor?: string;
  containerStyle?: ComponentProps<typeof AppView>['style'];
}

export const AppAvatar = ({
  size = 16,
  backgroundColor = Colors.primary,
  iconColor = Colors.white,
  containerStyle,
}: AppAvatarProps) => {
  const ICON_SIZE = size * 2;
  return (
    <AppView
      style={[
        {
          width: ICON_SIZE,
          height: ICON_SIZE,
          borderRadius: ICON_SIZE * 2,
        },
        containerStyle,
      ]}
      center
      backgroundColor={backgroundColor}>
      <AppIcon set="Feather" name="user" size={size} color={iconColor} />
    </AppView>
  );
};

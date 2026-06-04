import { AppIcon } from '@/components/AppIcon';
import { AppSwitch } from '@/components/AppSwitch';
import { LineDivider } from '@/components/LineDivider';
import { SettingsItem } from '@/components/SettingsItem';
import { AppView } from '@/components/ui';
import type { NotificationSettingsType } from '@/store/types/settingsSlice.types';
import { cardStyle } from './shared';

type Props = {
  settings: NotificationSettingsType;
  muteActive: boolean;
  onSettingUpdate: (
    _key: string,
    _partial: Partial<NotificationSettingsType>,
  ) => void;
  onMuteToggle: (_value: boolean) => void;
};

export const GlobalControlsCard = ({
  settings,
  muteActive,
  onSettingUpdate,
  onMuteToggle,
}: Props) => (
  <AppView bg-lightCardBG style={cardStyle}>
    <SettingsItem
      leftElement={
        <AppIcon set="Ionicons" name="notifications-outline" size={22} />
      }
      translationKey="notifications.push_notifications"
      rightElement={
        <AppSwitch
          value={settings.pushEnabled}
          onValueChange={(value) =>
            onSettingUpdate('pushEnabled', { pushEnabled: value })
          }
        />
      }
    />
    <LineDivider marginV-0 />
    <SettingsItem
      leftElement={
        <AppIcon set="Ionicons" name="volume-mute-outline" size={22} />
      }
      translationKey="notifications.global_mute"
      rightElement={
        <AppSwitch value={muteActive} onValueChange={onMuteToggle} />
      }
    />
  </AppView>
);

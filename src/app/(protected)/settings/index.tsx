import { AppButton } from '@/components/AppButton';
import { AppView } from '@/components/ui';
import { Link } from 'expo-router';

import { Text } from 'react-native';

const Settings = () => {
  return (
    <AppView flex center>
      <AppButton>
        <Link href="/settings/reset-password">
          <Text>Go to update password</Text>
        </Link>
      </AppButton>
    </AppView>
  );
};

export default Settings;

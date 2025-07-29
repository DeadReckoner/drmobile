import { AppTouchableOpacity, AppView } from '@/components/ui';
import { Link } from 'expo-router';
import React from 'react';
import { Text } from 'react-native';

const Settings = () => {
  return (
    <AppView flex center>
      <AppTouchableOpacity>
        <Link href="/settings/reset-password">
          <Text>Go to update password</Text>
        </Link>
      </AppTouchableOpacity>
    </AppView>
  );
};

export default Settings;

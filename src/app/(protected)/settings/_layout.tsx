import { resetStackScreenOptions } from '@/utils/navigation.utils';
import { Stack } from 'expo-router';

const SettingsLayout = () => {
  return <Stack screenOptions={resetStackScreenOptions} />;
};

export default SettingsLayout;

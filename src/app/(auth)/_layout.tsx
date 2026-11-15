import { resetStackScreenOptions } from '@/utils/navigation.utils';
import { Stack } from 'expo-router';

// expo-router 58 removed the `initialRouteName` prop from <Stack>; the
// layout's anchor is the supported way to name its first screen.
export const unstable_settings = { anchor: 'login' };

export default function AuthLayout() {
  return <Stack screenOptions={resetStackScreenOptions} />;
}

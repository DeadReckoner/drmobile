import { resetStackScreenOptions } from '@/utils/navigation.utils';
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack initialRouteName="login" screenOptions={resetStackScreenOptions} />
  );
}

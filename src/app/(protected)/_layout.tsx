import { resetStackScreenOptions } from '@/utils/navigation.utils';
import { Stack } from 'expo-router';

export default function ProtectedLayout() {
  return (
    <Stack initialRouteName="(tabs)" screenOptions={resetStackScreenOptions} />
  );
}

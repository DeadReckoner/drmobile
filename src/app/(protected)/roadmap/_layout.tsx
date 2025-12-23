import { resetStackScreenOptions } from '@/utils/navigation.utils';
import { Stack } from 'expo-router';

const Layout = () => {
  return <Stack screenOptions={resetStackScreenOptions} />;
};

export default Layout;

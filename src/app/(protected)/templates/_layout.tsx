import { resetStackScreenOptions } from '@/utils/navigation.utils';
import { Stack } from 'expo-router';

/**
 * The Templates library stack. Individual template screens (routine and
 * roadmap customization) are added under this folder by later tickets.
 */
const Layout = () => {
  return <Stack screenOptions={resetStackScreenOptions} />;
};

export default Layout;

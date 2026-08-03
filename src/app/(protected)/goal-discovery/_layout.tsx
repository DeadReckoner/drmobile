import { resetStackScreenOptions } from '@/utils/navigation.utils';
import { Stack } from 'expo-router';

/**
 * Goal Discovery lives in its own stack, separate from /roadmap/create-ai-roadmap.
 * The chat-style flow is untouched and still reachable from the Create page.
 */
const Layout = () => {
  return <Stack screenOptions={resetStackScreenOptions} />;
};

export default Layout;

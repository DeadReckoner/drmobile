import { useAppSelector } from '@/store/hooks/store.hooks';
import { selectUser } from '@/store/slices/authSlice';
import { Redirect, useLocalSearchParams } from 'expo-router';

/**
 * Public deep link entry point for shared roadmaps.
 *
 * Expo Router maps `deadreckoner://shared/{token}` and
 * `https://deadreckoner.io/shared/{token}` directly to this file
 * because the `scheme` in app.json is "deadreckoner" and the file
 * lives at `app/shared/[token].tsx`.
 *
 * - Authenticated → redirect to the protected preview screen
 * - Unauthenticated → redirect to login (deep link is preserved by
 *   the OS and will re-open after the user signs in)
 */
const SharedRoadmapEntryPoint = () => {
  const { token } = useLocalSearchParams<{ token: string }>();
  const user = useAppSelector(selectUser);

  if (!token) {
    return <Redirect href="/(protected)/(tabs)/progress" />;
  }

  if (!user?.id) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Redirect
      href={{
        pathname: '/(protected)/roadmap/shared-roadmap',
        params: { token },
      }}
    />
  );
};

export default SharedRoadmapEntryPoint;

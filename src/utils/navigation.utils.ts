import * as Linking from 'expo-linking';
import { Href, Stack } from 'expo-router';

type StackProps = React.ComponentProps<typeof Stack>['screenOptions'];
export const resetStackScreenOptions: StackProps = {
  headerShown: false,
};

export const getAppRedirectUriScheme = (path: Href) => {
  const sanatisedPath = path.toString().replace('/', '');
  return Linking.createURL(sanatisedPath);
};

import * as Linking from 'expo-linking';
import { Href, Stack } from 'expo-router';
import { Colors } from 'react-native-ui-lib';

type StackProps = React.ComponentProps<typeof Stack>['screenOptions'];
export const resetStackScreenOptions: StackProps = {
  headerShown: false,
  contentStyle: { backgroundColor: Colors.screenBG },
};

export const getAppRedirectUriScheme = (path: Href) => {
  const sanatisedPath = path.toString().replace('/', '');
  return Linking.createURL(sanatisedPath);
};

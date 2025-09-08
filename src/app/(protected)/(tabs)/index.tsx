import { AppScreen } from '@/components/AppScreen';
import { Divider } from '@/components/Divider';
import { AppText } from '@/components/ui';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Link } from 'expo-router';
import { Text } from 'react-native-ui-lib';

const Today = () => {
  const theme = useAppTheme();
  return (
    <AppScreen center>
      <Text
        textColor
        onPress={() => {
          theme.toggleTheme();
        }}>
        {theme.theme}
      </Text>
      <Divider />
      <Link href={'/profile'}>
        <AppText textColor>Profile</AppText>
      </Link>
    </AppScreen>
  );
};

export default Today;

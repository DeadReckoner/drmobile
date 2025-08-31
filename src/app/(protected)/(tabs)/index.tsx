import { AppScreen } from '@/components/AppScreen';
import { useAppTheme } from '@/hooks/useAppTheme';
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
    </AppScreen>
  );
};

export default Today;

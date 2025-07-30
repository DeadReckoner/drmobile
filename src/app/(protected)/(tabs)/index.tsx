import { AppScreen } from '@/components/AppScreen';
import { AppText } from '@/components/ui';
import { useAppSelector } from '@/store/hooks/store.hooks';
import { selectTheme, setThemeAction } from '@/store/slices/settingsSlice';
import { useDispatch } from 'react-redux';

const Today = () => {
  const dispatch = useDispatch();
  const theme = useAppSelector(selectTheme);

  return (
    <AppScreen>
      <AppText
        marginT-200
        onPress={() =>
          dispatch(setThemeAction(theme === 'dark' ? 'light' : 'dark'))
        }>
        Today Screen
      </AppText>
    </AppScreen>
  );
};

export default Today;

import { resetStackScreenOptions } from '@/utils/navigation.utils';
import { Stack } from 'expo-router';

const CreateLayout = () => {
  return <Stack screenOptions={resetStackScreenOptions} />;
};

export default CreateLayout;

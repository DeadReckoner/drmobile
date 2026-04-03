import { AppModal } from '@/components/AppModal';
import { TranslatedText } from '@/components/TranslatedText';
import { AppView } from '@/components/ui';
import { useGetMyProfileQuery } from '@/hooks/user';
import { useAppSelector } from '@/store/hooks/store.hooks';
import { selectUser } from '@/store/slices/authSlice';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { UpdateProfileForm } from './UpdateProfileForm';

export const CompleteProfile = () => {
  const router = useRouter();
  const user = useAppSelector(selectUser);
  const [isVisible, setIsVisible] = useState(false);
  const { isLoading, isFetching } = useGetMyProfileQuery(undefined, {
    refetchOnMountOrArgChange: true,
    skip: !user,
  });

  useEffect(() => {
    setIsVisible(!user?.name);
  }, [user.name]);

  const handleSuccess = () => {
    setIsVisible(false);
    setTimeout(() => {
      router.replace('/');
    }, 300);
  };

  return (
    <AppModal
      visible={!(isLoading || isFetching) && isVisible}
      enablePanDownToClose={false}
      dismissible={false}
      snapPoints={['90%']}
      enableDynamicSizing={false}
      setIsVisible={setIsVisible}>
      <AppView marginV-8>
        <TranslatedText
          subtitle1
          semibold
          center
          marginB-20
          translationKey="authentication.complete_profile.title"
        />
        <UpdateProfileForm onSuccess={handleSuccess} />
      </AppView>
    </AppModal>
  );
};

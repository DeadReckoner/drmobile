import { AppModal } from '@/components/AppModal';
import { TranslatedText } from '@/components/TranslatedText';
import { AppView } from '@/components/ui';
import { useAppSelector } from '@/store/hooks/store.hooks';
import { selectUser } from '@/store/slices/authSlice';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { UpdateProfileForm } from './UpdateProfileForm';

export const CompleteProfile = () => {
  const router = useRouter();
  const user = useAppSelector(selectUser);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!user.name) {
      setIsVisible(true);
    }
  }, [user.name]);

  const handleSuccess = () => {
    setIsVisible(false);
    setTimeout(() => {
      router.replace('/');
    }, 300);
  };

  return (
    <AppModal
      visible={isVisible}
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

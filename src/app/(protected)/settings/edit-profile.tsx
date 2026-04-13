import { AppScreen } from '@/components/AppScreen';
import { UpdateProfileForm } from '@/components/auth/UpdateProfileForm';
import { Divider } from '@/components/Divider';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { AppView } from '@/components/ui';
import { useAppSelector } from '@/store/hooks/store.hooks';
import { selectUser } from '@/store/slices/authSlice';
import { router } from 'expo-router';

const EditProfile = () => {
  const user = useAppSelector(selectUser);

  const nameParts = user.name?.split(' ') || [];
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  const handleSuccess = () => {
    router.back();
  };

  return (
    <AppScreen safeArea>
      <HeaderWithBack headerKey="settings.edit_profile" />
      <Divider marginT-24 />

      <AppView marginT-20>
        <UpdateProfileForm
          onSuccess={handleSuccess}
          initialFirstName={firstName}
          initialLastName={lastName}
        />
      </AppView>
    </AppScreen>
  );
};

export default EditProfile;

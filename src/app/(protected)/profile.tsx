import { AppScreen } from '@/components/AppScreen';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { TranslatedText } from '@/components/TranslatedText';
import { AppImage, AppText, AppView } from '@/components/ui';
import { useAppSelector } from '@/store/hooks/store.hooks';
import { selectUser } from '@/store/slices/authSlice';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Profile = () => {
  const { top } = useSafeAreaInsets();
  const user = useAppSelector(selectUser);
  return (
    <AppScreen>
      <ScrollView
        contentContainerStyle={[styles.scrollContainer, { paddingTop: top }]}>
        <HeaderWithBack headerKey="profile.profile" />
        <AppView center marginV-36>
          <AppImage
            source={{ uri: user.avatar }}
            placeholder={{ uri: './assets/images/icon.png' }}
            style={styles.image}
          />
          <AppText textColor subtitle2 center>
            {user.name}
          </AppText>
          <AppText marginT-6 textColor caption center>
            {user.email}
          </AppText>
        </AppView>
        <AppView>
          <TranslatedText subtitle1 translationKey="profile.settings" />
        </AppView>
      </ScrollView>
    </AppScreen>
  );
};

export default Profile;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
});

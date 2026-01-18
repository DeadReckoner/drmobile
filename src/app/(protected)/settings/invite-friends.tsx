import { AppButton } from '@/components/AppButton';
import { AppIcon } from '@/components/AppIcon';
import { AppScreen } from '@/components/AppScreen';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { InviteViaModal } from '@/components/InviteViaModal';
import { Loader } from '@/components/Loader';
import { PermissionDeniedModal } from '@/components/PermissionDeniedModal';
import { AppText, AppTextField, AppView } from '@/components/ui';
import { useContacts } from '@/hooks/useContacts';
import { useLocalization } from '@/hooks/useLocalization';
import { Animations } from '@/utils/animation.utils';
import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { Colors } from 'react-native-ui-lib';

interface Contact {
  id: string;
  name: string;
  phoneNumbers?: string[];
  emails?: string[];
  invited: boolean;
}

const InviteFriends = () => {
  const { t } = useLocalization();
  const [searchQuery, setSearchQuery] = useState('');
  const [invitedContacts] = useState<Set<string>>(new Set());
  const [isPermissionModalVisible, setIsPermissionModalVisible] =
    useState(false);
  const [isInviteViaModalVisible, setIsInviteViaModalVisible] = useState(false);
  const [selectedContact, setSelectedContact] = useState<{
    phoneNumber?: string;
    name?: string;
  } | null>(null);

  const {
    contacts: phoneContacts,
    isLoading,
    permissionStatus,
    requestPermission,
    openSettings,
    isPermissionDenied,
    presentAccessPickerAsync,
  } = useContacts();

  useEffect(() => {
    if (permissionStatus === 'undetermined') {
      requestPermission();
    }
  }, [permissionStatus, requestPermission]);

  useEffect(() => {
    if (isPermissionDenied) {
      setIsPermissionModalVisible(true);
    }
  }, [isPermissionDenied]);

  const handleInvite = (contact: Contact) => {
    const phoneNumber = contact.phoneNumbers?.[0];
    setSelectedContact({
      phoneNumber,
      name: contact.name,
    });
    setIsInviteViaModalVisible(true);
  };

  const contactsWithInviteStatus: Contact[] = phoneContacts.map((contact) => ({
    ...contact,
    invited: invitedContacts.has(contact.id),
  }));

  const filteredContacts = contactsWithInviteStatus.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleOpenSettings = async () => {
    setIsPermissionModalVisible(false);
    await openSettings();
  };

  const handleContactSelection = async () => {
    await presentAccessPickerAsync();
  };

  const handleRetryPermission = async () => {
    setIsPermissionModalVisible(false);
    await requestPermission();
  };

  const renderContactItem = ({ item }: { item: Contact }) => (
    <AppView
      bg-cardBG
      marginB-8
      paddingH-12
      paddingV-16
      row
      centerV
      spread
      style={styles.contactCard}>
      <AppView style={styles.avatar} center backgroundColor={Colors.primary}>
        <AppIcon set="Feather" name="user" size={16} color={Colors.white} />
      </AppView>

      <AppView flex marginL-16>
        <AppText textColor body2 style={styles.contactName}>
          {item.name}
        </AppText>
      </AppView>

      <AppButton onPress={() => handleInvite(item)}>
        <AppView
          paddingH-20
          paddingV-8
          center
          style={styles.inviteButton}
          backgroundColor={item.invited ? Colors.success : Colors.primary}>
          <AppText white style={styles.inviteButtonText}>
            {item.invited ? t('settings.invited') : t('settings.invite')}
          </AppText>
        </AppView>
      </AppButton>
    </AppView>
  );

  const keyExtractor = (item: Contact) => item.id;

  return (
    <AppScreen safeArea>
      <AppView row spread centerV marginB-16>
        <AppView flex centerV>
          <HeaderWithBack headerKey="settings.invite_friends" />
        </AppView>
        <AppButton
          onPress={handleContactSelection}
          paddingL-24
          paddingR-8
          center>
          <AppIcon
            set="Feather"
            name="refresh-ccw"
            size={20}
            color={Colors.textColor}
          />
        </AppButton>
      </AppView>
      <AppView
        bg-cardBG
        paddingH-12
        paddingV-12
        row
        centerV
        style={styles.searchContainer}>
        <AppIcon
          set="Feather"
          name="search"
          size={20}
          color={Colors.textColor}
        />
        <AppTextField
          placeholder={t('settings.search_contacts')}
          placeholderTextColor={Colors.secondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
          containerStyle={styles.searchFieldContainer}
        />
      </AppView>
      <AppView flex marginT-16 layout={Animations.Layout.Springify()}>
        {isLoading ? (
          <AppView
            center
            paddingT-64
            entering={Animations.Entry.FadeInDownWithSpring()}
            exiting={Animations.Exit.FadeOutDown()}>
            <Loader transparent />
          </AppView>
        ) : permissionStatus === 'denied' ? (
          <AppView
            flex
            center
            paddingT-40
            paddingH-32
            entering={Animations.Entry.FadeInDownWithSpring()}
            exiting={Animations.Exit.FadeOutDown()}>
            <AppIcon
              set="Feather"
              name="alert-circle"
              size={48}
              color={Colors.error}
            />
            <AppText textColor marginT-16 center body2>
              {t('settings.contacts_permission_required')}
            </AppText>
            <AppText textColor marginT-8 center caption>
              {t('settings.grant_permission_description')}
            </AppText>
            <AppButton
              marginT-24
              bg-primary
              padding-12
              paddingH-24
              br20
              onPress={handleRetryPermission}>
              <AppText white caption>
                {t('settings.grant_permission')}
              </AppText>
            </AppButton>
          </AppView>
        ) : filteredContacts.length === 0 ? (
          <AppView
            flex
            center
            paddingT-40
            paddingH-32
            entering={Animations.Entry.FadeInDownWithSpring()}
            exiting={Animations.Exit.FadeOutDown()}>
            <AppIcon name="user" size={48} color={Colors.secondary} />
            <AppText textColor marginT-16 center body2>
              {searchQuery
                ? t('settings.no_contacts_found')
                : t('settings.no_contacts_available')}
            </AppText>
          </AppView>
        ) : (
          <Animated.FlatList
            entering={Animations.Entry.FadeInDownWithSpring()}
            exiting={Animations.Exit.FadeOutDown()}
            data={filteredContacts}
            renderItem={renderContactItem}
            keyExtractor={keyExtractor}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        )}
      </AppView>

      <PermissionDeniedModal
        visible={isPermissionModalVisible}
        onDismiss={() => setIsPermissionModalVisible(false)}
        onOpenSettings={handleOpenSettings}
      />

      <InviteViaModal
        visible={isInviteViaModalVisible}
        setIsVisible={setIsInviteViaModalVisible}
        phoneNumber={selectedContact?.phoneNumber}
        contactName={selectedContact?.name}
      />
    </AppScreen>
  );
};

export default InviteFriends;

const styles = StyleSheet.create({
  searchContainer: {
    borderRadius: 10,
    gap: 12,
  },
  searchFieldContainer: {
    flex: 1,
  },
  searchInput: {
    color: Colors.secondary,
    fontSize: 14,
    fontFamily: 'Unbounded-Regular',
    letterSpacing: -0.42,
    lineHeight: 16.8,
    padding: 0,
  },
  contactCard: {
    borderRadius: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  avatarText: {
    fontSize: 12,
    fontFamily: 'Unbounded-Regular',
    letterSpacing: -0.24,
  },
  contactName: {
    fontSize: 14,
    fontFamily: 'Unbounded-Regular',
    letterSpacing: -0.42,
    lineHeight: 16.8,
  },
  inviteButton: {
    borderRadius: 51,
    minWidth: 58,
    minHeight: 21,
  },
  inviteButtonText: {
    fontSize: 10,
    fontFamily: 'Unbounded-Regular',
    letterSpacing: -0.2,
    lineHeight: 12,
  },
  listContent: {
    paddingBottom: 24,
  },
});

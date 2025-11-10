import { AppButton } from '@/components/AppButton';
import { AppIcon } from '@/components/AppIcon';
import { AppScreen } from '@/components/AppScreen';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { AppText, AppTextField, AppView } from '@/components/ui';
import { useLocalization } from '@/hooks/useLocalization';
import React, { useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

interface Contact {
  id: string;
  name: string;
  avatar?: string;
  invited: boolean;
}

const MOCK_CONTACTS: Contact[] = [
  { id: '1', name: 'Lucas Bennet', invited: false },
  { id: '2', name: 'Olivia Reed', invited: false },
  { id: '3', name: 'Jessica Reed', invited: false },
  { id: '4', name: 'Ethan Hunt', invited: false },
  { id: '5', name: 'Jesse Pinkman', invited: false },
  { id: '6', name: 'Nate Foster', invited: false },
  { id: '7', name: 'Lucas Bennet', invited: false },
  { id: '8', name: 'Olivia Reed', invited: false },
  { id: '9', name: 'Jessica Reed', invited: false },
];

const InviteFriends = () => {
  const { t } = useLocalization();
  const [searchQuery, setSearchQuery] = useState('');
  const [contacts, setContacts] = useState<Contact[]>(MOCK_CONTACTS);

  const handleInvite = (contactId: string) => {
    setContacts((prev) =>
      prev.map((contact) =>
        contact.id === contactId
          ? { ...contact, invited: !contact.invited }
          : contact,
      ),
    );
  };

  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const renderContactItem = ({ item }: { item: Contact }) => (
    <AppView
      bg-cardBG
      marginB-8
      paddingH-12
      paddingV-14
      row
      centerV
      spread
      style={styles.contactCard}>
      <AppView style={styles.avatar} center backgroundColor={Colors.primary}>
        <AppIcon set="Feather" name="user" size={16} color={Colors.white} />
      </AppView>

      <AppView flex marginL-16>
        <AppText white body2 style={styles.contactName}>
          {item.name}
        </AppText>
      </AppView>

      <AppButton onPress={() => handleInvite(item.id)}>
        <AppView
          paddingH-14
          paddingV-5
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
      <HeaderWithBack headerKey="settings.invite_friends" marginB-16 />
      <AppView
        bg-cardBG
        paddingH-12
        paddingV-12
        row
        centerV
        style={styles.searchContainer}>
        <AppIcon set="Feather" name="search" size={20} color={Colors.white} />
        <AppTextField
          placeholder={t('settings.search_contacts')}
          placeholderTextColor={Colors.secondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
          containerStyle={styles.searchFieldContainer}
        />
      </AppView>
      <AppView flex marginT-16>
        <FlatList
          data={filteredContacts}
          renderItem={renderContactItem}
          keyExtractor={keyExtractor}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      </AppView>
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
    height: 21,
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

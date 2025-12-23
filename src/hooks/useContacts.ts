import { useLocalization } from '@/hooks/useLocalization';
import * as Contacts from 'expo-contacts';
import { useCallback, useEffect, useState } from 'react';
import { AppState, Linking, Platform } from 'react-native';

export interface ContactData {
  id: string;
  name: string;
  phoneNumbers?: string[];
  emails?: string[];
}

type PermissionStatus = 'granted' | 'denied' | 'undetermined';

interface UseContactsReturn {
  contacts: ContactData[];
  isLoading: boolean;
  error: string | null;
  permissionStatus: PermissionStatus;
  requestPermission: () => Promise<void>;
  refreshContacts: () => Promise<void>;
  openSettings: () => Promise<void>;
  isPermissionDenied: boolean;
  presentAccessPickerAsync: () => Promise<void>;
}

export const useContacts = (): UseContactsReturn => {
  const { t } = useLocalization();
  const [contacts, setContacts] = useState<ContactData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] =
    useState<PermissionStatus>('undetermined');

  useEffect(() => {
    checkPermissionStatus();
  }, []);

  const checkPermissionStatus = async () => {
    try {
      const { status } = await Contacts.getPermissionsAsync();
      setPermissionStatus(
        status === 'granted'
          ? 'granted'
          : status === 'denied'
            ? 'denied'
            : 'undetermined',
      );
    } catch {
      setPermissionStatus('undetermined');
    }
  };
  const requestPermission = async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();

      if (status === 'granted') {
        setPermissionStatus('granted');
        await fetchContacts();
      } else {
        setPermissionStatus('denied');
      }
    } catch {
      setError(t('settings.failed_to_request_permission'));
      setPermissionStatus('denied');
    }
  };

  const fetchContacts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { status } = await Contacts.getPermissionsAsync();

      if (status !== 'granted') {
        setPermissionStatus(status === 'denied' ? 'denied' : 'undetermined');
        setIsLoading(false);
        return;
      }

      const { data } = await Contacts.getContactsAsync({
        fields: [
          Contacts.Fields.Name,
          Contacts.Fields.PhoneNumbers,
          Contacts.Fields.Emails,
        ],
        sort: Contacts.SortTypes.FirstName,
      });

      const formattedContacts: ContactData[] = data
        .filter((contact) => contact.id)
        .map((contact) => ({
          id: contact.id!,
          name: contact.name || t('settings.unknown_contact'),
          phoneNumbers: contact.phoneNumbers?.map((p) => p.number || '') || [],
          emails: contact.emails?.map((e) => e.email || '') || [],
        }));

      setContacts(formattedContacts);
      setPermissionStatus('granted');
    } catch {
      setError(t('settings.failed_to_fetch_contacts'));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  const refreshContacts = useCallback(async () => {
    if (permissionStatus === 'granted') {
      await fetchContacts();
    }
  }, [permissionStatus, fetchContacts]);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      async (nextState) => {
        if (nextState === 'active') {
          await refreshContacts();
        }
      },
    );
    return () => subscription.remove();
  }, [refreshContacts]);

  const openSettings = async () => {
    try {
      if (Platform.OS === 'ios') {
        await Linking.openURL('app-settings:');
      } else {
        await Linking.openSettings();
      }
    } catch {}
  };

  const presentAccessPickerAsync = async () => {
    try {
      await Contacts.presentAccessPickerAsync();
    } catch {}
  };

  return {
    contacts,
    isLoading,
    error,
    permissionStatus,
    requestPermission,
    refreshContacts,
    openSettings,
    presentAccessPickerAsync,
    isPermissionDenied: permissionStatus === 'denied',
  };
};

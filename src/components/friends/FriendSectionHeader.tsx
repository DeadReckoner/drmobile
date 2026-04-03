import { AppText, AppView } from '@/components/ui';
import React from 'react';
import { StyleSheet } from 'react-native';

interface FriendSectionHeaderProps {
  title: string;
}

export const FriendSectionHeader = ({ title }: FriendSectionHeaderProps) => {
  return (
    <AppView style={styles.container}>
      <AppText body2 secondary>
        {title}
      </AppText>
    </AppView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    marginBottom: 8,
  },
});

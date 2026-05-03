import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppIcon } from '@/components/AppIcon';
import { AppTextField, AppView } from '@/components/ui';
import { useLocalization } from '@/hooks/useLocalization';
import { Animations } from '@/utils/animation.utils';
import React from 'react';
import { StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

interface FriendSearchBarProps {
  value: string;
  onChangeText: (_text: string) => void;
  onClear: () => void;
}

export const FriendSearchBar = ({
  value,
  onChangeText,
  onClear,
}: FriendSearchBarProps) => {
  const { t } = useLocalization();

  return (
    <AppCard style={styles.searchCard} padding-8 paddingH-16>
      <AppView row centerV spread>
        <AppView row centerV gap-12 flex>
          <AppIcon name="search" size={20} color={Colors.textColor} />
          <AppTextField
            paddingV-8
            color={Colors.textColor}
            body2
            placeholder={t('settings.search_friend')}
            placeholderTextColor={Colors.secondary}
            value={value}
            onChangeText={onChangeText}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            containerStyle={styles.input}
          />
        </AppView>
        {value.length > 0 && (
          <AppView
            reanimated
            entering={Animations.Entry.FadeIn(0)}
            exiting={Animations.Exit.FadeOut()}>
            <AppButton onPress={onClear}>
              <AppIcon name="close" size={20} color={Colors.secondary} />
            </AppButton>
          </AppView>
        )}
      </AppView>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  searchCard: {
    borderRadius: 10,
  },
  input: {
    flexGrow: 1,
  },
});

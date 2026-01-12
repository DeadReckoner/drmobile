import { AppButton } from '@/components/AppButton';
import { AppIcon } from '@/components/AppIcon';
import { Loader } from '@/components/Loader';
import { AppTextField, AppView } from '@/components/ui';
import { useLocalization } from '@/hooks/useLocalization';
import { Animations } from '@/utils/animation.utils';
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

interface MessageComposerProps {
  onSend: (_messageText: string) => void;
  onFocus?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export const MessageComposer = ({
  onSend,
  onFocus,
  disabled,
  isLoading,
}: MessageComposerProps) => {
  const [message, setMessage] = useState('');
  const isDisabled = !message.trim() || disabled || isLoading;
  const { t } = useLocalization();

  const handleSend = () => {
    if (!isDisabled) {
      onSend(message);
      setMessage('');
    }
  };
  if (isLoading) {
    return (
      <AppView padding-32>
        <Loader transparent />
      </AppView>
    );
  }

  return (
    <AppView
      reanimated
      entering={Animations.Entry.FadeInDown()}
      exiting={Animations.Exit.FadeOutDown()}
      bg-cardBG
      paddingT-16
      paddingB-32
      paddingH-16>
      <AppView row gap-16 paddingR-8>
        <AppView
          style={[styles.input, { borderColor: Colors.outline }]}
          padding-16
          flex-1>
          <AppTextField
            placeholder={t('messages.type_message_placeholder')}
            body2
            containerStyle={{ maxHeight: 120 }}
            multiline
            onChangeText={setMessage}
            value={message}
            onFocus={onFocus}
          />
        </AppView>
        <AppButton center onPress={handleSend} disabled={isDisabled}>
          <AppIcon
            name="send"
            set="Feather"
            color={isDisabled ? Colors.outline : Colors.textColor}
            size={24}
          />
        </AppButton>
      </AppView>
    </AppView>
  );
};

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: 24,
  },
});

import { AppButton } from '@/components/AppButton';
import { AppIcon } from '@/components/AppIcon';
import { AppTextField, AppView } from '@/components/ui';
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

interface ComposerProps {
  onSend: (_messageText: string) => void;
  onFocus?: () => void;
}
export const Composer = ({ onSend, onFocus }: ComposerProps) => {
  const [message, setMessage] = useState('');
  return (
    <AppView bg-cardBG paddingT-16 paddingB-32 paddingH-16>
      <AppView row gap-16 paddingR-8>
        <AppView
          style={[style.input, { borderColor: Colors.primary }]}
          padding-16
          flex-1>
          <AppTextField
            placeholder="Enter your answer"
            body2
            containerStyle={{ maxHeight: 120 }}
            multiline
            onChangeText={setMessage}
            value={message}
            returnKeyType="default"
            autoFocus={true}
            onFocus={onFocus}
          />
        </AppView>
        <AppButton
          center
          onPress={() => {
            onSend(message);
            setMessage('');
          }}
          disabled={!message.trim()}>
          <AppIcon name="send" set="Feather" />
        </AppButton>
      </AppView>
    </AppView>
  );
};

const style = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: 8,
  },
});

import { AppButton } from '@/components/AppButton';
import { AppIcon } from '@/components/AppIcon';
import { AppTextField, AppView } from '@/components/ui';
import { useLocalization } from '@/hooks/useLocalization';
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

interface ComposerProps {
  onSend: (_messageText: string) => void;
  onFocus?: () => void;
  disabled?: boolean;
}
export const Composer = ({ onSend, onFocus, disabled }: ComposerProps) => {
  const [message, setMessage] = useState('');
  const isDisabled = !message.trim() || disabled;
  const { t } = useLocalization();

  return (
    <AppView bg-cardBG paddingT-16 paddingB-32 paddingH-16>
      <AppView row gap-16 paddingR-8>
        <AppView
          style={[style.input, { borderColor: Colors.primary }]}
          padding-16
          flex-1>
          <AppTextField
            placeholder={t('ai_roadmap.prompts.composer_placeholder')}
            body2
            containerStyle={{ maxHeight: 120 }}
            multiline
            onChangeText={setMessage}
            value={message}
            onFocus={onFocus}
          />
        </AppView>
        <AppButton
          center
          onPress={() => {
            onSend(message);
            setMessage('');
          }}
          disabled={isDisabled}>
          <AppIcon
            name="send"
            set="Feather"
            color={disabled ? Colors.outline : Colors.textColor}
          />
        </AppButton>
      </AppView>
    </AppView>
  );
};

const style = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: 24,
  },
});

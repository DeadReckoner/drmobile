import { AppText, AppView } from '@/components/ui';
import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

interface MessageProps {
  id: string;
  type: 'system' | 'user';
  content: string;
  isTyping?: boolean;
  onTypingComplete?: () => void;
}

const tokenizeText = (text: string): string[] => {
  return text.split(' ');
};

export const Message = ({
  type,
  content,
  isTyping,
  onTypingComplete,
}: MessageProps) => {
  const [displayContent, setDisplayContent] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const isSystem = type === 'system';

  useEffect(() => {
    if (isTyping && isSystem) {
      const tokens = tokenizeText(content);
      setIsAnimating(true);

      let currentTokenIndex = 0;
      const typingInterval = setInterval(() => {
        if (currentTokenIndex < tokens.length) {
          setDisplayContent(tokens.slice(0, currentTokenIndex + 1).join(' '));
          currentTokenIndex++;
        } else {
          clearInterval(typingInterval);
          setIsAnimating(false);
          onTypingComplete?.();
        }
      }, 120);

      return () => clearInterval(typingInterval);
    } else {
      setDisplayContent(content);
    }
  }, [content, isTyping, isSystem, onTypingComplete]);

  return (
    <AppView
      style={[
        styles.messageContainer,
        isSystem ? styles.systemMessage : styles.userMessage,
      ]}
      marginB-8>
      <AppView
        style={[
          styles.messageBubble,
          isSystem
            ? [{ backgroundColor: Colors.cardBG, borderColor: Colors.outline }]
            : { backgroundColor: Colors.primary },
        ]}
        padding-16>
        <AppText
          body2
          style={[
            styles.messageText,
            isSystem
              ? { color: Colors.textColor, fontWeight: '300' }
              : { color: Colors.textOnPrimary },
          ]}>
          {displayContent}
          {isAnimating && (
            <AppText
              style={[styles.typingIndicator, { color: Colors.primary }]}>
              |
            </AppText>
          )}
        </AppText>
      </AppView>
    </AppView>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    flexDirection: 'row',
  },
  systemMessage: {
    justifyContent: 'flex-start',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  messageBubble: {
    maxWidth: '85%',
    borderRadius: 12,
  },
  messageText: {
    fontWeight: '300',
    lineHeight: 24,
  },
  typingIndicator: {
    fontWeight: 'normal',
  },
});

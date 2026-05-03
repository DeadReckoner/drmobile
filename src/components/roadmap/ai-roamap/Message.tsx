import { AppText, AppView } from '@/components/ui';
import React, { useEffect, useRef, useState } from 'react';
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
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (isTyping && isSystem && !hasAnimated.current) {
      hasAnimated.current = true;
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
    } else if (!isTyping || !isSystem) {
      setDisplayContent(content);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, isTyping, isSystem]);

  return (
    <AppView
      style={[
        styles.messageContainer,
        isSystem ? styles.systemMessage : styles.userMessage,
      ]}>
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
          light
          style={[
            styles.messageText,
            isSystem
              ? { color: Colors.textColor }
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
    lineHeight: 24,
  },
  typingIndicator: {
    fontWeight: 'normal',
  },
});

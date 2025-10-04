import { PrimaryButtonContainer } from '@/components/PrimaryButtonContainer';
import { TranslatedText } from '@/components/TranslatedText';
import { useToggleAnimation } from '@/hooks/useToggleAnimation';
import { TranslationKeysType } from '@/lib/localization/types/i18n.types';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { Colors, TouchableOpacityProps } from 'react-native-ui-lib';

interface PrimaryButtonProps {
  label: TranslationKeysType;
  onPress: TouchableOpacityProps['onPress'];
  isLoading?: boolean;
  shouldShowLoader?: boolean;
}

export const PrimaryButton = ({
  label,
  onPress,
  isLoading,
  shouldShowLoader,
}: PrimaryButtonProps) => {
  const { animatedStyle: textAnimatedStyle, set: setTextLabelVisibility } =
    useToggleAnimation({ initialValue: 1 });

  const { animatedStyle: loaderAnimatedStyle, set: setLoaderVisibility } =
    useToggleAnimation({ initialValue: 0 });

  useEffect(() => {
    if (!shouldShowLoader) return;
    if (isLoading) {
      setTextLabelVisibility(0);
      setLoaderVisibility(1);
    } else {
      setTextLabelVisibility(1);
      setLoaderVisibility(0);
    }
  }, [
    isLoading,
    shouldShowLoader,
    setTextLabelVisibility,
    setLoaderVisibility,
  ]);

  return (
    <PrimaryButtonContainer onPress={onPress} disabled={isLoading}>
      <Animated.View style={textAnimatedStyle}>
        <TranslatedText textOnPrimary buttonLable translationKey={label} />
      </Animated.View>

      {shouldShowLoader && (
        <Animated.View
          style={[
            styles.loaderContainer,
            loaderAnimatedStyle,
            StyleSheet.absoluteFillObject,
          ]}>
          <ActivityIndicator color={Colors.textOnPrimary} />
        </Animated.View>
      )}
    </PrimaryButtonContainer>
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
});

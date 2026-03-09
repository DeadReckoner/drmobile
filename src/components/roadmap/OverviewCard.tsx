import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppIcon } from '@/components/AppIcon';
import { AppProgressBar, AppText, AppView } from '@/components/ui';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Colors, Hint, Typography } from 'react-native-ui-lib';

export interface OverviewCardProps {
  title: string;
  description: string;
  progress: number;
  tooltipText?: string;
  onPress?: () => void;
}

export const OverviewCard = ({
  title,
  description,
  progress,
  tooltipText,
  onPress,
}: OverviewCardProps) => {
  const { theme } = useAppTheme();
  const progressColor = theme === 'dark' ? Colors.white : Colors.primary;
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const [hintVisible, setHintVisible] = useState(false);

  return (
    <AppCard onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
      <AppView row centerV spread marginB-8>
        <AppText flex body1 semibold textColor numberOfLines={2} marginR-8>
          {title}
        </AppText>
        {tooltipText && (
          <Hint
            visible={hintVisible}
            message={tooltipText}
            color={Colors.accent}
            messageStyle={[Typography.body2, Typography.light]}
            backdropColor={Colors.hintBackdrop}
            onBackgroundPress={() => setHintVisible(false)}
            offset={8}>
            <AppButton onPress={() => setHintVisible((v) => !v)}>
              <AppIcon
                set="Feather"
                name="info"
                size={20}
                color={Colors.textColor}
              />
            </AppButton>
          </Hint>
        )}
      </AppView>
      {!!description && (
        <AppText xsm secondary marginB-12>
          {description}
        </AppText>
      )}
      <AppView row centerV gap-8>
        <AppProgressBar
          style={[styles.progressBar, { backgroundColor: Colors.outline }]}
          fullWidth={false}
          progress={clampedProgress}
          progressColor={progressColor}
        />
        <AppText xsm secondary>
          {clampedProgress}%
        </AppText>
      </AppView>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  progressBar: {
    flex: 1,
    height: 6,
  },
});

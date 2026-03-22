import { AppText, AppView } from '@/components/ui';
import type { RoadmapExecutionStatusType } from '@/hooks/roadmap/types/roadmap.types';
import { StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

interface LevelBadgeProps {
  label: string;
  status: RoadmapExecutionStatusType;
}

const STATUS_COLORS: Record<RoadmapExecutionStatusType, string> = {
  in_progress: 'badgeCurrent',
  not_started: 'badgeUpcoming',
  overdue: 'badgeOverdue',
  completed: 'badgeCompleted',
};

export const LevelBadge = ({ label, status }: LevelBadgeProps) => {
  const colorKey = STATUS_COLORS[status];
  const bgColor = (Colors as Record<string, string>)[colorKey] ?? Colors.accent;
  const textColor = status === 'not_started' ? '#333333' : '#FFFFFF';

  return (
    <AppView style={[styles.badge, { backgroundColor: bgColor }]}>
      <AppText sm semibold style={{ color: textColor, fontSize: 9 }}>
        {label}
      </AppText>
    </AppView>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 100,
    alignSelf: 'flex-start',
  },
});

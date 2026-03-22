import { AppCard } from '@/components/AppCard';
import { AppList } from '@/components/AppList';
import { AppScreen } from '@/components/AppScreen';
import { Divider } from '@/components/Divider';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { AppProgressBar, AppText, AppView } from '@/components/ui';
import { MilestoneType } from '@/hooks/roadmap/types/roadmap.types';
import { useLocalization } from '@/hooks/useLocalization';
import { DateUtils } from '@/utils/date.utils';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useMemo, useRef } from 'react';
import { Dimensions, ScrollView, StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

const WINDOW_HEIGHT = Dimensions.get('window').height;

const calculateMilestoneProgress = (milestone: MilestoneType): number => {
  const tasks = milestone.tasks ?? [];
  if (tasks.length === 0) return 0;
  const completed = tasks.filter((t) =>
    t.steps?.length ? t.steps.every((s) => s.completed) : t.completed,
  ).length;
  return Math.floor((completed / tasks.length) * 100);
};

const PhaseMilestones = () => {
  const params = useLocalSearchParams<{ milestones: string }>();
  const { t } = useLocalization();
  const scrollViewRef = useRef<ScrollView>(null);
  const milestones = useMemo(() => {
    try {
      return JSON.parse(params.milestones) as MilestoneType[];
    } catch {
      return [];
    }
  }, [params.milestones]);
  const currentMilestone = milestones.find((m) => !m.reached);
  const milestoneProgress = useMemo(() => {
    if (!currentMilestone) return 0;
    return calculateMilestoneProgress(currentMilestone);
  }, [currentMilestone]);

  const scrollToCurrentMilestone = useCallback((y: number, height: number) => {
    scrollViewRef.current?.scrollTo({
      y: Math.max(0, y - 80 - WINDOW_HEIGHT / 2 + height / 2),
      animated: true,
    });
  }, []);

  const renderMilestoneItem = ({
    item,
    index,
  }: {
    item: MilestoneType;
    index: number;
  }) => (
    <AppCard
      onPress={() => {
        router.navigate({
          pathname: '/roadmap/phase-milestones-tasks',
          params: {
            tasks: JSON.stringify(item.tasks || []),
          },
        });
      }}
      style={{
        borderWidth: 3,
        borderColor:
          item.milestone_id === currentMilestone?.milestone_id
            ? Colors.accent
            : 'transparent',
      }}>
      <AppView gap-8>
        <AppText body1 textColor>
          {t('common.milestone')} {index + 1}: {item.sub_goal}
        </AppText>
        <AppText xsm textColor>
          {t('common.description')}: {item.description}
        </AppText>
        {item.date && (
          <AppText xsm textColor>
            {t('common.date')}: {DateUtils.formatDate(item.date)}
          </AppText>
        )}
        <AppView row centerV gap-8>
          <AppProgressBar
            style={[styles.progressBar, { backgroundColor: Colors.outline }]}
            fullWidth={false}
            progress={milestoneProgress}
            progressColor={Colors.textColor}
          />
          <AppText xsm secondary>
            {milestoneProgress}%
          </AppText>
        </AppView>
      </AppView>
    </AppCard>
  );

  return (
    <AppScreen safeArea>
      <HeaderWithBack headerKey="common.milestones" />
      <Divider />
      <AppList
        refScrollView={scrollViewRef}
        data={milestones}
        ItemSeparatorComponent={() => <Divider />}
        onLayout={
          currentMilestone
            ? (e) => {
                const { y, height } = e.nativeEvent.layout;
                scrollToCurrentMilestone(y, height);
              }
            : undefined
        }
        renderItem={renderMilestoneItem}
      />
    </AppScreen>
  );
};

export default PhaseMilestones;

const styles = StyleSheet.create({
  progressBar: {
    flex: 1,
    height: 6,
  },
});

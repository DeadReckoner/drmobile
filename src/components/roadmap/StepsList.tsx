import { AppCard } from '@/components/AppCard';
import { AppList } from '@/components/AppList';
import { Divider } from '@/components/Divider';
import { LineDivider } from '@/components/LineDivider';
import { EmptyListItemPlaceholder } from '@/components/roadmap/EmptyListItemPlaceholder';
import { TranslatedText } from '@/components/TranslatedText';
import { AppCheckbox, AppText, AppView } from '@/components/ui';
import { StepType } from '@/hooks/roadmap/types/roadmap.types';
import { useAppSelector } from '@/store/hooks/store.hooks';
import {
  addStepAction,
  selectSelectedTask,
} from '@/store/slices/roadmapDraftSlice';
import { LegendListRenderItemProps } from '@legendapp/list';
import React from 'react';
import { useDispatch } from 'react-redux';

const StepsList = () => {
  const task = useAppSelector(selectSelectedTask);
  const dispatch = useDispatch();

  const onAddNewStepPress = () => {
    dispatch(
      addStepAction({
        Description: Math.random().toString(),
      }),
    );
  };

  const renderItem = ({ item: task }: LegendListRenderItemProps<StepType>) => (
    <AppView row padding-16 gap-16 center>
      <AppCheckbox
        bg-primary
        borderRadius={4}
        containerStyle={{ borderWidth: 0 }}
        value={task.Completed}
      />
      <AppText flex textColor body2>
        {task.Description}
      </AppText>
    </AppView>
  );

  const renderEmptyItem = () => {
    return (
      <EmptyListItemPlaceholder
        title="tabs.create_tab.no_steps_yet"
        subtitle="tabs.create_tab.add_new_step_desc"
        btnText="tabs.create_tab.add_new_step"
        onPress={onAddNewStepPress}
      />
    );
  };

  return (
    <>
      <TranslatedText body1 translationKey="common.steps" />
      <Divider marginV-8 />
      <AppCard padding-0>
        <AppList
          data={task?.Steps || []}
          renderItem={renderItem}
          ListEmptyComponent={renderEmptyItem}
          ItemSeparatorComponent={() => <LineDivider marginV-0 />}
          scrollEnabled={false}
        />
      </AppCard>
    </>
  );
};

export default StepsList;

import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppList } from '@/components/AppList';
import { Divider } from '@/components/Divider';
import { LineDivider } from '@/components/LineDivider';
import { ListAddItemIcon } from '@/components/ListAddItemIcon';
import { EmptyListItemPlaceholder } from '@/components/roadmap/EmptyListItemPlaceholder';
import { StepItem } from '@/components/roadmap/StepItem';
import { TranslatedText } from '@/components/TranslatedText';
import { AppView } from '@/components/ui';
import {
  FormEditModeType,
  StepType,
} from '@/hooks/roadmap/types/roadmap.types';
import { useAppSelector } from '@/store/hooks/store.hooks';
import {
  selectSelectedTask,
  setSelectedStepAction,
} from '@/store/slices/roadmapDraftSlice';
import { LegendListRenderItemProps } from '@legendapp/list';
import { router } from 'expo-router';
import React from 'react';
import { useDispatch } from 'react-redux';

interface StepsListProps {
  mode?: FormEditModeType;
}

export const StepsList = ({ mode = 'edit' }: StepsListProps) => {
  const task = useAppSelector(selectSelectedTask);
  const dispatch = useDispatch();

  const onAddNewStepPress = () => {
    router.navigate({
      pathname: '/task/add-edit-step',
    });
  };

  const onStepPress = (step: StepType, index?: number) => {
    dispatch(setSelectedStepAction({ step, index }));
    router.navigate({
      pathname: '/task/add-edit-step',
      params: {
        mode: 'edit',
      },
    });
  };

  const renderItem = ({
    item: step,
    index,
  }: LegendListRenderItemProps<StepType>) => (
    <StepItem
      step={step}
      index={index}
      onStepPress={(step) => onStepPress(step, index)}
      mode={mode}
    />
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

  const renderFooterComponent = () => {
    if (task?.steps?.length === 0 || mode === 'view') return;
    return (
      <AppButton onPress={onAddNewStepPress}>
        <LineDivider marginV-0 />
        <AppView row padding-16 centerV gap-16>
          <ListAddItemIcon />
          <TranslatedText body2 translationKey="tabs.create_tab.add_new_step" />
        </AppView>
      </AppButton>
    );
  };

  return (
    <>
      <TranslatedText body1 translationKey="common.steps" />
      <Divider marginV-8 />
      <AppCard padding-0>
        <AppList
          data={task?.steps || []}
          keyExtractor={(s) => s.step_id}
          renderItem={renderItem}
          ListEmptyComponent={renderEmptyItem}
          ListFooterComponent={renderFooterComponent}
          ItemSeparatorComponent={() => <LineDivider marginV-0 />}
          scrollEnabled={false}
        />
      </AppCard>
    </>
  );
};

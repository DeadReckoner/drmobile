import {
  ActionSheetOption,
  AppActionSheetModal,
} from '@/components/AppActionSheetModal';
import { AppCard } from '@/components/AppCard';
import { AppText, AppView } from '@/components/ui';
import { useHabitMenuOptions } from '@/hooks/useHabitMenuOptions';
import { useLocalization } from '@/hooks/useLocalization';
import { HabitType } from '@/store/apis/types/habitsApi.types';
import React, { useState } from 'react';

interface ArchivedHabitItemProps {
  habit: HabitType;
}

export const ArchivedHabitItem = ({ habit }: ArchivedHabitItemProps) => {
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const { t } = useLocalization();
  const { menuOptions, menuDialogs } = useHabitMenuOptions({
    habit,
    onMenuClose: () => setIsMenuVisible(false),
  });

  return (
    <>
      <AppCard row centerV padding-0 onPress={() => setIsMenuVisible(true)}>
        <AppView flex-1 padding-16>
          <AppView row centerV spread>
            <AppText body2 textColor>
              {habit.title}
            </AppText>
            <AppView bg-primary paddingH-8 paddingV-4 br100>
              <AppText white sm regular>
                {habit.recurrence_type === 'none'
                  ? t('habits.recurrence.none')
                  : habit.recurrence_type}
              </AppText>
            </AppView>
          </AppView>
          {habit.description && (
            <AppText xsm textColor marginT-4>
              {habit.description}
            </AppText>
          )}
        </AppView>
      </AppCard>
      <AppActionSheetModal
        title={t('habits.archived_habits')}
        visible={isMenuVisible}
        onDismiss={() => setIsMenuVisible(false)}
        options={menuOptions as ActionSheetOption[]}
      />
      {menuDialogs}
    </>
  );
};

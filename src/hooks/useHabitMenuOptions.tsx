import { ActionSheetOption } from '@/components/AppActionSheetModal';
import { AppIcon } from '@/components/AppIcon';
import { ConfirmationDialog } from '@/components/ConfirmationDialog';
import { Loader } from '@/components/Loader';
import { AppView } from '@/components/ui';
import { useLocalization } from '@/hooks/useLocalization';
import { useToast } from '@/hooks/useToast';
import { TranslationKeysType } from '@/lib/localization/types/i18n.types';
import { useDeleteHabitMutation } from '@/store/apis/habitsApi';
import { HabitType } from '@/store/apis/types/habitsApi.types';
import { getApiErrorMessage } from '@/utils/apiErrors.utils';
import React, { JSX, useCallback, useMemo, useState } from 'react';
import { Colors } from 'react-native-ui-lib';

interface ConfirmationDialogConfig {
  title: TranslationKeysType;
  subtitle: TranslationKeysType;
  positiveText: TranslationKeysType;
  negativeText: TranslationKeysType;
  positiveButtonIcon?: JSX.Element;
  onPositivePress: () => void;
}

interface UseHabitMenuOptionsParams {
  habit: HabitType;
  onMenuClose: () => void;
}

interface UseHabitMenuOptionsReturn {
  menuOptions: ActionSheetOption[];
  menuDialogs: React.ReactNode;
}

export const useHabitMenuOptions = ({
  habit,
  onMenuClose,
}: UseHabitMenuOptionsParams): UseHabitMenuOptionsReturn => {
  const { t } = useLocalization();
  const { showToast } = useToast();

  const [deleteHabit, { isLoading: isDeletingHabit }] =
    useDeleteHabitMutation();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogConfig, setDialogConfig] = useState<ConfirmationDialogConfig>({
    title: 'common.are_you_sure',
    subtitle: 'habits.delete_habit',
    positiveText: 'common.remove',
    negativeText: 'common.cancel',
    onPositivePress: () => {},
  });

  const isLoading = isDeletingHabit;

  const closeDialog = useCallback(() => setIsDialogOpen(false), []);

  const closeMenuThen = useCallback(
    (action: () => void, delay = 400) => {
      onMenuClose();
      setTimeout(action, delay);
    },
    [onMenuClose],
  );

  const handleDelete = useCallback(async () => {
    try {
      await deleteHabit(habit.habit_id).unwrap();
      showToast({ type: 'success', message: t('habits.deleted_successfully') });
    } catch (error) {
      showToast({ type: 'failure', message: getApiErrorMessage(error) });
    } finally {
      closeDialog();
    }
  }, [closeDialog, deleteHabit, habit.habit_id, showToast, t]);

  const openDeleteDialog = useCallback(
    () =>
      closeMenuThen(() => {
        setDialogConfig({
          title: 'common.are_you_sure',
          subtitle: 'habits.delete_habit_confirmation',
          positiveText: 'common.remove',
          negativeText: 'common.cancel',
          positiveButtonIcon: (
            <AppIcon name="delete" color={Colors.textOnPrimary} size={14} />
          ),
          onPositivePress: handleDelete,
        });
        setIsDialogOpen(true);
      }),
    [closeMenuThen, handleDelete],
  );

  const menuOptions = useMemo<ActionSheetOption[]>(
    () => [
      {
        label: t('habits.delete_habit_label'),
        onPress: openDeleteDialog,
        icon: <AppIcon name="delete" color={Colors.error} size={20} />,
      },
    ],
    [openDeleteDialog, t],
  );

  const menuDialogs = (
    <ConfirmationDialog
      isDialogOpen={isDialogOpen}
      title={dialogConfig.title}
      subtitle={dialogConfig.subtitle}
      positiveText={dialogConfig.positiveText}
      negativeText={dialogConfig.negativeText}
      positiveButtonIcon={
        isLoading ? (
          <AppView>
            <Loader transparent containerStyle={{ position: 'relative' }} />
          </AppView>
        ) : (
          dialogConfig.positiveButtonIcon
        )
      }
      onPositivePress={dialogConfig.onPositivePress}
      onNegativePress={closeDialog}
      onDismiss={closeDialog}
    />
  );

  return { menuOptions, menuDialogs };
};

import { ActionSheetOption } from '@/components/AppActionSheetModal';
import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppDialog } from '@/components/AppDialog';
import { AppIcon } from '@/components/AppIcon';
import { ConfirmationDialog } from '@/components/ConfirmationDialog';
import { Divider } from '@/components/Divider';
import { Loader } from '@/components/Loader';
import { TranslatedText } from '@/components/TranslatedText';
import { AppView } from '@/components/ui';
import {
  useArchiveRoadmapMutation,
  useDeleteRoadmapMutation,
  useRestoreRoadmapMutation,
} from '@/hooks/roadmap';
import { RoadmapType } from '@/hooks/roadmap/types/roadmap.types';
import { useLocalization } from '@/hooks/useLocalization';
import { useToast } from '@/hooks/useToast';
import { TranslationKeysType } from '@/lib/localization/types/i18n.types';
import { useAppDispatch } from '@/store/hooks/store.hooks';
import {
  resetDraftAction,
  setDraftRoadmapAction,
} from '@/store/slices/roadmapDraftSlice';
import { getApiErrorMessage } from '@/utils/apiErrors.utils';
import { router } from 'expo-router';
import React, { JSX, useCallback, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

interface ConfirmationDialogConfig {
  title: TranslationKeysType;
  subtitle: TranslationKeysType;
  positiveText: TranslationKeysType;
  negativeText: TranslationKeysType;
  positiveButtonIcon?: JSX.Element;
  onPositivePress: () => void;
}

interface UseRoadmapMenuOptionsParams {
  roadmap: RoadmapType;
  onMenuClose: () => void;
}

interface UseRoadmapMenuOptionsReturn {
  menuOptions: ActionSheetOption[];
  menuDialogs: React.ReactNode;
}

export const useRoadmapMenuOptions = ({
  roadmap,
  onMenuClose,
}: UseRoadmapMenuOptionsParams): UseRoadmapMenuOptionsReturn => {
  const { t } = useLocalization();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();

  const [deleteRoadmap, { isLoading: isDeletingRoadmap }] =
    useDeleteRoadmapMutation();
  const [archiveRoadmap, { isLoading: isArchivingRoadmap }] =
    useArchiveRoadmapMutation();
  const [restoreRoadmap, { isLoading: isRestoringRoadmap }] =
    useRestoreRoadmapMutation();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeRestoreButton, setActiveRestoreButton] = useState('');
  const [dialogConfig, setDialogConfig] = useState<ConfirmationDialogConfig>({
    title: 'common.are_you_sure',
    subtitle: 'common.delete_roadmap',
    positiveText: 'common.remove',
    negativeText: 'common.cancel',
    onPositivePress: () => {},
  });
  const [isRestoreSheetVisible, setIsRestoreSheetVisible] = useState(false);

  const isLoading =
    isDeletingRoadmap || isArchivingRoadmap || isRestoringRoadmap;

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
      await deleteRoadmap(roadmap.roadmap_id).unwrap();
      dispatch(resetDraftAction());
      showToast({ type: 'success', message: t('common.deleted_successfully') });
      router.replace('/progress');
    } catch (error) {
      showToast({ type: 'failure', message: getApiErrorMessage(error) });
    } finally {
      closeDialog();
    }
  }, [closeDialog, deleteRoadmap, dispatch, roadmap.roadmap_id, showToast, t]);

  const handleArchive = useCallback(async () => {
    try {
      await archiveRoadmap(roadmap.roadmap_id).unwrap();
      dispatch(resetDraftAction());
      router.replace('/progress');
      showToast({ type: 'success', message: t('roadmap.archive.success') });
    } catch (error) {
      showToast({ type: 'failure', message: getApiErrorMessage(error) });
    } finally {
      closeDialog();
    }
  }, [archiveRoadmap, closeDialog, dispatch, roadmap.roadmap_id, showToast, t]);

  const handleRestore = useCallback(
    async (start_from_today: boolean) => {
      try {
        const restored = await restoreRoadmap({
          roadmap_id: roadmap.roadmap_id,
          start_from_today,
        }).unwrap();
        dispatch(setDraftRoadmapAction(restored));
        showToast({ type: 'success', message: t('roadmap.restore.success') });
        router.replace('/roadmap/roadmap-execution');
      } catch (error) {
        showToast({ type: 'failure', message: getApiErrorMessage(error) });
      } finally {
        setIsRestoreSheetVisible(false);
        setActiveRestoreButton('');
      }
    },
    [dispatch, restoreRoadmap, roadmap.roadmap_id, showToast, t],
  );

  const openDeleteDialog = useCallback(
    () =>
      closeMenuThen(() => {
        setDialogConfig({
          title: 'common.are_you_sure',
          subtitle: 'common.delete_roadmap',
          positiveText: 'common.remove',
          negativeText: 'common.cancel',
          positiveButtonIcon: (
            <AppIcon name="delete" color={Colors.textOnPrimary} size={18} />
          ),
          onPositivePress: handleDelete,
        });
        setIsDialogOpen(true);
      }),
    [closeMenuThen, handleDelete],
  );

  const openArchiveDialog = useCallback(
    () =>
      closeMenuThen(() => {
        setDialogConfig({
          title: 'roadmap.archive.confirm_title',
          subtitle: 'roadmap.archive.confirm_message',
          positiveText: 'roadmap.archive.confirm_button',
          negativeText: 'common.cancel',
          positiveButtonIcon: (
            <AppIcon
              set="MaterialCommunityIcons"
              name="archive-outline"
              color={Colors.textOnPrimary}
              size={18}
            />
          ),
          onPositivePress: handleArchive,
        });
        setIsDialogOpen(true);
      }),
    [closeMenuThen, handleArchive],
  );

  const menuOptions = useMemo<ActionSheetOption[]>(
    () => [
      ...(roadmap.archived
        ? [
            {
              label: t('roadmap.restore.label'),
              onPress: () =>
                closeMenuThen(() => setIsRestoreSheetVisible(true)),
              icon: (
                <AppIcon
                  set="MaterialCommunityIcons"
                  name="restore"
                  color={Colors.textColor}
                  size={20}
                />
              ),
            } satisfies ActionSheetOption,
          ]
        : [
            {
              label: t('roadmap.archive.label'),
              onPress: openArchiveDialog,
              icon: (
                <AppIcon
                  set="MaterialCommunityIcons"
                  name="archive-outline"
                  color={Colors.textColor}
                  size={20}
                />
              ),
            } satisfies ActionSheetOption,
          ]),
      {
        label: t('roadmap.delete_roadmap_label'),
        onPress: openDeleteDialog,
        icon: <AppIcon name="delete" color={Colors.error} size={20} />,
      },
    ],
    [closeMenuThen, openArchiveDialog, openDeleteDialog, roadmap.archived, t],
  );

  const menuDialogs = (
    <>
      <ConfirmationDialog
        disabled={isLoading}
        isDialogOpen={isDialogOpen}
        title={dialogConfig.title}
        subtitle={dialogConfig.subtitle}
        positiveText={dialogConfig.positiveText}
        negativeText={dialogConfig.negativeText}
        positiveButtonIcon={
          isLoading ? (
            <Loader
              size={20}
              transparent
              containerStyle={{ position: 'relative' }}
            />
          ) : (
            dialogConfig.positiveButtonIcon
          )
        }
        onPositivePress={dialogConfig.onPositivePress}
        onNegativePress={closeDialog}
        onDismiss={closeDialog}
      />
      <AppDialog
        visible={isRestoreSheetVisible}
        onDismiss={() => setIsRestoreSheetVisible(false)}>
        <AppCard padding-20 bg-cardBG>
          <TranslatedText
            subtitle2
            textColor
            translationKey="roadmap.restore.label"
          />
          <TranslatedText
            xsm
            textColor
            marginT-4
            translationKey="roadmap.restore.description"
          />
          <Divider margin-12 />
          <AppView gap-8>
            <AppButton
              disabled={isLoading}
              br20
              center
              style={styles.btnContinue}
              padding-12
              onPress={() => {
                setActiveRestoreButton('continue');
                handleRestore(false);
              }}>
              {isLoading && activeRestoreButton === 'continue' ? (
                <AppView>
                  <Loader
                    transparent
                    containerStyle={{ position: 'relative' }}
                  />
                </AppView>
              ) : (
                <AppView row center gap-8>
                  <AppIcon
                    set="MaterialCommunityIcons"
                    name="play-circle-outline"
                    color={Colors.textColor}
                    size={24}
                  />
                  <TranslatedText
                    body2
                    textColor
                    translationKey="roadmap.restore.continue_label"
                  />
                </AppView>
              )}
            </AppButton>
            <AppButton
              disabled={isLoading}
              bg-accent
              br20
              center
              style={[styles.btnContinue, { borderColor: Colors.accent }]}
              padding-12
              onPress={() => {
                setActiveRestoreButton('restart');
                handleRestore(true);
              }}>
              {isLoading && activeRestoreButton === 'restart' ? (
                <AppView>
                  <Loader
                    transparent
                    containerStyle={{ position: 'relative' }}
                  />
                </AppView>
              ) : (
                <AppView row center gap-8>
                  <AppIcon
                    set="MaterialCommunityIcons"
                    name="restart"
                    color={Colors.textColor}
                    size={24}
                  />
                  <TranslatedText
                    body2
                    textColor
                    translationKey="roadmap.restore.restart_label"
                  />
                </AppView>
              )}
            </AppButton>
          </AppView>
        </AppCard>
      </AppDialog>
    </>
  );

  return { menuOptions, menuDialogs };
};

const styles = StyleSheet.create({
  btnContinue: {
    width: '100%',
    borderWidth: 0.5,
    borderColor: Colors.accent,
  },
});

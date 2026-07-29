import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppIcon } from '@/components/AppIcon';
import { AppKeyboardController } from '@/components/AppKeyboardController';
import { Divider } from '@/components/Divider';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { PrimaryButton } from '@/components/PrimaryButton';
import { PlanImportLoader } from '@/components/roadmap/ai-roamap/PlanImportLoader';
import { TranslatedText } from '@/components/TranslatedText';
import { TranslatedTextInput } from '@/components/TranslatedTextInput';
import { AppText, AppView } from '@/components/ui';
import { useImportPlanMutation } from '@/hooks/roadmap';
import { ImportPlanContextType } from '@/hooks/roadmap/types/roadmap.types';
import { useLocalization } from '@/hooks/useLocalization';
import { roadmapApi } from '@/store/apis/roadmapApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks/store.hooks';
import { resetCreationStateAction } from '@/store/slices/aiRoadmapCreationSlice';
import {
  clearSelectedFileAction,
  selectIsPlanImporting,
  selectPlanImportContext,
  selectPlanImportCreatedRoadmap,
  selectPlanImportFile,
  selectPlanImportState,
  selectPlanImportStatus,
  setImportErrorAction,
  setJobResponseAction,
  setSelectedFileAction,
  startUploadAction,
  updateContextAction,
} from '@/store/slices/planImportSlice';
import { setDraftRoadmapAction } from '@/store/slices/roadmapDraftSlice';
import { Animations } from '@/utils/animation.utils';
import { getApiErrorMessage } from '@/utils/apiErrors.utils';
import * as DocumentPicker from 'expo-document-picker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const CONTEXT_FIELDS: {
  key: keyof ImportPlanContextType;
  labelKey: string;
  placeholderKey: string;
}[] = [
  {
    key: 'goalName',
    labelKey: 'plan_import.context_fields.goal_name',
    placeholderKey: 'plan_import.context_fields.goal_name_placeholder',
  },
  {
    key: 'targetCompletionDate',
    labelKey: 'plan_import.context_fields.target_date',
    placeholderKey: 'plan_import.context_fields.target_date_placeholder',
  },
  {
    key: 'weeklyTimeCommitment',
    labelKey: 'plan_import.context_fields.weekly_commitment',
    placeholderKey: 'plan_import.context_fields.weekly_commitment_placeholder',
  },
  {
    key: 'workFrequency',
    labelKey: 'plan_import.context_fields.work_frequency',
    placeholderKey: 'plan_import.context_fields.work_frequency_placeholder',
  },
  {
    key: 'currentSkillLevel',
    labelKey: 'plan_import.context_fields.skill_level',
    placeholderKey: 'plan_import.context_fields.skill_level_placeholder',
  },
  {
    key: 'constraints',
    labelKey: 'plan_import.context_fields.constraints',
    placeholderKey: 'plan_import.context_fields.constraints_placeholder',
  },
  {
    key: 'additionalContext',
    labelKey: 'plan_import.context_fields.additional_context',
    placeholderKey: 'plan_import.context_fields.additional_context_placeholder',
  },
];

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const ImportPlan = () => {
  const dispatch = useAppDispatch();
  const { t } = useLocalization();
  const [importPlan] = useImportPlanMutation();

  const status = useAppSelector(selectPlanImportStatus);
  const selectedFile = useAppSelector(selectPlanImportFile);
  const context = useAppSelector(selectPlanImportContext);
  const isImporting = useAppSelector(selectIsPlanImporting);
  const createdRoadmap = useAppSelector(selectPlanImportCreatedRoadmap);

  const { error } = useAppSelector(selectPlanImportState);
  const [isContextExpanded, setIsContextExpanded] = useState(false);

  const handlePickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets?.length) return;

    const asset = result.assets[0];

    if (asset.size && asset.size > MAX_FILE_SIZE) {
      dispatch(setImportErrorAction(t('plan_import.file_too_large')));
      return;
    }

    dispatch(
      setSelectedFileAction({
        uri: asset.uri,
        name: asset.name,
        size: asset.size || 0,
      }),
    );
  };

  const handleStartImport = async () => {
    if (!selectedFile) return;

    dispatch(startUploadAction());

    try {
      const hasContext = Object.values(context).some(
        (v) => v && v.trim().length > 0,
      );
      const response = await importPlan({
        fileUri: selectedFile.uri,
        fileName: selectedFile.name,
        mimeType: 'application/pdf',
        context: hasContext ? context : undefined,
      }).unwrap();

      dispatch(setJobResponseAction(response));

      if (response?.status === 'failed') {
        dispatch(setImportErrorAction(t('common.something_went_wrong')));
      }
    } catch (error: unknown) {
      dispatch(
        setImportErrorAction(
          getApiErrorMessage(error) || t('common.something_went_wrong'),
        ),
      );
    }
  };

  const handleRetry = () => {
    handleStartImport();
  };

  const handleNavigateToRoadmap = () => {
    if (createdRoadmap) {
      dispatch(
        roadmapApi.endpoints.getRoadmaps.initiate(undefined, {
          forceRefetch: true,
        }),
      );
      dispatch(setDraftRoadmapAction(createdRoadmap));
      dispatch(resetCreationStateAction());
      router.replace('/roadmap/roadmap-execution');
    }
  };

  const handleContextChange = (
    key: keyof ImportPlanContextType,
    value: string,
  ) => {
    dispatch(updateContextAction({ key, value }));
  };

  return (
    <AppKeyboardController
      scrollViewProps={{
        bottomOffset: 100,
      }}>
      {isImporting && <PlanImportLoader />}
      <AppView paddingH-0>
        <HeaderWithBack headerKey="plan_import.title" />
      </AppView>
      <Divider />

      <AppView paddingH-0 gap-16>
        <AppCard onPress={handlePickDocument} disabled={isImporting}>
          {selectedFile ? (
            <AppView row centerV spread>
              <AppView row centerV gap-12 flex-1>
                <AppView
                  bg-accent
                  br100
                  center
                  style={styles.fileIconContainer}>
                  <AppIcon
                    set="Ionicons"
                    name="document-text"
                    size={20}
                    color={Colors.white}
                  />
                </AppView>
                <AppView flex-1>
                  <AppText textColor body2 numberOfLines={1}>
                    {selectedFile.name}
                  </AppText>
                  <AppText textColor xsm textSecondary>
                    {formatFileSize(selectedFile.size)}
                  </AppText>
                </AppView>
              </AppView>
              <AppButton
                onPress={() => dispatch(clearSelectedFileAction())}
                disabled={isImporting}>
                <AppIcon
                  set="Feather"
                  name="x"
                  size={20}
                  color={Colors.error}
                />
              </AppButton>
            </AppView>
          ) : (
            <AppView center paddingV-24 gap-12>
              <AppView
                bg-accent
                br100
                center
                style={styles.uploadIconContainer}>
                <AppIcon
                  set="Feather"
                  name="upload"
                  size={24}
                  color={Colors.white}
                />
              </AppView>
              <TranslatedText body1 translationKey="plan_import.select_file" />
              <TranslatedText
                xsm
                textSecondary
                center
                translationKey="plan_import.select_file_desc"
              />
            </AppView>
          )}
        </AppCard>

        <AppCard>
          <AppButton onPress={() => setIsContextExpanded(!isContextExpanded)}>
            <AppView row centerV spread>
              <AppView flex-1>
                <TranslatedText
                  body1
                  translationKey="plan_import.add_context"
                />
                <TranslatedText
                  xsm
                  textSecondary
                  marginT-4
                  translationKey="plan_import.add_context_desc"
                />
              </AppView>
              <AppIcon
                set="Feather"
                name={isContextExpanded ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={Colors.textSecondary}
              />
            </AppView>
          </AppButton>

          {isContextExpanded && (
            <AppView
              marginT-16
              reanimated
              entering={Animations.Entry.FadeInDown()}
              exiting={Animations.Exit.FadeOutDown()}>
              {CONTEXT_FIELDS.map((field) => (
                <TranslatedTextInput
                  key={field.key}
                  labelKey={field.labelKey as any}
                  placeholderKey={field.placeholderKey as any}
                  value={context[field.key] || ''}
                  onChangeText={(value: string) =>
                    handleContextChange(field.key, value)
                  }
                  editable={!isImporting}
                />
              ))}
            </AppView>
          )}
        </AppCard>

        {/* Error State */}
        {status === 'error' && (
          <AppView
            reanimated
            entering={Animations.Entry.FadeInDownWithSpring()}
            exiting={Animations.Exit.FadeOutDown()}>
            <AppButton
              onPress={handleRetry}
              backgroundColor={Colors.error}
              paddingH-20
              paddingV-12
              br40
              row
              centerV
              gap-8>
              <AppIcon
                set="Feather"
                name="refresh-cw"
                size={16}
                color={Colors.white}
              />
              <Divider />
              <AppView flex>
                <AppText body2 light lightregular textColor>
                  {error}
                </AppText>
                <TranslatedText
                  body2
                  light
                  translationKey="ai_roadmap.retry_creation"
                  color={Colors.white}
                />
              </AppView>
            </AppButton>
          </AppView>
        )}

        {/* Completed State */}
        {status === 'completed' && createdRoadmap && (
          <AppView
            reanimated
            entering={Animations.Entry.FadeInDownWithSpring()}
            exiting={Animations.Exit.FadeOutDown()}>
            <AppButton onPress={handleNavigateToRoadmap}>
              <AppView row gap-8 center bg-success br100 padding-12 paddingH-24>
                <TranslatedText
                  body2
                  translationKey="plan_import.view_roadmap"
                />
                <AppIcon
                  set="Ionicons"
                  name="arrow-forward-circle-outline"
                  size={24}
                  color={Colors.white}
                />
              </AppView>
            </AppButton>
          </AppView>
        )}
      </AppView>
      <Divider />

      {status !== 'completed' && (
        <AppView paddingB-32>
          <PrimaryButton
            label="plan_import.start_import"
            onPress={handleStartImport}
            disabled={!selectedFile || isImporting}
            isLoading={isImporting}
            shouldShowLoader
          />
        </AppView>
      )}
      <Divider margin-60 />
    </AppKeyboardController>
  );
};

export default ImportPlan;

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  fileIconContainer: {
    width: 40,
    height: 40,
  },
  uploadIconContainer: {
    width: 56,
    height: 56,
  },
});

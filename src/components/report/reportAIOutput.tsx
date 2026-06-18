import { ActionSheetOption } from '@/components/AppActionSheetModal';
import { AppIcon } from '@/components/AppIcon';
import { TranslationKeysType } from '@/lib/localization/types/i18n.types';
import { router } from 'expo-router';
import React from 'react';
import { Colors } from 'react-native-ui-lib';

/**
 * Conventional `output_type` values from the reporting backend, so AI reports
 * group cleanly. See REPORTING_AND_BLOCKING.md.
 */
export type AIOutputType =
  | 'roadmap'
  | 'milestone'
  | 'task'
  | 'habit_suggestion'
  | 'roadmap_revision'
  | 'accountability_message'
  | 'other';

export interface ReportAIOutputArgs {
  /** Which AI surface is being reported. */
  outputType: AIOutputType;
  /** Stable id of the persisted AI output, when one exists. */
  outputId?: string;
  /** Goal/roadmap the output belongs to, if applicable. */
  roadmapId?: string;
  /** Generation job reference, if applicable. */
  jobId?: string;
  /**
   * Snapshot of exactly what the user is looking at. Required when there is no
   * stable `outputId` (e.g. an unsaved preview / suggestion / message).
   */
  contextText?: string;
  /** Optional label for where the snapshot was taken from. */
  contextSurface?: string;
}

/** Navigate to the shared AI report screen for any AI surface. */
export const navigateToReportAIOutput = (args: ReportAIOutputArgs) => {
  router.navigate({
    pathname: '/roadmap/report-ai-output',
    params: {
      outputType: args.outputType,
      outputId: args.outputId,
      roadmapId: args.roadmapId,
      jobId: args.jobId,
      contextText: args.contextText,
      contextSurface: args.contextSurface,
    },
  });
};

/**
 * Build a "Report AI output" action sheet option that can be added to any AI
 * surface's overflow menu.
 */
export const getReportAIOutputMenuOption = (
  t: (_key: TranslationKeysType) => string,
  args: ReportAIOutputArgs,
  onPress?: () => void,
): ActionSheetOption => ({
  label: t('roadmap.report_ai_output.label'),
  onPress: () => {
    onPress?.();
    navigateToReportAIOutput(args);
  },
  icon: (
    <AppIcon
      set="MaterialCommunityIcons"
      name="flag-outline"
      color={Colors.textColor}
      size={20}
    />
  ),
});

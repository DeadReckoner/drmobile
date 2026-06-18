import { AppButton } from '@/components/AppButton';
import { AppIcon } from '@/components/AppIcon';
import { TranslatedText } from '@/components/TranslatedText';
import { AppView } from '@/components/ui';
import React from 'react';
import { Colors } from 'react-native-ui-lib';
import { navigateToReportAIOutput, ReportAIOutputArgs } from './reportAIOutput';

interface ReportAIOutputButtonProps extends ReportAIOutputArgs {
  /** Show a label next to the flag icon. Defaults to icon-only. */
  showLabel?: boolean;
  size?: number;
}

/**
 * Reusable inline "Report" affordance for any AI surface (task/habit
 * suggestions, roadmap revisions, accountability messages, etc.). Drop it next
 * to the AI output and pass the relevant `outputType` + a `contextText`
 * snapshot when the output isn't persisted.
 */
export const ReportAIOutputButton = ({
  showLabel = false,
  size = 18,
  ...args
}: ReportAIOutputButtonProps) => {
  return (
    <AppButton onPress={() => navigateToReportAIOutput(args)}>
      <AppView row centerV gap-4>
        <AppIcon
          set="MaterialCommunityIcons"
          name="flag-outline"
          color={Colors.secondary}
          size={size}
        />
        {showLabel && (
          <TranslatedText
            xsm
            secondary
            translationKey="roadmap.report_ai_output.label"
          />
        )}
      </AppView>
    </AppButton>
  );
};

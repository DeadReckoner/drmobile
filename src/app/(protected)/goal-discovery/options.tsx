import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppIcon } from '@/components/AppIcon';
import { AppScreen } from '@/components/AppScreen';
import { ConfirmationDialog } from '@/components/ConfirmationDialog';
import { Divider } from '@/components/Divider';
import {
  GoalDiscoveryFailure,
  GoalDiscoveryPending,
} from '@/components/goal-discovery/GoalDiscoveryPending';
import { GoalOptionCard } from '@/components/goal-discovery/GoalOptionCard';
import { RegenerateDialog } from '@/components/goal-discovery/RegenerateDialog';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { TranslatedText } from '@/components/TranslatedText';
import { AppText, AppView } from '@/components/ui';
import { useCreateGoalOptionsMutation } from '@/hooks/goalDiscovery';
import { GoalOption } from '@/hooks/goalDiscovery/goalDiscovery.types';
import { prefillStage2, reselectOption } from '@/hooks/goalDiscovery/stage2';
import { useGoalOptionsJob } from '@/hooks/goalDiscovery/useGoalOptionsJob';
import { useToast } from '@/hooks/useToast';
import { useAppDispatch, useAppSelector } from '@/store/hooks/store.hooks';
import {
  clearRegenerationFailureAction,
  resetGoalDiscoveryAction,
  selectGoalDiscoveryDraft,
  selectGoalOptionAction,
  startGoalOptionsJobAction,
} from '@/store/slices/goalDiscoverySlice';
import { getApiErrorMessage } from '@/utils/apiErrors.utils';
import { nanoid } from '@reduxjs/toolkit';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { ScrollView } from 'react-native';
import { Colors } from 'react-native-ui-lib';

/**
 * The three generated goal options.
 *
 * Regeneration is a SET-level action ("Show me different options") because it
 * replaces all three. Choosing is a per-card action. While a replacement is
 * generating, the current three stay on screen and are only swapped once a valid
 * new set arrives — a failed regeneration leaves the user exactly where they were.
 */
const GoalDiscoveryOptions = () => {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const draft = useAppSelector(selectGoalDiscoveryDraft);

  const { isPolling, hasPollingError } = useGoalOptionsJob();
  const [createGoalOptions, { isLoading: isRegenerating }] =
    useCreateGoalOptionsMutation();

  const [isRegenerateOpen, setIsRegenerateOpen] = useState(false);
  const [isStartOverOpen, setIsStartOverOpen] = useState(false);
  const [pendingOption, setPendingOption] = useState<GoalOption | null>(null);
  const isStartingRegeneration = useRef(false);

  const hasOptions = draft.options.length > 0;
  const isReplacing = Boolean(draft.regenerationJobId);
  const isFirstRun = !hasOptions && !draft.safetyMessage;

  /**
   * Start a generation from the saved stage-1 answers.
   *
   * Doubles as the retry after a first-run failure. The distinction matters: a
   * REPLACEMENT is tracked separately so the three options already on screen
   * survive until it succeeds, whereas a retry with nothing on screen is just
   * the first run again and should show the pending state.
   */
  const startGeneration = async () => {
    if (isStartingRegeneration.current || isRegenerating || isReplacing) return;
    if (!draft.submittedAnswers) return;

    const isReplacement = hasOptions;
    isStartingRegeneration.current = true;
    setIsRegenerateOpen(false);
    const idempotencyKey = nanoid();

    try {
      const response = await createGoalOptions({
        answers: draft.submittedAnswers,
        // Only a genuine replacement carries exclusions. The server reads the
        // rejected titles from this job's stored result, so the new set is
        // materially different rather than a reshuffle.
        previousJobId: isReplacement
          ? (draft.optionsJobId ?? undefined)
          : undefined,
        idempotencyKey,
      }).unwrap();

      dispatch(
        startGoalOptionsJobAction({
          jobId: response.job_id,
          answers: draft.submittedAnswers,
          idempotencyKey,
          regeneration: isReplacement,
        }),
      );
    } catch (error) {
      showToast({ type: 'failure', message: getApiErrorMessage(error) });
    } finally {
      isStartingRegeneration.current = false;
    }
  };

  const goToStage2 = (option: GoalOption) => {
    if (!draft.submittedAnswers) return;

    const stage2 = draft.stage2
      ? reselectOption(draft.stage2, option, draft.submittedAnswers)
      : prefillStage2(option, draft.submittedAnswers);

    dispatch(selectGoalOptionAction({ optionId: option.id, stage2 }));
    router.push('/goal-discovery/roadmap-details');
  };

  const onChoose = (option: GoalOption) => {
    // Switching goals after stage 2 has been started replaces the fields derived
    // from the old option, so confirm before discarding them.
    const isSwitch =
      Boolean(draft.selectedOptionId) && draft.selectedOptionId !== option.id;
    if (isSwitch) {
      setPendingOption(option);
      return;
    }
    goToStage2(option);
  };

  const renderBody = () => {
    if (draft.safetyMessage) {
      return (
        <AppCard paddingV-20 disabled testID="goal-discovery-safety">
          <AppView row centerV gap-8>
            <AppIcon
              set="Ionicons"
              name="alert-circle-outline"
              size={20}
              color={Colors.warning}
            />
            <TranslatedText
              body2
              translationKey="goal_discovery.safety.title"
            />
          </AppView>
          <AppText xsm marginT-8 textColor>
            {draft.safetyMessage}
          </AppText>
        </AppCard>
      );
    }

    if (isFirstRun && draft.optionsJobStatus === 'failed') {
      return (
        <GoalDiscoveryFailure
          titleKey="goal_discovery.pending.failed_title"
          bodyKey="goal_discovery.pending.failed_body"
          retryKey="goal_discovery.pending.retry"
          onRetry={startGeneration}
          secondaryKey="goal_discovery.pending.edit_answers"
          onSecondary={() => router.replace('/goal-discovery')}
        />
      );
    }

    if (isFirstRun) {
      return (
        <GoalDiscoveryPending
          titleKey="goal_discovery.pending.options_title"
          bodyKey="goal_discovery.pending.options_body"
          hintKey="goal_discovery.pending.options_leave_hint"
        />
      );
    }

    return (
      <>
        {isReplacing && (
          <AppView marginB-16>
            <GoalDiscoveryPending
              titleKey="goal_discovery.pending.options_title"
              bodyKey="goal_discovery.options.regenerating"
            />
          </AppView>
        )}

        {draft.regenerationFailed && (
          <AppView marginB-16>
            <AppCard
              paddingV-16
              onPress={() => dispatch(clearRegenerationFailureAction())}>
              <AppView row centerV gap-8>
                <AppIcon
                  set="Ionicons"
                  name="alert-circle-outline"
                  size={18}
                  color={Colors.error}
                />
                <AppView flex-1>
                  <TranslatedText
                    xsm
                    translationKey="goal_discovery.options.regenerate_failed"
                  />
                </AppView>
              </AppView>
            </AppCard>
          </AppView>
        )}

        {draft.options.map((option) => (
          <AppView key={option.id} marginB-16>
            <GoalOptionCard
              option={option}
              onChoose={onChoose}
              disabled={isReplacing}
            />
          </AppView>
        ))}

        <AppButton
          br30
          center
          padding-14
          disabled={isReplacing || isRegenerating}
          style={{
            borderWidth: 1,
            borderColor: Colors.secondary,
            opacity: isReplacing || isRegenerating ? 0.5 : 1,
          }}
          onPress={() => setIsRegenerateOpen(true)}
          testID="regenerate-options">
          <TranslatedText
            body2
            translationKey="goal_discovery.options.regenerate"
          />
        </AppButton>
      </>
    );
  };

  return (
    <AppScreen safeArea>
      {/* Start over also lives here, not only on stage 1: once options exist the
          entry point lands on THIS screen, so leaving the control on stage 1
          alone would make it unreachable from the Create page. */}
      <AppView row spread centerV paddingT-8>
        <AppView flex>
          <HeaderWithBack headerKey="goal_discovery.options.header" />
        </AppView>
        <AppButton
          onPress={() => setIsStartOverOpen(true)}
          testID="goal-discovery-start-over">
          <AppIcon set="Feather" name="rotate-cw" size={20} />
        </AppButton>
      </AppView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="always">
        <Divider />
        <TranslatedText xsm translationKey="goal_discovery.options.intro" />
        <Divider />

        {/* A failed poll is not a failed job: the generation may still be
            running, so this only reports lost contact and never restarts it. */}
        {hasPollingError && isPolling && (
          <AppView marginB-12>
            <TranslatedText
              xsm
              color={Colors.warning}
              translationKey="common.something_went_wrong"
            />
          </AppView>
        )}

        {renderBody()}
        <Divider margin-24 />
      </ScrollView>

      <RegenerateDialog
        isOpen={isRegenerateOpen}
        onDismiss={() => setIsRegenerateOpen(false)}
        onUseExisting={startGeneration}
        onEditInputs={() => {
          // Return to stage 1 with every answer populated. Nothing is generated
          // until the user submits again.
          setIsRegenerateOpen(false);
          router.push('/goal-discovery');
        }}
      />

      <ConfirmationDialog
        isDialogOpen={isStartOverOpen}
        onDismiss={() => setIsStartOverOpen(false)}
        title="goal_discovery.start_over_title"
        subtitle="goal_discovery.start_over_subtitle"
        onPositivePress={() => {
          // Purely local: the draft is abandoned, nothing is deleted server-side.
          dispatch(resetGoalDiscoveryAction());
          setIsStartOverOpen(false);
          router.replace('/goal-discovery');
        }}
        onNegativePress={() => setIsStartOverOpen(false)}
        positiveText="goal_discovery.start_over_confirm"
        negativeText="goal_discovery.keep_draft"
      />

      <ConfirmationDialog
        isDialogOpen={Boolean(pendingOption)}
        onDismiss={() => setPendingOption(null)}
        title="goal_discovery.options.switch_goal_title"
        subtitle="goal_discovery.options.switch_goal_subtitle"
        onPositivePress={() => {
          const option = pendingOption;
          setPendingOption(null);
          if (option) goToStage2(option);
        }}
        onNegativePress={() => setPendingOption(null)}
        positiveText="goal_discovery.options.switch_goal_confirm"
        negativeText="common.cancel"
      />
    </AppScreen>
  );
};

export default GoalDiscoveryOptions;

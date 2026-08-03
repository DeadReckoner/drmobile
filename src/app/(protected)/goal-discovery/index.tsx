import { AppButton } from '@/components/AppButton';
import { AppIcon } from '@/components/AppIcon';
import { AppScreen } from '@/components/AppScreen';
import { ConfirmationDialog } from '@/components/ConfirmationDialog';
import { Divider } from '@/components/Divider';
import { ChoiceChips } from '@/components/goal-discovery/ChoiceChips';
import { FormQuestion } from '@/components/goal-discovery/FormQuestion';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { PrimaryButton } from '@/components/PrimaryButton';
import { TranslatedText } from '@/components/TranslatedText';
import { TranslatedTextInput } from '@/components/TranslatedTextInput';
import { AppView } from '@/components/ui';
import { useCreateGoalOptionsMutation } from '@/hooks/goalDiscovery';
import {
  AREA_CHOICES,
  OUTCOME_CHOICES,
  SELF_DESCRIPTION_CHOICES,
  TARGET_TYPE_CHOICES,
  TRIGGER_CHOICES,
} from '@/hooks/goalDiscovery/goalDiscoveryCatalog';
import {
  GoalDiscoveryArea,
  GoalDiscoveryOutcome,
  GoalDiscoverySelfDescription,
  GoalDiscoveryStage1Values,
  GoalDiscoveryTargetType,
  GoalDiscoveryTrigger,
} from '@/hooks/goalDiscovery/goalDiscovery.types';
import {
  canSelectMoreAreas,
  canSelectMoreOutcomes,
  emptyStage1Values,
  firstInvalidStage1Field,
  Stage1Field,
  toggleArea,
  toggleOutcome,
  toStage1Payload,
  validateStage1,
} from '@/hooks/goalDiscovery/stage1';
import { useLocalization } from '@/hooks/useLocalization';
import { useToast } from '@/hooks/useToast';
import { TranslationKeysType } from '@/lib/localization/types/i18n.types';
import { useAppDispatch, useAppSelector } from '@/store/hooks/store.hooks';
import { selectUser } from '@/store/slices/authSlice';
import {
  claimGoalDiscoveryDraftAction,
  resetGoalDiscoveryAction,
  selectGoalDiscoveryDraft,
  setGoalDiscoveryStage1Action,
  startGoalOptionsJobAction,
} from '@/store/slices/goalDiscoverySlice';
import { getApiErrorMessage } from '@/utils/apiErrors.utils';
import { router } from 'expo-router';
import { nanoid } from '@reduxjs/toolkit';
import { useCallback, useEffect, useRef, useState } from 'react';
import { LayoutChangeEvent, ScrollView } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { Colors } from 'react-native-ui-lib';

/**
 * Stage 1: the Goal Discovery questionnaire.
 *
 * A plain scrollable form. Every answer stays editable, the draft is saved as
 * the user types, and submitting starts ONE background job whose id is persisted
 * before the pending screen is shown.
 */
const GoalDiscoveryStage1 = () => {
  const dispatch = useAppDispatch();
  const { t } = useLocalization();
  const { showToast } = useToast();
  const user = useAppSelector(selectUser);
  const draft = useAppSelector(selectGoalDiscoveryDraft);

  const [values, setValues] = useState<GoalDiscoveryStage1Values>(
    () => draft.stage1 ?? emptyStage1Values(),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isStartOverOpen, setIsStartOverOpen] = useState(false);

  const scrollRef = useRef<ScrollView>(null);
  const fieldOffsets = useRef<Partial<Record<Stage1Field, number>>>({});
  // Guards against a double tap firing two generations before the first
  // response lands; the mutation's own isLoading only flips after dispatch.
  const isSubmitting = useRef(false);

  const [createGoalOptions, { isLoading }] = useCreateGoalOptionsMutation();

  // Claim the draft for this account. A draft belonging to a different user (or
  // an incompatible build) is discarded here, before anything renders.
  useEffect(() => {
    dispatch(claimGoalDiscoveryDraftAction(user.id));
  }, [dispatch, user.id]);

  useEffect(() => {
    setValues(draft.stage1 ?? emptyStage1Values());
    // Re-seeding only on identity change keeps typing from being clobbered by
    // the persisted copy of what was just typed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.userId]);

  /** Persist on every change so leaving mid-form never loses an answer. */
  const update = useCallback(
    (next: GoalDiscoveryStage1Values) => {
      setValues(next);
      dispatch(setGoalDiscoveryStage1Action(next));
    },
    [dispatch],
  );

  const onLayoutFor =
    (field: Stage1Field) =>
    ({ nativeEvent }: LayoutChangeEvent) => {
      fieldOffsets.current[field] = nativeEvent.layout.y;
    };

  const errorFor = (field: string): string | undefined =>
    errors[field] ? t(errors[field] as TranslationKeysType) : undefined;

  const onSubmit = async () => {
    if (isSubmitting.current || isLoading) return;

    const nextErrors = validateStage1(values);
    setErrors(nextErrors);

    const firstInvalid = firstInvalidStage1Field(nextErrors);
    if (firstInvalid) {
      // Move the user to the problem rather than leaving them to find it.
      const offset = fieldOffsets.current[firstInvalid];
      if (offset !== undefined) {
        scrollRef.current?.scrollTo({
          y: Math.max(offset - 24, 0),
          animated: true,
        });
      }
      return;
    }

    isSubmitting.current = true;
    const answers = toStage1Payload(values);
    // Minted once per submission: a retry after a dropped response reuses it and
    // the server returns the original job instead of generating twice.
    const idempotencyKey = nanoid();

    try {
      const response = await createGoalOptions({
        answers,
        idempotencyKey,
      }).unwrap();

      dispatch(
        startGoalOptionsJobAction({
          jobId: response.job_id,
          answers,
          idempotencyKey,
          regeneration: false,
        }),
      );
      router.push('/goal-discovery/options');
    } catch (error) {
      // Stage 1 answers are untouched, so the user can simply try again.
      showToast({ type: 'failure', message: getApiErrorMessage(error) });
    } finally {
      isSubmitting.current = false;
    }
  };

  const onStartOver = () => {
    dispatch(resetGoalDiscoveryAction());
    dispatch(claimGoalDiscoveryDraftAction(user.id));
    setValues(emptyStage1Values());
    setErrors({});
    setIsStartOverOpen(false);
  };

  return (
    <AppScreen safeArea>
      <AppView row spread centerV paddingT-8>
        <AppView flex>
          <HeaderWithBack headerKey="goal_discovery.header" />
        </AppView>
        <AppButton
          onPress={() => setIsStartOverOpen(true)}
          testID="goal-discovery-start-over">
          <AppIcon set="Feather" name="rotate-cw" size={20} />
        </AppButton>
      </AppView>

      <KeyboardAwareScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        bottomOffset={24}>
        <Divider />
        <TranslatedText xsm translationKey="goal_discovery.stage1.intro" />
        <Divider />

        <FormQuestion
          labelKey="goal_discovery.stage1.q1_label"
          error={errorFor('trigger')}
          onLayout={onLayoutFor('trigger')}>
          <ChoiceChips
            choices={TRIGGER_CHOICES}
            selected={values.trigger ? [values.trigger] : []}
            onToggle={(value: GoalDiscoveryTrigger) =>
              update({
                ...values,
                trigger: values.trigger === value ? null : value,
              })
            }
          />
          <AppView marginT-16>
            <TranslatedTextInput
              labelKey="goal_discovery.stage1.q1_note_label"
              value={values.triggerNote}
              onChangeText={(text) => update({ ...values, triggerNote: text })}
              error={errorFor('triggerNote')}
              multiline
            />
          </AppView>
        </FormQuestion>

        <FormQuestion
          labelKey="goal_discovery.stage1.q2_label"
          helperKey="goal_discovery.stage1.q2_helper"
          error={errorFor('areas')}
          onLayout={onLayoutFor('areas')}>
          <ChoiceChips
            choices={AREA_CHOICES}
            selected={values.areas}
            canSelectMore={canSelectMoreAreas(values)}
            onToggle={(value: GoalDiscoveryArea) =>
              update(toggleArea(values, value))
            }
          />
          <AppView marginT-16>
            <TranslatedTextInput
              labelKey="goal_discovery.stage1.q2_custom_label"
              value={values.customArea}
              onChangeText={(text) => update({ ...values, customArea: text })}
              // A non-empty custom area counts toward the max of three, so it is
              // only editable while there is a slot for it.
              editable={
                canSelectMoreAreas(values) || !!values.customArea.trim()
              }
            />
          </AppView>
        </FormQuestion>

        <FormQuestion
          labelKey="goal_discovery.stage1.q3_label"
          error={errorFor('selfDescription')}
          onLayout={onLayoutFor('selfDescription')}>
          <ChoiceChips
            choices={SELF_DESCRIPTION_CHOICES}
            selected={values.selfDescription ? [values.selfDescription] : []}
            onToggle={(value: GoalDiscoverySelfDescription) =>
              update({
                ...values,
                selfDescription:
                  values.selfDescription === value ? null : value,
              })
            }
          />
        </FormQuestion>

        <FormQuestion
          labelKey="goal_discovery.stage1.q4_label"
          error={errorFor('recurringThought')}
          onLayout={onLayoutFor('recurringThought')}>
          <TranslatedTextInput
            labelKey="goal_discovery.stage1.q4_label"
            labelProps={{ style: { display: 'none' } }}
            placeholderKey="goal_discovery.stage1.q4_placeholder"
            value={values.recurringThought}
            onChangeText={(text) =>
              update({ ...values, recurringThought: text })
            }
            multiline
          />
        </FormQuestion>

        <FormQuestion
          labelKey="goal_discovery.stage1.q5_label"
          error={errorFor('successDefinition')}
          onLayout={onLayoutFor('successDefinition')}>
          <TranslatedTextInput
            labelKey="goal_discovery.stage1.q5_label"
            labelProps={{ style: { display: 'none' } }}
            placeholderKey="goal_discovery.stage1.q5_placeholder"
            value={values.successDefinition}
            onChangeText={(text) =>
              update({ ...values, successDefinition: text })
            }
            multiline
          />
        </FormQuestion>

        <FormQuestion
          labelKey="goal_discovery.stage1.q6_label"
          helperKey="goal_discovery.stage1.q6_helper"
          error={errorFor('outcomes')}
          onLayout={onLayoutFor('outcomes')}>
          <ChoiceChips
            choices={OUTCOME_CHOICES}
            selected={values.outcomes}
            canSelectMore={canSelectMoreOutcomes(values)}
            onToggle={(value: GoalDiscoveryOutcome) =>
              update(toggleOutcome(values, value))
            }
          />
          <AppView marginT-16>
            <TranslatedTextInput
              labelKey="goal_discovery.stage1.q6_custom_label"
              value={values.customOutcome}
              onChangeText={(text) =>
                update({ ...values, customOutcome: text })
              }
              editable={
                canSelectMoreOutcomes(values) || !!values.customOutcome.trim()
              }
            />
          </AppView>
        </FormQuestion>

        <FormQuestion
          labelKey="goal_discovery.stage1.q7_label"
          error={errorFor('targetType')}
          onLayout={onLayoutFor('targetType')}>
          <ChoiceChips
            choices={TARGET_TYPE_CHOICES}
            selected={values.targetType ? [values.targetType] : []}
            onToggle={(value: GoalDiscoveryTargetType) =>
              update({
                ...values,
                targetType: values.targetType === value ? null : value,
              })
            }
          />
        </FormQuestion>

        {!!draft.optionsJobId && (
          <TranslatedText
            xsm
            marginB-12
            color={Colors.warning}
            translationKey="goal_discovery.options.edit_inputs_notice"
          />
        )}

        <PrimaryButton
          label="goal_discovery.stage1.submit"
          shouldShowLoader
          isLoading={isLoading}
          disabled={isLoading}
          onPress={onSubmit}
        />
        <Divider margin-24 />
      </KeyboardAwareScrollView>

      <ConfirmationDialog
        isDialogOpen={isStartOverOpen}
        onDismiss={() => setIsStartOverOpen(false)}
        title="goal_discovery.start_over_title"
        subtitle="goal_discovery.start_over_subtitle"
        onPositivePress={onStartOver}
        onNegativePress={() => setIsStartOverOpen(false)}
        positiveText="goal_discovery.start_over_confirm"
        negativeText="goal_discovery.keep_draft"
      />
    </AppScreen>
  );
};

export default GoalDiscoveryStage1;

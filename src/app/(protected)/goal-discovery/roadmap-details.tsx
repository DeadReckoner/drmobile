import { AppDateTimePicker } from '@/components/AppDateTimePicker';
import { AppScreen } from '@/components/AppScreen';
import { Divider } from '@/components/Divider';
import { ChoiceChips } from '@/components/goal-discovery/ChoiceChips';
import { FormQuestion } from '@/components/goal-discovery/FormQuestion';
import { SelectableRow } from '@/components/goal-discovery/SelectableRow';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { PrimaryButton } from '@/components/PrimaryButton';
import { TranslatedText } from '@/components/TranslatedText';
import { TranslatedTextInput } from '@/components/TranslatedTextInput';
import { AppView } from '@/components/ui';
import { useCreateGoalDiscoveryRoadmapMutation } from '@/hooks/goalDiscovery';
import {
  CONSTRAINT_CHOICES,
  PACE_LABEL_KEYS,
  PACE_ORDER,
  WEEKLY_PRESET_CHOICES,
} from '@/hooks/goalDiscovery/goalDiscoveryCatalog';
import {
  GoalDiscoveryConstraint,
  GoalDiscoveryStage2Values,
  GoalDiscoveryWeeklyPreset,
  GoalOptionPace,
} from '@/hooks/goalDiscovery/goalDiscovery.types';
import {
  effortFor,
  emptyStage2Values,
  firstInvalidStage2Field,
  isConstraintDetailsRequired,
  selectCustomPace,
  selectGeneratedPace,
  Stage2Field,
  toDateOnly,
  toggleConstraint,
  toStage2Payload,
  validateStage2,
} from '@/hooks/goalDiscovery/stage2';
import { useLocalization } from '@/hooks/useLocalization';
import { useToast } from '@/hooks/useToast';
import { TranslationKeysType } from '@/lib/localization/types/i18n.types';
import { roadmapApi } from '@/store/apis/roadmapApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks/store.hooks';
import {
  setAIRoadmapJobCreationResponseAction,
  startRoadmapCreationAction,
} from '@/store/slices/aiRoadmapCreationSlice';
import {
  selectGoalDiscoveryDraft,
  selectSelectedGoalOption,
  setGoalDiscoveryStage2Action,
  setRoadmapIdempotencyKeyAction,
  startGoalDiscoveryRoadmapAction,
} from '@/store/slices/goalDiscoverySlice';
import { getApiErrorMessage } from '@/utils/apiErrors.utils';
import { DateUtils } from '@/utils/date.utils';
import { nanoid } from '@reduxjs/toolkit';
import { router } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { LayoutChangeEvent, ScrollView, StyleSheet } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

/**
 * Stage 2: the roadmap details form.
 *
 * Still a form, not a chat. On submit it hands off to the EXISTING roadmap
 * generation experience — same job, same pending/result flow, same destination.
 *
 * Note what this screen never computes: it does not turn a target date into
 * weekly hours, and it does not turn a weekly limit into a finish date. The
 * backend generator owns both, so the user is never shown a number here that the
 * generated plan then contradicts.
 */
const GoalDiscoveryRoadmapDetails = () => {
  const dispatch = useAppDispatch();
  const { t } = useLocalization();
  const { showToast } = useToast();

  const draft = useAppSelector(selectGoalDiscoveryDraft);
  const selectedOption = useAppSelector(selectSelectedGoalOption);

  const [values, setValues] = useState<GoalDiscoveryStage2Values>(
    () => draft.stage2 ?? emptyStage2Values(),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const scrollRef = useRef<ScrollView>(null);
  const fieldOffsets = useRef<Partial<Record<Stage2Field, number>>>({});
  const isSubmitting = useRef(false);

  const [createRoadmap, { isLoading }] =
    useCreateGoalDiscoveryRoadmapMutation();

  const update = useCallback(
    (next: GoalDiscoveryStage2Values) => {
      setValues(next);
      dispatch(setGoalDiscoveryStage2Action(next));
    },
    [dispatch],
  );

  const onLayoutFor =
    (field: Stage2Field) =>
    ({ nativeEvent }: LayoutChangeEvent) => {
      fieldOffsets.current[field] = nativeEvent.layout.y;
    };

  const errorFor = (field: string): string | undefined =>
    errors[field] ? t(errors[field] as TranslationKeysType) : undefined;

  const onSubmit = async () => {
    if (isSubmitting.current || isLoading) return;
    if (
      !draft.submittedAnswers ||
      !draft.optionsJobId ||
      !draft.selectedOptionId
    ) {
      return;
    }

    const nextErrors = validateStage2(values);
    setErrors(nextErrors);

    const firstInvalid = firstInvalidStage2Field(nextErrors);
    if (firstInvalid) {
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
    // Reused across retries so a resubmitted request returns the roadmap that
    // was already created rather than generating a second one.
    const idempotencyKey = draft.roadmapIdempotencyKey ?? nanoid();
    dispatch(setRoadmapIdempotencyKeyAction(idempotencyKey));

    try {
      const response = await createRoadmap(
        toStage2Payload({
          values,
          answers: draft.submittedAnswers,
          discoveryJobId: draft.optionsJobId,
          selectedOptionId: draft.selectedOptionId,
          idempotencyKey,
        }),
      ).unwrap();

      dispatch(
        startGoalDiscoveryRoadmapAction({
          jobId: response.job_id,
          roadmapId: response.roadmap_id,
          idempotencyKey,
        }),
      );

      // Hand the job to the EXISTING roadmap pending/result experience: the
      // Progress-tab banner polls this job, reconnects its websocket, restores
      // after an app resume, and navigates to the finished roadmap. Feeding that
      // slice is what makes goal discovery reuse it rather than grow a parallel
      // pending UI.
      //
      // The SOURCE is what keeps that reuse safe. The slice is shared with the
      // chat flow, and every "Continue" built on its status used to open the
      // chat screen — so a user who only ever saw this form would land in a
      // conversation they never had. Tagging the job routes them back here
      // instead, and the tag is persisted with the slice so it survives a
      // restart.
      dispatch(startRoadmapCreationAction('goal_discovery_form'));
      dispatch(setAIRoadmapJobCreationResponseAction(response));

      // The draft is deliberately NOT cleared here. It is cleared only once the
      // roadmap actually completes (see the goal discovery slice), so a failed
      // generation still leaves the user's answers intact.
      dispatch(
        roadmapApi.endpoints.getRoadmaps.initiate(undefined, {
          forceRefetch: true,
        }),
      );
      // Land on goal discovery's OWN pending state rather than the Progress
      // tab. The Progress banner still tracks the same job — this just means
      // the user watches it from the flow they were in.
      router.replace('/goal-discovery/pending');
    } catch (error) {
      showToast({ type: 'failure', message: getApiErrorMessage(error) });
    } finally {
      isSubmitting.current = false;
    }
  };

  const pace = values.pace;

  return (
    <AppScreen safeArea>
      <AppView paddingT-8>
        <HeaderWithBack headerKey="goal_discovery.stage2.header" />
      </AppView>

      <KeyboardAwareScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        bottomOffset={24}>
        <Divider />
        <TranslatedText xsm translationKey="goal_discovery.stage2.intro" />
        <Divider />

        <FormQuestion
          labelKey="goal_discovery.stage2.goal_label"
          helperKey="goal_discovery.stage2.goal_helper"
          error={errorFor('selectedGoal')}
          onLayout={onLayoutFor('selectedGoal')}>
          <TranslatedTextInput
            labelKey="goal_discovery.stage2.goal_label"
            labelProps={{ style: styles.hiddenLabel }}
            value={values.selectedGoal}
            onChangeText={(text) => update({ ...values, selectedGoal: text })}
            multiline
          />
        </FormQuestion>

        <FormQuestion
          labelKey="goal_discovery.stage2.done_label"
          helperKey="goal_discovery.stage2.done_helper"
          error={errorFor('completionDefinition')}
          onLayout={onLayoutFor('completionDefinition')}>
          <TranslatedTextInput
            labelKey="goal_discovery.stage2.done_label"
            labelProps={{ style: styles.hiddenLabel }}
            value={values.completionDefinition}
            onChangeText={(text) =>
              update({ ...values, completionDefinition: text })
            }
            multiline
          />
        </FormQuestion>

        <FormQuestion
          labelKey="goal_discovery.stage2.why_label"
          error={errorFor('whyNow')}
          onLayout={onLayoutFor('whyNow')}>
          <TranslatedTextInput
            labelKey="goal_discovery.stage2.why_label"
            labelProps={{ style: styles.hiddenLabel }}
            placeholderKey="goal_discovery.stage2.why_placeholder"
            value={values.whyNow}
            onChangeText={(text) => update({ ...values, whyNow: text })}
            multiline
          />
        </FormQuestion>

        <FormQuestion
          labelKey="goal_discovery.stage2.pace_label"
          helperKey="goal_discovery.stage2.pace_helper"
          error={errorFor('pace')}
          onLayout={onLayoutFor('pace')}>
          {/* Rendered from the STRUCTURED pace data on the option, never by
              parsing the display string. */}
          {PACE_ORDER.map((option: GoalOptionPace) => {
            const effort = selectedOption
              ? effortFor(selectedOption, option)
              : undefined;
            if (!effort) return null;
            const isSelected = !pace.isCustom && pace.selectedPace === option;

            return (
              <AppView key={option} marginB-8>
                <SelectableRow
                  label={`${t(PACE_LABEL_KEYS[option])} — ${effort.display_text}`}
                  isSelected={isSelected}
                  onPress={() => update(selectGeneratedPace(values, option))}
                  testID={`pace-${option}`}
                />
              </AppView>
            );
          })}

          <SelectableRow
            label={t('goal_discovery.stage2.pace_custom')}
            isSelected={pace.isCustom}
            onPress={() => update(selectCustomPace(values))}
            testID="pace-custom"
          />

          {pace.isCustom && (
            <AppView marginT-16>
              <TranslatedText
                body2
                translationKey="goal_discovery.stage2.control_label"
              />
              <AppView marginT-12>
                <ChoiceChips
                  choices={[
                    {
                      value: 'deadline',
                      labelKey: 'goal_discovery.stage2.control_deadline',
                    },
                    {
                      value: 'weekly',
                      labelKey: 'goal_discovery.stage2.control_weekly',
                    },
                  ]}
                  selected={pace.control ? [pace.control] : []}
                  onToggle={(control) =>
                    update({
                      ...values,
                      pace: {
                        ...pace,
                        control: pace.control === control ? null : control,
                      },
                    })
                  }
                />
              </AppView>

              {pace.control === 'deadline' && (
                <AppView marginT-16>
                  <AppDateTimePicker
                    mode="date"
                    // Only a future calendar date is a usable deadline.
                    minimumDate={DateUtils.createDate()
                      .add(1, 'day')
                      .startOf('day')
                      .toDate()}
                    onChange={(date: Date) =>
                      update({
                        ...values,
                        // Stored date-only, in the device's local calendar. No
                        // UTC conversion happens anywhere along this path.
                        pace: { ...pace, targetDate: toDateOnly(date) },
                      })
                    }
                    renderInput={() => (
                      <TranslatedTextInput
                        labelKey="goal_discovery.stage2.deadline_label"
                        placeholderKey="goal_discovery.stage2.deadline_placeholder"
                        value={pace.targetDate}
                        editable={false}
                        reduceOpacityWhenDisabled={false}
                      />
                    )}
                  />
                </AppView>
              )}

              {pace.control === 'weekly' && (
                <AppView marginT-16>
                  <TranslatedText
                    body2
                    marginB-12
                    translationKey="goal_discovery.stage2.weekly_label"
                  />
                  <ChoiceChips
                    choices={WEEKLY_PRESET_CHOICES}
                    selected={pace.weeklyPreset ? [pace.weeklyPreset] : []}
                    onToggle={(preset: GoalDiscoveryWeeklyPreset) =>
                      update({
                        ...values,
                        pace: {
                          ...pace,
                          weeklyPreset:
                            pace.weeklyPreset === preset ? null : preset,
                        },
                      })
                    }
                  />
                  {pace.weeklyPreset === 'custom' && (
                    <AppView marginT-16>
                      <TranslatedTextInput
                        labelKey="goal_discovery.stage2.weekly_custom_label"
                        placeholderKey="goal_discovery.stage2.weekly_custom_placeholder"
                        value={pace.customWeeklyDescription}
                        onChangeText={(text) =>
                          update({
                            ...values,
                            pace: { ...pace, customWeeklyDescription: text },
                          })
                        }
                        multiline
                      />
                    </AppView>
                  )}
                </AppView>
              )}
            </AppView>
          )}
        </FormQuestion>

        <FormQuestion
          labelKey="goal_discovery.stage2.baseline_label"
          error={errorFor('baseline')}
          onLayout={onLayoutFor('baseline')}>
          <TranslatedTextInput
            labelKey="goal_discovery.stage2.baseline_label"
            labelProps={{ style: styles.hiddenLabel }}
            placeholderKey="goal_discovery.stage2.baseline_placeholder"
            value={values.baseline}
            onChangeText={(text) => update({ ...values, baseline: text })}
            multiline
          />
        </FormQuestion>

        <FormQuestion
          labelKey="goal_discovery.stage2.constraints_label"
          helperKey="goal_discovery.stage2.constraints_helper"
          error={errorFor('constraints')}
          onLayout={onLayoutFor('constraints')}>
          <ChoiceChips
            choices={CONSTRAINT_CHOICES}
            selected={values.constraints}
            onToggle={(constraint: GoalDiscoveryConstraint) =>
              update(toggleConstraint(values, constraint))
            }
          />
        </FormQuestion>

        <FormQuestion
          labelKey="goal_discovery.stage2.constraint_details_label"
          error={errorFor('constraintDetails')}
          onLayout={onLayoutFor('constraintDetails')}>
          <TranslatedTextInput
            labelKey="goal_discovery.stage2.constraint_details_label"
            labelProps={{ style: styles.hiddenLabel }}
            placeholderKey="goal_discovery.stage2.constraint_details_placeholder"
            value={values.constraintDetails}
            onChangeText={(text) =>
              update({ ...values, constraintDetails: text })
            }
            multiline
          />
          {/* The requirement is announced only while it is UNMET, and only
              while the validation error is not already saying the same thing.
              Showing it whenever "Other" is selected left a permanent warning
              under a field the user had already filled in — and, after a failed
              submit, printed the identical sentence twice. */}
          {isConstraintDetailsRequired(values) &&
            !values.constraintDetails.trim() &&
            !errors.constraintDetails && (
              <TranslatedText
                xsm
                translationKey="goal_discovery.errors.details_required"
              />
            )}
        </FormQuestion>

        <FormQuestion
          labelKey="goal_discovery.stage2.extra_label"
          error={errorFor('additionalContext')}
          onLayout={onLayoutFor('additionalContext')}>
          <TranslatedTextInput
            labelKey="goal_discovery.stage2.extra_label"
            labelProps={{ style: styles.hiddenLabel }}
            placeholderKey="goal_discovery.stage2.extra_placeholder"
            value={values.additionalContext}
            onChangeText={(text) =>
              update({ ...values, additionalContext: text })
            }
            multiline
          />
        </FormQuestion>

        <PrimaryButton
          label="goal_discovery.stage2.submit"
          shouldShowLoader
          isLoading={isLoading}
          disabled={isLoading}
          onPress={onSubmit}
        />
        <Divider margin-24 />
      </KeyboardAwareScrollView>
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  hiddenLabel: { display: 'none' },
});

export default GoalDiscoveryRoadmapDetails;

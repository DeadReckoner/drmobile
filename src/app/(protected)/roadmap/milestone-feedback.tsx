import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppIcon } from '@/components/AppIcon';
import { AppKeyboardController } from '@/components/AppKeyboardController';
import { AppSwitch } from '@/components/AppSwitch';
import { Divider } from '@/components/Divider';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { PrimaryButton } from '@/components/PrimaryButton';
import { TranslatedText } from '@/components/TranslatedText';
import { TranslatedTextInput } from '@/components/TranslatedTextInput';
import { AppText, AppView } from '@/components/ui';
import { useLocalization } from '@/hooks/useLocalization';
import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { LinearTransition } from 'react-native-reanimated';
import { Colors, Slider, Typography } from 'react-native-ui-lib';

const MilestoneFeedbackScreen = () => {
  const { t } = useLocalization();

  const [effortLevel, setEffortLevel] = useState(5);
  const [stressLevel, setStressLevel] = useState(5);
  const [confidenceLevel, setConfidenceLevel] = useState(5);

  const [wins, setWins] = useState('');
  const [blockers, setBlockers] = useState('');
  const [surprises, setSurprises] = useState('');
  const [changeRequests, setChangeRequests] = useState('');

  const [timeSpent, setTimeSpent] = useState(0);
  const [budgetHit, setBudgetHit] = useState(false);

  const handleSubmit = () => {
    // Handle feedback submission
    // TODO: Implement API call to submit feedback
  };

  const incrementTimeSpent = () => {
    setTimeSpent((prev) => prev + 1);
  };

  const decrementTimeSpent = () => {
    setTimeSpent((prev) => Math.max(0, prev - 1));
  };

  return (
    <AppView flex-1 bg-screenBG reanimated layout={LinearTransition}>
      <AppKeyboardController>
        <HeaderWithBack headerText={t('feedback.title')} />
        <Divider margin-12 />

        <AppView paddingB-64>
          <AppView marginB-24 gap-8>
            <TranslatedText subtitle1 translationKey="feedback.subtitle" />
            <TranslatedText xsm translationKey="feedback.description" />
          </AppView>

          <AppCard>
            <AppView>
              <TranslatedText body2 translationKey="feedback.rate_experience" />
              <AppView marginT-24>
                <AppView row spread>
                  <TranslatedText xsm translationKey="feedback.effort_felt" />
                  <AppText xsm textColor>
                    {t('feedback.level')}: {effortLevel}
                  </AppText>
                </AppView>
                <Slider
                  value={effortLevel}
                  minimumValue={0}
                  maximumValue={10}
                  step={1}
                  onValueChange={setEffortLevel}
                  minimumTrackTintColor={Colors.primary}
                  maximumTrackTintColor={Colors.grey50}
                  thumbTintColor={Colors.white}
                  containerStyle={styles.sliderContainer}
                  thumbStyle={styles.thumb}
                />
              </AppView>

              <AppView marginT-12>
                <AppView row spread>
                  <TranslatedText xsm translationKey="feedback.stress_level" />
                  <AppText xsm textColor>
                    {t('feedback.level')}: {stressLevel}
                  </AppText>
                </AppView>
                <Slider
                  value={stressLevel}
                  minimumValue={0}
                  maximumValue={10}
                  step={1}
                  onValueChange={setStressLevel}
                  minimumTrackTintColor={Colors.primary}
                  maximumTrackTintColor={Colors.grey50}
                  thumbTintColor={Colors.white}
                  containerStyle={styles.sliderContainer}
                  thumbStyle={styles.thumb}
                />
              </AppView>

              <AppView marginT-12>
                <AppView row spread>
                  <TranslatedText
                    xsm
                    translationKey="feedback.confidence_level"
                  />
                  <AppText xsm textColor>
                    {t('feedback.level')}: {confidenceLevel}
                  </AppText>
                </AppView>
                <Slider
                  value={confidenceLevel}
                  minimumValue={0}
                  maximumValue={10}
                  step={1}
                  onValueChange={setConfidenceLevel}
                  minimumTrackTintColor={Colors.primary}
                  maximumTrackTintColor={Colors.grey50}
                  thumbTintColor={Colors.white}
                  containerStyle={styles.sliderContainer}
                  thumbStyle={styles.thumb}
                />
              </AppView>
            </AppView>
          </AppCard>

          <Divider />

          <AppCard>
            <TranslatedText body2 translationKey="feedback.reflections" />

            <AppView gap-8 marginT-24>
              <TranslatedTextInput
                labelKey="feedback.wins"
                value={wins}
                onChangeText={setWins}
                placeholder={t('feedback.wins_placeholder')}
                labelProps={{ style: Typography.xsm }}
                multiline
                numberOfLines={4}
                fieldStyle={styles.textInput}
              />

              <TranslatedTextInput
                labelKey="feedback.blockers"
                value={blockers}
                onChangeText={setBlockers}
                placeholder={t('feedback.blockers_placeholder')}
                labelProps={{ style: Typography.xsm }}
                multiline
                numberOfLines={4}
              />

              <TranslatedTextInput
                labelKey="feedback.surprises"
                value={surprises}
                onChangeText={setSurprises}
                placeholder={t('feedback.surprises_placeholder')}
                labelProps={{ style: Typography.xsm }}
                multiline
                numberOfLines={4}
              />
            </AppView>
          </AppCard>

          <Divider />

          <AppCard>
            <TranslatedText
              marginB-20
              body2
              translationKey="feedback.reality_check"
            />
            <AppView row spread marginB-20>
              <AppView>
                <TranslatedText
                  body2
                  translationKey="feedback.time_spent_vs_planned"
                />
                <TranslatedText xsm translationKey="feedback.hours_per_week" />
              </AppView>

              <AppView row centerV>
                <AppButton
                  onPress={decrementTimeSpent}
                  bg-primary
                  padding-6
                  br100>
                  <AppIcon name="minus" size={16} color={Colors.textColor} />
                </AppButton>
                <AppText
                  body2
                  marginH-8
                  textColor
                  style={styles.counterText}
                  center>
                  {timeSpent}
                </AppText>
                <AppButton
                  onPress={incrementTimeSpent}
                  bg-primary
                  padding-6
                  br100>
                  <AppIcon name="plus" size={16} color={Colors.textColor} />
                </AppButton>
              </AppView>
            </AppView>

            <AppView row spread centerV>
              <TranslatedText body2 translationKey="feedback.budget_hit" />
              <AppSwitch value={budgetHit} onValueChange={setBudgetHit} />
            </AppView>
          </AppCard>

          <Divider />

          <AppCard marginB-32>
            <TranslatedTextInput
              labelKey="feedback.change_requests"
              placeholder={t('feedback.change_requests_placeholder')}
              onChangeText={setChangeRequests}
              value={changeRequests}
              multiline
              numberOfLines={4}
              labelProps={{ style: [Typography.body2, { marginBottom: 16 }] }}
            />
          </AppCard>

          <PrimaryButton
            label="feedback.submit_feedback"
            onPress={handleSubmit}
          />
        </AppView>
      </AppKeyboardController>
    </AppView>
  );
};

export default MilestoneFeedbackScreen;

const styles = StyleSheet.create({
  sliderContainer: {
    height: 40,
  },
  textInput: {
    maxHeight: 150,
  },
  thumb: {
    width: 20,
    height: 20,
  },
  counterText: {
    minWidth: 26,
  },
});

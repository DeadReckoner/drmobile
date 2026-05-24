import { AppButton } from '@/components/AppButton';
import { AppIcon } from '@/components/AppIcon';
import { AppModal } from '@/components/AppModal';
import { LineDivider } from '@/components/LineDivider';
import { TranslatedText } from '@/components/TranslatedText';
import { AppText, AppView } from '@/components/ui';
import { useLocalization } from '@/hooks/useLocalization';
import { useAppSelector } from '@/store/hooks/store.hooks';
import { selectIap } from '@/store/slices/settingsSlice';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';
import Purchases from 'react-native-purchases';
import { Colors } from 'react-native-ui-lib';

interface MembershipDetailsModalProps {
  visible: boolean;
  onDismiss: () => void;
}

export const MembershipDetailsModal = ({
  visible,
  onDismiss,
}: MembershipDetailsModalProps) => {
  const { isProUser, expirationDate, priceString, planCycle } =
    useAppSelector(selectIap);
  const { t } = useLocalization();

  const planLabel = isProUser
    ? t('membership.plan_pro')
    : t('membership.plan_free');

  const formattedExpiry = expirationDate
    ? new Date(expirationDate).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  const handleUpgrade = () => {
    onDismiss();
    router.navigate('/paywall');
  };

  const handleManageSubscription = async () => {
    onDismiss();
    await Purchases.showManageSubscriptions();
  };

  return (
    <AppModal
      visible={visible}
      setIsVisible={onDismiss}
      snapPoints={['50%', '50%']}>
      <AppView paddingH-8 paddingB-36 gap-20 marginT-16>
        <AppView row centerV spread>
          <TranslatedText
            subtitle1
            semibold
            textColor
            translationKey="membership.title"
          />
          <AppButton onPress={onDismiss}>
            <AppIcon name="close" size={22} color={Colors.textColor} />
          </AppButton>
        </AppView>

        <AppView
          br40
          padding-16
          gap-20
          style={[
            styles.card,
            {
              shadowColor: Colors.white,
              borderColor: isProUser ? Colors.accent : Colors.lineDivider,

              borderWidth: 2,
            },
          ]}>
          <AppView row centerV spread>
            <AppView row centerV gap-14>
              <AppView
                center
                padding-12
                br40
                style={{
                  backgroundColor: isProUser
                    ? Colors.accent
                    : Colors.lineDivider,
                }}>
                <AppIcon
                  set="Ionicons"
                  name={'sparkles'}
                  size={18}
                  color={isProUser ? Colors.textOnPrimary : Colors.textColor}
                />
              </AppView>
              <AppView gap-4>
                <TranslatedText
                  body2
                  light
                  translationKey="membership.current_plan"
                />
                <AppText body1 semibold textColor>
                  {planLabel}
                </AppText>
              </AppView>
            </AppView>

            <AppView
              center
              paddingH-16
              paddingV-6
              br100
              style={{
                backgroundColor: isProUser ? Colors.accent : Colors.lineDivider,
              }}>
              <AppText
                sm
                regular
                style={{
                  color: isProUser ? Colors.textOnPrimary : Colors.textColor,
                }}>
                {isProUser ? t('membership.active') : t('membership.inactive')}
              </AppText>
            </AppView>
          </AppView>
          <LineDivider marginV-0 />

          {isProUser && (
            <>
              {priceString && (
                <AppView row centerV spread>
                  <TranslatedText
                    body2
                    secondary
                    translationKey="membership.amount"
                  />
                  <AppText body2 semibold textColor>
                    {priceString}
                  </AppText>
                </AppView>
              )}

              {planCycle && (
                <AppView row centerV spread>
                  <TranslatedText
                    body2
                    secondary
                    translationKey="membership.billing_cycle"
                  />
                  <AppText body2 semibold textColor>
                    {planCycle}
                  </AppText>
                </AppView>
              )}

              <AppView row centerV spread>
                <TranslatedText
                  body2
                  secondary
                  translationKey="membership.expires_on"
                />
                <AppText body2 semibold textColor>
                  {formattedExpiry ?? t('membership.never_expires')}
                </AppText>
              </AppView>
            </>
          )}
        </AppView>

        {!isProUser && (
          <AppView paddingH-4>
            <TranslatedText
              body2
              light
              secondary
              style={styles.description}
              translationKey="membership.pro_description"
            />
          </AppView>
        )}

        {isProUser ? (
          <AppButton
            bg-accent
            br20
            paddingV-14
            center
            onPress={handleManageSubscription}>
            <TranslatedText
              body2
              semibold
              style={{ color: Colors.textOnPrimary }}
              translationKey="membership.manage_subscription"
            />
          </AppButton>
        ) : (
          <AppButton bg-accent br20 paddingV-14 center onPress={handleUpgrade}>
            <AppView row centerV gap-8>
              <AppIcon
                set="Ionicons"
                name="sparkles"
                size={16}
                color={Colors.textOnPrimary}
              />
              <TranslatedText
                body2
                semibold
                style={{ color: Colors.textOnPrimary }}
                translationKey="membership.upgrade_to_pro"
              />
            </AppView>
          </AppButton>
        )}
      </AppView>
    </AppModal>
  );
};

const styles = StyleSheet.create({
  card: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  description: {
    textAlign: 'center',
  },
});

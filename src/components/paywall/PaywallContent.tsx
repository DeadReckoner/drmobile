import { AppButton } from '@/components/AppButton';
import { AppIcon } from '@/components/AppIcon';
import { AppScreen } from '@/components/AppScreen';
import { Divider } from '@/components/Divider';
import { Loader } from '@/components/Loader';
import { ProFeaturesComparision } from '@/components/paywall/ProFeaturesComparision';
import { SubscriptionItem } from '@/components/paywall/SubscriptionItem';
import { TranslatedText } from '@/components/TranslatedText';
import { AppText, AppView } from '@/components/ui';
import { AppURLs } from '@/constants/AppURLs.constants';
import { useLocalization } from '@/hooks/useLocalization';
import { useRevenueCat } from '@/hooks/useRevenueCat';
import { useToast } from '@/hooks/useToast';
import { AnalyticsEvent, track } from '@/lib/analytics';
import { FeatureKeyType } from '@/store/types/billing.types';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { type PurchasesPackage } from 'react-native-purchases';
import { Colors } from 'react-native-ui-lib';

type PaywallContentProps = {
  /** When opened by the 402 interceptor, the feature the user hit. Drives the headline. */
  feature?: FeatureKeyType;
  /** Server-provided message from the 402 body — shown as the subtitle when present. */
  message?: string;
};

export const PaywallContent = ({ feature, message }: PaywallContentProps) => {
  const {
    subscriptions,
    isPurchasing,
    isRestoring,
    purchasePackage,
    restorePurchases,
    offeringsError,
    retryFetchOfferings,
    error,
  } = useRevenueCat();

  const { showToast } = useToast();
  const { t } = useLocalization();

  const [selectedPackage, setSelectedPackage] =
    useState<PurchasesPackage | null>(null);

  /**
   * Highlight label for the annual plan. Shows the real savings vs paying
   * monthly for a year when both prices are available, otherwise "Best Value".
   */
  const annualBadge = useMemo(() => {
    const monthly = subscriptions.find((s) => s.pkg.packageType === 'MONTHLY')
      ?.pkg.product.price;
    const annual = subscriptions.find((s) => s.pkg.packageType === 'ANNUAL')
      ?.pkg.product.price;
    if (monthly && annual) {
      const percent = Math.round((1 - annual / (monthly * 12)) * 100);
      if (percent > 0) return t('paywall.save_percent', { percent });
    }
    return t('paywall.best_value');
  }, [subscriptions, t]);

  const handleClose = () => {
    router.back();
  };

  const handleUpgrade = async () => {
    if (!selectedPackage) return;

    // Recorded before the store sheet opens, not after. The purchase result
    // arrives server-side via the RevenueCat webhook, so what only the client
    // can report is the intent — and the gap between intent and completed
    // purchase is exactly where store-sheet abandonment shows up.
    track(AnalyticsEvent.CheckoutStarted, {
      plan_type: selectedPackage.identifier,
    });

    const success = await purchasePackage(selectedPackage);
    if (success) {
      showToast({
        message: t('paywall.purchase_success'),
        type: 'success',
      });
      router.back();
    }
  };

  const handleRestorePurchase = async () => {
    const restoredActive = await restorePurchases();
    if (restoredActive) {
      showToast({
        message: t('paywall.restore_purchase_success'),
        type: 'success',
      });
    } else {
      showToast({
        message: t('paywall.restore_purchase_nothing'),
        type: 'failure',
      });
    }
    router.back();
  };

  const handleSelectPackage = (pkg: PurchasesPackage) => () => {
    setSelectedPackage(pkg);
  };

  return (
    <AppScreen paddingT-24>
      <AppView height={'70%'}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <AppButton right onPress={handleClose}>
            <AppIcon name="close" size={24} />
          </AppButton>
          <AppView>
            <AppView center gap-8 marginB-8>
              <AppView center row gap-8>
                <TranslatedText
                  style={styles.text}
                  h2
                  semibold
                  translationKey="paywall.title"
                />
                <AppIcon
                  style={[
                    styles.proIcon,
                    {
                      shadowColor: Colors.proBadge,
                    },
                  ]}
                  set="Ionicons"
                  name="sparkles"
                  color={Colors.proBadge}
                />
              </AppView>
              {message ? (
                <AppText style={styles.text} textColor xsm>
                  {message}
                </AppText>
              ) : (
                <TranslatedText
                  style={styles.text}
                  xsm
                  translationKey={
                    feature
                      ? `paywall.feature_headline.${feature}`
                      : 'paywall.subtitle'
                  }
                />
              )}
            </AppView>
            <ProFeaturesComparision />
          </AppView>
        </ScrollView>
      </AppView>

      <AppView
        bg-lightCardBG
        br20
        style={[styles.bottomSheet, { shadowColor: Colors.accent }]}
        paddingT-12
        paddingB-36
        paddingH-24
        gap-8>
        <AppView row gap-12 paddingT-16 flex>
          {!offeringsError && subscriptions.length === 0 && (
            <AppView height={60} center flex>
              <Loader shouldAnimate={false} transparent />
            </AppView>
          )}
          {offeringsError && (
            <AppView height={60} center flex gap-8>
              <TranslatedText
                xsm
                style={{ color: Colors.grey40, textAlign: 'center' }}
                translationKey="paywall.offerings_fetch_error"
              />
              <AppButton onPress={retryFetchOfferings}>
                <TranslatedText xsm semibold translationKey="paywall.retry" />
              </AppButton>
            </AppView>
          )}
          {subscriptions.map((item) => (
            <AppView flex key={item.pkg.identifier}>
              <AppButton onPress={handleSelectPackage(item.pkg)}>
                <SubscriptionItem
                  isSelected={
                    selectedPackage?.identifier === item.pkg.identifier
                  }
                  badge={
                    item.pkg.packageType === 'ANNUAL' ? annualBadge : undefined
                  }
                  subscription={{
                    id: item.pkg.identifier,
                    title: item.pkg.product.title,
                    price: item.price,
                  }}
                />
              </AppButton>
            </AppView>
          ))}
        </AppView>
        {!!error && (
          <>
            <Divider margin-0 />
            <AppText xsm error>
              {error}
            </AppText>
          </>
        )}
        <Divider margin-4 />
        <AppButton
          disabled={
            isPurchasing || isRestoring || !selectedPackage || offeringsError
          }
          style={[
            styles.upgradeButton,
            {
              backgroundColor: !selectedPackage ? Colors.grey40 : Colors.blue,
            },
          ]}
          onPress={handleUpgrade}>
          {isPurchasing ? (
            <AppView
              height={20}
              width={20}
              style={{ paddingVertical: 8, position: 'relative' }}>
              <Loader transparent />
            </AppView>
          ) : (
            <TranslatedText
              body1
              semibold
              translationKey="paywall.upgrade_to_pro"
            />
          )}
        </AppButton>
        <AppButton
          disabled={isPurchasing || isRestoring}
          style={[styles.upgradeButton, { paddingVertical: 8 }]}
          onPress={handleRestorePurchase}>
          <AppView center>
            {isRestoring ? (
              <AppView height={20} width={20}>
                <Loader transparent />
              </AppView>
            ) : (
              <TranslatedText
                body2
                semibold
                translationKey="paywall.restore_purchase"
              />
            )}
          </AppView>
        </AppButton>
        <TranslatedText
          xsm
          style={[styles.disclaimer, { color: Colors.grey40 }]}
          translationKey="paywall.cta_disclaimer"
        />

        <AppView row center gap-16 paddingT-4>
          <AppButton
            onPress={() =>
              router.navigate({
                pathname: '/webview-page',
                params: { url: AppURLs.TERMS_AND_SERVICE },
              })
            }>
            <TranslatedText
              xsm
              regular
              style={{ color: Colors.blue }}
              translationKey="paywall.terms_of_use"
            />
          </AppButton>
          <AppButton
            onPress={() =>
              router.navigate({
                pathname: '/webview-page',
                params: { url: AppURLs.PRIVACY_POLICY },
              })
            }>
            <TranslatedText
              xsm
              regular
              style={{ color: Colors.blue }}
              translationKey="paywall.privacy_policy"
            />
          </AppButton>
        </AppView>
      </AppView>
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  text: {
    textAlign: 'center',
  },
  proIcon: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 14,
  },
  scrollContent: {
    paddingBottom: 150,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  upgradeButton: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  disclaimer: {
    textAlign: 'center',
  },
});

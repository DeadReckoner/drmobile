import { AppButton } from '@/components/AppButton';
import { AppIcon } from '@/components/AppIcon';
import { AppScreen } from '@/components/AppScreen';
import { Divider } from '@/components/Divider';
import { ProFeaturesComparision } from '@/components/paywall/ProFeaturesComparision';
import { SubscriptionItem } from '@/components/paywall/SubscriptionItem';
import { TranslatedText } from '@/components/TranslatedText';
import { AppView } from '@/components/ui';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

type SubscriptionType = {
  id: string;
  title: string;
  price: string;
  features: string[];
};

const SUBSCRIPTIONS: SubscriptionType[] = [
  {
    id: 'paywall.free_plan',
    title: 'Free Plan',
    price: '$0/month',
    features: [
      'Access to basic features',
      'Standard support',
      'Cancel anytime',
    ],
  },
  {
    id: 'paywall.pro_plan',
    title: 'Pro Monthly',
    price: '$9.99/month',
    features: [
      'Access to all features',
      'Priority support',
      'Cancel anytime',
      'Save 20%',
    ],
  },
];

export const PaywallContent = () => {
  const [selectedOffering, setSelectedOffering] = useState<SubscriptionType>(
    SUBSCRIPTIONS[1],
  );

  const handleClose = () => {
    router.back();
  };

  const handleUpgrade = () => {
    setSelectedOffering(SUBSCRIPTIONS[1]);
  };

  const handleSelectOffering = (subscription: SubscriptionType) => () => {
    setSelectedOffering(subscription);
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
            <AppView center gap-8 paddingH-36>
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
              <TranslatedText
                style={styles.text}
                xsm
                translationKey="paywall.subtitle"
              />
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
          {SUBSCRIPTIONS.map((subscription) => (
            <AppView flex key={subscription.id}>
              <AppButton onPress={handleSelectOffering(subscription)}>
                <SubscriptionItem
                  isSelected={selectedOffering.id === subscription.id}
                  subscription={subscription}
                />
              </AppButton>
            </AppView>
          ))}
        </AppView>
        <Divider margin-4 />
        <AppButton
          style={[styles.upgradeButton, { backgroundColor: Colors.blue }]}
          onPress={handleUpgrade}>
          <TranslatedText
            body1
            semibold
            translationKey="paywall.upgrade_to_pro"
          />
        </AppButton>
        <TranslatedText
          xsm
          style={[styles.disclaimer, { color: Colors.grey40 }]}
          translationKey="paywall.cta_disclaimer"
        />
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
    paddingBottom: 80,
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

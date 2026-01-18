import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppIcon } from '@/components/AppIcon';
import { Loader } from '@/components/Loader';
import { TranslatedText } from '@/components/TranslatedText';
import { AppText, AppView } from '@/components/ui';
import { AnchorRequest } from '@/hooks/friends/types/friends.types';
import { useLocalization } from '@/hooks/useLocalization';
import React from 'react';
import { StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

interface AnchorRequestItemProps {
  notification: AnchorRequest;
  onAccept: (_requestId: string) => void;
  onReject: (_requestId: string) => void;
  isAccepting: boolean;
  isRejecting: boolean;
}

export const AnchorRequestItem = ({
  notification,
  onAccept,
  onReject,
  isAccepting,
  isRejecting,
}: AnchorRequestItemProps) => {
  const { t } = useLocalization();
  const requesterName = notification.requester
    ? `${notification.requester.first_name} ${notification.requester.last_name}`.trim()
    : t('common.unknown_user');

  const roadmapGoal = notification.roadmap?.goal || t('common.unknown_roadmap');
  const isLoading = isAccepting || isRejecting;

  return (
    <AppCard padding-16 paddingV-20 flex>
      <AppView row gap-16 centerV flex>
        <AppView bg-outline br100 style={styles.avatarPlaceholder} center>
          <AppIcon
            set="Feather"
            name="anchor"
            size={24}
            color={Colors.inverseBackground}
          />
        </AppView>

        <AppView gap-10 flex>
          <AppText body2 textColor style={styles.textContainer}>
            {requesterName}{' '}
            <AppText body2 textColor light>
              {t('notifications.anchor_request_message', { goal: roadmapGoal })}
            </AppText>
          </AppText>
          <AppView row gap-8>
            <AppButton
              paddingV-8
              paddingH-16
              center
              br20
              style={{ backgroundColor: Colors.blue }}
              disabled={isLoading}
              onPress={() => onAccept(notification.request_id)}>
              {isAccepting ? (
                <AppView paddingH-16>
                  <Loader
                    containerStyle={{ position: 'relative' }}
                    color={Colors.white}
                    transparent
                    size={16}
                  />
                </AppView>
              ) : (
                <TranslatedText
                  tabLabel
                  white
                  style={styles.acceptButtonText}
                  translationKey="notifications.accept"
                />
              )}
            </AppButton>
            <AppButton
              paddingV-8
              paddingH-20
              br20
              center
              bg-error
              disabled={isLoading}
              onPress={() => onReject(notification.request_id)}>
              {isRejecting ? (
                <AppView paddingH-12>
                  <Loader
                    containerStyle={{ position: 'relative' }}
                    color={Colors.white}
                    transparent
                    size={16}
                  />
                </AppView>
              ) : (
                <TranslatedText
                  tabLabel
                  white
                  style={styles.cancelButtonText}
                  translationKey="notifications.reject"
                />
              )}
            </AppButton>
          </AppView>
        </AppView>
      </AppView>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  avatarPlaceholder: {
    width: 48,
    height: 48,
  },
  textContainer: {
    flexShrink: 1,
  },
  acceptButtonText: {
    fontFamily: 'Unbounded-Regular',
    fontSize: 12,
    letterSpacing: -0.24,
  },
  cancelButtonText: {
    fontFamily: 'Unbounded-Regular',
    fontSize: 12,
    letterSpacing: -0.24,
  },
});

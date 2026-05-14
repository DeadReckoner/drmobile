import { AppButton } from '@/components/AppButton';
import { AppIcon } from '@/components/AppIcon';
import { AppModal } from '@/components/AppModal';
import { Divider } from '@/components/Divider';
import { Loader } from '@/components/Loader';
import { TranslatedText } from '@/components/TranslatedText';
import { AppText, AppView } from '@/components/ui';
import {
  useGenerateShareLinkMutation,
  useRevokeShareLinkMutation,
} from '@/hooks/roadmap';
import { useLocalization } from '@/hooks/useLocalization';
import { useToast } from '@/hooks/useToast';
import { getApiErrorMessage } from '@/utils/apiErrors.utils';
import * as Clipboard from 'expo-clipboard';
import { useCallback, useEffect, useState } from 'react';
import { Share, StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

const SHARE_BASE_URL = 'https://deadreckoner.io/shared';

interface ShareRoadmapModalProps {
  roadmapId: string;
  shareToken: string | null | undefined;
  visible: boolean;
  onDismiss: () => void;
}

export const ShareRoadmapModal = ({
  roadmapId,
  shareToken: initialShareToken,
  visible,
  onDismiss,
}: ShareRoadmapModalProps) => {
  const { t } = useLocalization();
  const { showToast } = useToast();

  const [shareToken, setShareToken] = useState(initialShareToken);

  const [generateShareLink, { isLoading: isGenerating }] =
    useGenerateShareLinkMutation();
  const [revokeShareLink, { isLoading: isRevoking }] =
    useRevokeShareLinkMutation();

  useEffect(() => {
    setShareToken(initialShareToken);
  }, [initialShareToken]);

  useEffect(() => {
    if (visible && !shareToken) {
      handleGenerate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const shareUrl = shareToken ? `${SHARE_BASE_URL}/${shareToken}` : '';

  const handleGenerate = useCallback(async () => {
    try {
      const result = await generateShareLink(roadmapId).unwrap();
      setShareToken(result.share_token);
      showToast({
        type: 'success',
        message: t('roadmap.share.link_generated'),
      });
    } catch (error) {
      showToast({ type: 'failure', message: getApiErrorMessage(error) });
      onDismiss();
    }
  }, [generateShareLink, onDismiss, roadmapId, showToast, t]);

  const handleCopyLink = useCallback(async () => {
    if (!shareUrl) return;
    try {
      await Clipboard.setStringAsync(shareUrl);
      showToast({ type: 'success', message: t('roadmap.share.link_copied') });
    } catch {}
  }, [shareUrl, showToast, t]);

  const handleShareVia = useCallback(async () => {
    if (!shareUrl) return;
    try {
      await Share.share({
        message: shareUrl,
        url: shareUrl,
        title: t('roadmap.share.modal_title'),
      });
    } catch {}
  }, [shareUrl, t]);

  const handleRevoke = useCallback(async () => {
    try {
      await revokeShareLink(roadmapId).unwrap();
      setShareToken(null);
      showToast({ type: 'success', message: t('roadmap.share.link_revoked') });
      onDismiss();
    } catch (error) {
      showToast({
        type: 'failure',
        message: getApiErrorMessage(error),
      });
    }
  }, [onDismiss, roadmapId, revokeShareLink, showToast, t]);

  const isLoading = isGenerating || isRevoking;

  return (
    <AppModal
      visible={visible}
      setIsVisible={(v) => {
        if (!v) onDismiss();
      }}
      snapPoints={['45%']}
      dismissible={!isLoading}>
      <AppView paddingH-8 paddingB-24 flex-1>
        <AppView row centerV spread marginB-4>
          <TranslatedText
            body1
            semibold
            textColor
            translationKey="roadmap.share.modal_title"
          />
          <AppButton onPress={onDismiss} disabled={isLoading}>
            <AppIcon name="close" size={20} />
          </AppButton>
        </AppView>

        <Divider />

        {isGenerating ? (
          <AppView flex center>
            <Loader transparent containerStyle={{ position: 'relative' }} />
          </AppView>
        ) : (
          <>
            <AppView
              row
              centerV
              gap-8
              br10
              bg-cardBG
              padding-8
              style={[styles.linkContainer, { borderColor: Colors.accent }]}>
              <AppView flex>
                <AppText body2 regular textColor numberOfLines={1}>
                  {shareUrl}
                </AppText>
              </AppView>
              <AppButton onPress={handleCopyLink} br20 padding-8 bg-accent>
                <AppIcon
                  set="Feather"
                  name="copy"
                  size={20}
                  color={Colors.textOnPrimary}
                />
              </AppButton>
            </AppView>

            <AppView gap-12 marginT-16>
              <AppButton
                br20
                center
                padding-14
                bg-accent
                style={styles.btn}
                onPress={handleShareVia}>
                <AppView row center gap-8>
                  <AppIcon
                    set="Feather"
                    name="share-2"
                    size={18}
                    color={Colors.textColor}
                  />
                  <TranslatedText
                    body2
                    textColor
                    translationKey="roadmap.share.share_via"
                  />
                </AppView>
              </AppButton>

              <AppButton
                br20
                bg-error
                center
                padding-14
                style={styles.btn}
                onPress={() => handleRevoke()}>
                <AppView row center gap-8>
                  {isRevoking ? (
                    <AppView width={24} height={24}>
                      <Loader transparent color={Colors.textOnPrimary} />
                    </AppView>
                  ) : (
                    <>
                      <AppIcon
                        set="Feather"
                        name="link-2"
                        size={18}
                        color={Colors.textOnPrimary}
                      />
                      <TranslatedText
                        body2
                        style={{ color: Colors.textOnPrimary }}
                        translationKey="roadmap.share.revoke_label"
                      />
                    </>
                  )}
                </AppView>
              </AppButton>
            </AppView>
          </>
        )}
      </AppView>
    </AppModal>
  );
};

const styles = StyleSheet.create({
  linkContainer: {
    borderWidth: 1,
    borderRadius: 8,
  },
  linkInput: {
    flex: 1,
    fontSize: 13,
  },
  btn: {
    borderWidth: 1,
  },
  revokeConfirm: {
    borderWidth: 1,
    borderRadius: 8,
  },
});

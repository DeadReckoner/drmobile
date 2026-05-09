import { AppScreen } from '@/components/AppScreen';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { Loader } from '@/components/Loader';
import { AppView } from '@/components/ui';
import { useLocalization } from '@/hooks/useLocalization';
import { Asset } from 'expo-asset';
import { File } from 'expo-file-system';
import { useCallback, useEffect, useState } from 'react';
import { Linking } from 'react-native';
import { Colors } from 'react-native-ui-lib';
import { WebView } from 'react-native-webview';
import {
  OnShouldStartLoadWithRequest,
  WebViewProgressEvent,
} from 'react-native-webview/lib/WebViewTypes';

const TermsAndServices = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { selectedLanguage } = useLocalization();
  const [htmlContent, setHtmlContent] = useState<string | null>(null);

  const loadHtml = useCallback(async () => {
    const assetMap = {
      en: require('@/../assets/html/terms-and-services-en.html'),
      es: require('@/../assets/html/terms-and-services-es.html'),
      fr: require('@/../assets/html/terms-and-services-fr.html'),
    };

    const asset = Asset.fromModule(
      assetMap[selectedLanguage.languageCode] || assetMap.en,
    );
    await asset.downloadAsync();
    const rawHtml = await new File(asset.localUri!).text();
    const themedHtml = `
      <style>
        body {
          background-color: ${Colors.screenBG} !important;
          color: ${Colors.textColor} !important;
        }
        h1, h2, h3, p, ul, li, .meta, .muted {
          color: ${Colors.textColor} !important;
        }
        .meta {
          border-bottom: 1px solid ${Colors.textColor} !important;
        }
      </style>
      ${rawHtml}
    `;

    setHtmlContent(themedHtml);
  }, [selectedLanguage]);

  useEffect(() => {
    loadHtml();
  }, [selectedLanguage, loadHtml]);

  const onShouldStartLoadWithRequest: OnShouldStartLoadWithRequest = (
    request,
  ) => {
    if (
      request.url.startsWith('mailto') ||
      request.url.includes('deadreckoner.io')
    ) {
      Linking.openURL(request.url);
      return false;
    }
    return true;
  };

  const onLoadProgress = ({
    nativeEvent: { progress },
  }: WebViewProgressEvent) => {
    if (progress >= 0.8) {
      setIsLoading(false);
    }
  };

  const onLoadEnd = () => {
    setIsLoading(false);
  };

  return (
    <AppScreen safeArea>
      {isLoading && <Loader transparent />}
      <AppView paddingB-16>
        <HeaderWithBack headerKey="settings.terms_of_service" />
      </AppView>
      <WebView
        source={htmlContent ? { html: htmlContent } : undefined}
        showsVerticalScrollIndicator={false}
        originWhitelist={['*']}
        onLoadEnd={onLoadEnd}
        onError={onLoadEnd}
        onLoadProgress={onLoadProgress}
        onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
        style={{ backgroundColor: Colors.screenBG }}
      />
    </AppScreen>
  );
};

export default TermsAndServices;

import { AppScreen } from '@/components/AppScreen';
import { Divider } from '@/components/Divider';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { Loader } from '@/components/Loader';
import { AppView } from '@/components/ui';
import { useLocalization } from '@/hooks/useLocalization';
import { useState } from 'react';
import { Linking, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import {
  OnShouldStartLoadWithRequest,
  WebViewProgressEvent,
} from 'react-native-webview/lib/WebViewTypes';

const PrivacyPolicy = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { selectedLanguage } = useLocalization();

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

  const getPrivacyProfileURL = () => {
    switch (selectedLanguage.languageCode) {
      case 'en':
        return require('@/../assets/html/privacy-policy-en.html');
      case 'es':
        return require('@/../assets/html/privacy-policy-es.html');
      case 'fr':
        return require('@/../assets/html/privacy-policy-fr.html');
      default:
        return require('@/../assets/html/privacy-policy-en.html');
    }
  };

  return (
    <>
      {isLoading && <Loader transparent />}
      <AppScreen safeArea style={styles.container}>
        <AppView paddingB-16>
          <HeaderWithBack headerKey="settings.privacy_policy" />
        </AppView>
        <WebView
          source={getPrivacyProfileURL()}
          style={styles.container}
          showsVerticalScrollIndicator={false}
          originWhitelist={['*']}
          onLoadEnd={onLoadEnd}
          onError={onLoadEnd}
          onLoadProgress={onLoadProgress}
          onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
        />
        <Divider margin-16 />
      </AppScreen>
    </>
  );
};

export default PrivacyPolicy;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#333f48',
  },
});

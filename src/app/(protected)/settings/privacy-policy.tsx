import { AppScreen } from '@/components/AppScreen';
import { Divider } from '@/components/Divider';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { Loader } from '@/components/Loader';
import { AppView } from '@/components/ui';
import { useState } from 'react';
import { Linking, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import {
  OnShouldStartLoadWithRequest,
  WebViewProgressEvent,
} from 'react-native-webview/lib/WebViewTypes';

const PrivacyPolicy = () => {
  const [isLoading, setIsLoading] = useState(true);

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
    <>
      {isLoading && <Loader transparent />}
      <AppScreen safeArea style={styles.container}>
        <AppView paddingB-16>
          <HeaderWithBack headerKey="settings.privacy_policy" />
        </AppView>
        <WebView
          source={require('@/../assets/html/privacy-policy-en.html')}
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

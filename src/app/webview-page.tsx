import { AppScreen } from '@/components/AppScreen';
import { Loader } from '@/components/Loader';
import { TranslatedText } from '@/components/TranslatedText';
import { AppView } from '@/components/ui';
import { useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Colors } from 'react-native-ui-lib';
import WebView from 'react-native-webview';

const WebViewPage = () => {
  const { url } = useLocalSearchParams<{ url: string }>();
  const [isLoading, setIsLoading] = useState(true);
  if (!url) {
    return (
      <AppView flex-1 center>
        <TranslatedText translationKey="common.something_went_wrong" />
      </AppView>
    );
  }
  return (
    <AppScreen paddingH-0 safeArea>
      <WebView
        source={{ uri: url }}
        style={{
          backgroundColor: Colors.screenBG,
        }}
        bounces={false}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
      />
      {isLoading && <Loader />}
    </AppScreen>
  );
};

export default WebViewPage;

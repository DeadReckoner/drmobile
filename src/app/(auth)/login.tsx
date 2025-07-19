import { AppText, IconSymbol, TranslatedText } from '@/components/ui';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import React from 'react';
import { Button, View } from 'react-native-ui-lib';

const Login = () => {
  const { toggleTheme, theme } = useAppTheme();
  const { setLanguage, selectedLanguage } = useLocalization();

  return (
    <View flex-1 center bg-screenBackground>
      <IconSymbol name="CodeSandbox" color="red" />
      <AppText hero text>
        {theme}
      </AppText>
      <Button onPress={toggleTheme} label="Toggle theme" />
      <Button
        onPress={() => {
          if (selectedLanguage.languageCode === 'es') {
            setLanguage({
              languageCode: 'en',
              languageName: 'English',
            });
            return;
          }
          setLanguage({
            languageCode: 'es',
            languageName: 'Español',
          });
        }}
        label="change lang"
      />
      <TranslatedText
        translationKey="authentication.login"
        text70
        center
        marginV-20
      />
    </View>
  );
};

export default Login;

import { AppButton } from '@/components/AppButton';
import { AppIcon } from '@/components/AppIcon';
import { Divider } from '@/components/Divider';
import { TranslatedText } from '@/components/TranslatedText';
import { AppView } from '@/components/ui';
import { Component, ErrorInfo, PropsWithChildren, ReactNode } from 'react';
import { Colors } from 'react-native-ui-lib';

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<
  PropsWithChildren,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return <ErrorFallback onReset={this.handleReset} />;
    }

    return this.props.children;
  }
}

const ErrorFallback = ({ onReset }: { onReset: () => void }) => {
  return (
    <AppView flex-1 center bg-screenBG padding-24>
      <AppView
        bg-error
        center
        style={{ width: 64, height: 64, borderRadius: 32 }}>
        <AppIcon
          set="Feather"
          name="alert-triangle"
          size={32}
          color={Colors.white}
        />
      </AppView>
      <Divider margin-12 />
      <TranslatedText
        subtitle2
        textColor
        center
        translationKey="error_boundary.title"
      />
      <Divider margin-8 />
      <TranslatedText
        xsm
        textColor
        center
        translationKey="error_boundary.description"
      />
      <Divider margin-24 />
      <AppButton
        row
        bg-primary
        br20
        paddingV-12
        paddingH-24
        center
        onPress={onReset}>
        <AppIcon
          set="Feather"
          name="refresh-cw"
          color={Colors.textOnPrimary}
          size={16}
        />
        <Divider margin-4 />
        <TranslatedText
          caption
          textOnPrimary
          translationKey="error_boundary.try_again"
        />
      </AppButton>
    </AppView>
  );
};

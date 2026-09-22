import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

/**
 * Rendered by Sentry.GlobalErrorBoundary when the app crashes. It must stay
 * self-contained (no Redux, theming, i18n, or other app providers) because
 * the boundary unmounts the entire provider tree — including the one that
 * crashed — before swapping in this fallback.
 */
export const ErrorFallback = ({
  onReset,
  eventId,
}: {
  onReset: () => void;
  eventId: string;
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Text style={styles.iconGlyph}>!</Text>
      </View>
      <Text style={styles.title}>Something went wrong!</Text>
      <Text style={styles.description}>
        Our team has been notified. Please try again.{'\n'}If issue persist
        share this eventId: {eventId} with the support team
      </Text>
      <TouchableOpacity
        style={styles.button}
        activeOpacity={0.7}
        onPress={onReset}>
        <Text style={styles.buttonText}>Try again</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#242d31',
    padding: 24,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  iconGlyph: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '700',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
  description: {
    marginTop: 8,
    fontSize: 16,
    color: '#e5e5e5',
    textAlign: 'center',
  },
  button: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 50,
    backgroundColor: '#5F6D76',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

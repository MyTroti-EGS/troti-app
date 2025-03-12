import { Stack } from 'expo-router';
import GradientStatusBar from '~/components/GradientStatusBar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <GradientStatusBar
        colors={[
          'rgba(0,0,0,0.6)',
          'rgba(0,0,0,0.5)',
          'rgba(0,0,0,0.3)',
          'rgba(0,0,0,0.2)',
          'transparent',
        ]}
        barStyle="light"
      />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </SafeAreaProvider>
  );
}

import { Slot } from 'expo-router';
import AuthProvider from 'providers/AuthProvider';
import GradientStatusBar from '~/components/GradientStatusBar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import * as Location from 'expo-location';
import { useEffect } from 'react';

export default function RootLayout() {
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Location permission is required to use the app.');
      }
    })();
  }, []);

  return (
    <AuthProvider>
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
        <Slot />
      </SafeAreaProvider>
    </AuthProvider>
  );
}

/*

<Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="auth/index" />
        <Stack.Screen name="(main-tabs)" />
      </Stack>

*/

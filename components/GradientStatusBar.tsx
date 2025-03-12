import { StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';

interface GradientStatusBarProps {
  colors?: string[];
  barStyle?: 'light' | 'dark' | 'auto';
}

export default function GradientStatusBar({
  colors = ['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.4)', 'transparent'],
  barStyle = 'light',
}: GradientStatusBarProps) {
  const insets = useSafeAreaInsets();

  // Calculate status bar height based on platform and safe area insets
  // @ts-expect-error: `StatusBar.currentHeight` is not in the type definitions
  const statusBarHeight = Platform.OS === 'ios' ? insets.top : StatusBar.currentHeight || 0;

  return (
    <>
      <StatusBar translucent={true} style={barStyle} />
      <LinearGradient
        // @ts-expect-error: `colors` is not in the type definitions
        colors={colors}
        style={[styles.gradient, { height: statusBarHeight + 55 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        pointerEvents="none"
      />
    </>
  );
}

const styles = StyleSheet.create({
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    width: '100%',
    pointerEvents: 'none', // Allow touches to fall through
  },
});

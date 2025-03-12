import { StyleSheet, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useEffect } from 'react';

interface TabBarButtonProps {
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
  routeName: string;
  label: string;
}

// Map route names to Feather icon names
const ROUTE_ICONS: Record<string, string> = {
  index: 'compass',
  invoices: 'file-text',
  profile: 'user',
};

export default function TabBarButton({
  isFocused,
  onPress,
  onLongPress,
  routeName,
  label,
}: TabBarButtonProps) {
  const { colors } = useTheme();
  const scale = useSharedValue(0);

  // Update animation when focus state changes
  useEffect(() => {
    scale.value = withSpring(isFocused ? 1 : 0, { duration: 350 });
  }, [scale, isFocused]);

  const animatedTextStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scale.value, [0, 1], [1, 0]),
  }));

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(scale.value, [0, 1], [1, 1.2]) }],
    top: interpolate(scale.value, [0, 1], [0, 11]),
  }));

  const iconName = ROUTE_ICONS[routeName] || 'circle';

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.tabbarItem}
      accessibilityRole="button"
      accessibilityState={{ selected: isFocused }}
      accessibilityLabel={`${label} tab`}>
      <Animated.View style={animatedIconStyle}>
        <Feather name={iconName as any} size={24} color={isFocused ? '#FFF' : colors.text} />
      </Animated.View>
      <Animated.Text
        style={[
          styles.label,
          { color: isFocused ? colors.primary : colors.text },
          animatedTextStyle,
        ]}>
        {label}
      </Animated.Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tabbarItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  label: {
    fontSize: 13,
  },
});

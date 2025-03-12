import { View, StyleSheet, LayoutChangeEvent } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import TabBarButton from './TabBarButton';
import { useState } from 'react';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useTheme } from '@react-navigation/native';

export default function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { colors } = useTheme();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const tabPositionX = useSharedValue(0);

  const buttonWidth = dimensions.width / state.routes.length;

  const onTabbarLayout = (event: LayoutChangeEvent) => {
    setDimensions({
      width: event.nativeEvent.layout.width,
      height: event.nativeEvent.layout.height,
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tabPositionX.value }],
  }));

  return (
    <View style={styles.tabbar} onLayout={onTabbarLayout}>
      <Animated.View
        style={[
          animatedStyle,
          styles.indicator,
          {
            width: buttonWidth - 25,
            height: dimensions.height - 15,
            backgroundColor: colors.primary,
          },
        ]}
      />
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel ?? route.name;
        const isFocused = state.index === index;

        const onPress = () => {
          // Only animate if not already focused
          if (!isFocused) {
            tabPositionX.value = withSpring(buttonWidth * index, { duration: 1200 });

            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <TabBarButton
            key={route.key}
            onPress={onPress}
            isFocused={isFocused}
            onLongPress={onLongPress}
            routeName={route.name}
            label={label as string}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabbar: {
    bottom: 20,
    borderRadius: 40,
    paddingVertical: 10,
    marginHorizontal: 80,
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    elevation: 3,
  },
  indicator: {
    position: 'absolute',
    borderRadius: 30,
    marginHorizontal: 12,
  },
});

import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Map from '~/components/Map';
import GradientStatusBar from '~/components/GradientStatusBar';

export default function MapScreen() {
  return (
    <View style={styles.container}>
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
      <Map />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

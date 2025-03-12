import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Map from '~/components/Map';

export default function MapScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Map />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

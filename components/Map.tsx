import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapBox, { Camera, LocationPuck, MapView } from '@rnmapbox/maps';
import ScooterLayer from 'components/ScootersLayer';
import ChargingStationsLayer from 'components/ChargingStationLayer';
import { useState, useRef } from 'react';
import { Scooter } from 'types/graphql';

MapBox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_KEY || '');

export default function Map() {
  // Get insets for all safe areas
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [cameraConfig, setCameraConfig] = useState({
    centerCoordinate: [0, 0],
    zoomLevel: 14,
    animationDuration: 0
  });
  const [selectedScooter, setSelectedScooter] = useState<Scooter | null>(null);

  const handleScooterSelect = (scooter: Scooter) => {
    setSelectedScooter(scooter);
    if (scooter.location) {
      setCameraConfig({
        centerCoordinate: [
          parseFloat(scooter.location.longitude.toString()),
          parseFloat(scooter.location.latitude.toString())
        ],
        zoomLevel: 18,
        animationDuration: 500
      });
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        style={[
          styles.mapView,
          // Apply negative margins to extend beyond safe areas
          {
            marginTop: -insets.top,
            marginBottom: -insets.bottom,
            marginLeft: -insets.left,
            marginRight: -insets.right,
          },
        ]}
        logoEnabled={false}
        attributionEnabled={false}
        scaleBarEnabled={false}>
        <Camera 
          centerCoordinate={cameraConfig.centerCoordinate}
          zoomLevel={cameraConfig.zoomLevel}
          animationDuration={cameraConfig.animationDuration}
          followUserLocation={!selectedScooter}
          followZoomLevel={14}
        />
        <ScooterLayer onScooterSelect={handleScooterSelect} />
        <ChargingStationsLayer />
        <LocationPuck puckBearingEnabled puckBearing="heading" pulsing={{ isEnabled: true }} />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Ensure the container takes up the full screen
    position: 'relative',
    overflow: 'hidden',
  },
  mapView: {
    flex: 1,
    // Ensure the map extends beyond the container
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

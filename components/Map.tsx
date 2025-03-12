import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapBox, {
  Camera,
  Images,
  LocationPuck,
  MapView,
  ShapeSource,
  SymbolLayer,
} from '@rnmapbox/maps';
import { featureCollection, point } from '@turf/helpers';

import scooters from 'data/scooters.json';

//@ts-expect-error
import available from 'assets/available.png';
//@ts-expect-error
import charging from 'assets/charging.png';
//@ts-expect-error
import disabled from 'assets/disabled.png';

MapBox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_KEY || '');

export default function Map() {
  // Get insets for all safe areas
  const insets = useSafeAreaInsets();

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
        <Camera followZoomLevel={14} followUserLocation />
        <LocationPuck puckBearingEnabled puckBearing="heading" pulsing={{ isEnabled: true }} />
        <ScooterLayer />
      </MapView>
    </View>
  );
}

function ScooterLayer() {
  const scootersFeatures = featureCollection(
    scooters.map((scooter) => point([scooter.long, scooter.lat], { state: scooter.state }))
  );

  return (
    <ShapeSource id="scooter-source" shape={scootersFeatures}>
      <SymbolLayer
        id="scooter-layer"
        style={{
          iconImage: ['get', 'state'],
          iconSize: 0.23,
          iconAllowOverlap: true,
          iconAnchor: 'center',
        }}
      />

      <Images images={{ available, charging, disabled }} />
    </ShapeSource>
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

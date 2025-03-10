import MapBox, { Camera, LocationPuck, MapView } from '@rnmapbox/maps';

MapBox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_KEY || '');

const styles = {
  flex: 1,
};

export default function Map() {
  return (
    <MapView style={styles} logoEnabled={false} attributionEnabled={false} scaleBarEnabled={false}>
      <Camera followZoomLevel={14} followUserLocation />
      <LocationPuck puckBearingEnabled puckBearing="heading" pulsing={{ isEnabled: true }} />
    </MapView>
  );
}

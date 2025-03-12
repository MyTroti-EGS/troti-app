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
  return (
    <MapView
      style={{ flex: 1 }}
      logoEnabled={false}
      attributionEnabled={false}
      scaleBarEnabled={false}>
      <Camera followZoomLevel={14} followUserLocation />
      <LocationPuck puckBearingEnabled puckBearing="heading" pulsing={{ isEnabled: true }} />
      <ScooterLayer />
    </MapView>
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

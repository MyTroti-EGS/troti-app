import { useEffect, useState } from 'react';
import { ShapeSource, SymbolLayer, Images } from '@rnmapbox/maps';
import { featureCollection, point } from '@turf/helpers';

// Import charging station icon
// @ts-expect-error
import chargingStationIcon from 'assets/charging-station.png';

export default function ChargingStationsLayer() {
  const [chargingStations, setChargingStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChargingStations = async () => {
      try {
        const response = await fetch('https://bckegs.mxv.pt/graphql/v1', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: `
              query ChargingStations {
                chargingStations {
                  id
                  metadata
                  location {
                    latitude
                    longitude
                  }
                }
              }
            `,
          }),
        });

        const result = await response.json();

        if (result.errors) {
          throw new Error(result.errors[0].message);
        }

        setChargingStations(result.data.chargingStations);
      } catch (err) {
        console.error('Error fetching charging stations:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchChargingStations();
  }, []);

  // If still loading or there's an error, don't render the layer yet
  if (loading || error) {
    return null;
  }

  // Parse metadata for each station to get name
  const stationsWithParsedMetadata = chargingStations.map((station) => {
    let metadata = {};
    try {
      metadata = JSON.parse(station.metadata);
    } catch (e) {
      console.warn(`Failed to parse metadata for station ${station.id}`);
    }

    return {
      ...station,
      parsedMetadata: metadata,
    };
  });

  // Create GeoJSON feature collection for the charging stations
  const stationsFeatures = featureCollection(
    stationsWithParsedMetadata.map((station) =>
      point([parseFloat(station.location.longitude), parseFloat(station.location.latitude)], {
        id: station.id,
        name: station.parsedMetadata.name || 'Charging Station',
        type: 'charging-station',
      })
    )
  );

  return (
    <ShapeSource id="charging-stations-source" shape={stationsFeatures}>
      <SymbolLayer
        id="charging-stations-layer"
        style={{
          iconImage: 'charging-station',
          iconSize: 0.23,
          iconAllowOverlap: true,
          iconAnchor: 'center',
          textField: ['get', 'name'],
          textSize: 12,
          textOffset: [0, -2],
          textAnchor: 'top',
          textColor: '#175D97',
          textHaloColor: 'white',
          textHaloWidth: 1,
        }}
      />

      <Images images={{ 'charging-station': chargingStationIcon }} />
    </ShapeSource>
  );
}

import { useEffect, useState } from 'react';
import { ShapeSource, SymbolLayer, Images } from '@rnmapbox/maps';
import { featureCollection, point } from '@turf/helpers';

// Import scooter icons
//@ts-expect-error
import available from 'assets/available.png';
//@ts-expect-error
import charging from 'assets/charging.png';
//@ts-expect-error
import disabled from 'assets/disabled.png';
//@ts-expect-error
import occupied from 'assets/occupied.png';

function ScooterLayer() {
  const [scooters, setScooters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchScooters = async () => {
      try {
        const response = await fetch('https://bckegs.mxv.pt/graphql/v1', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: `
              query Scooters {
                scooters {
                  id
                  battery
                  mac_address
                  serial_number
                  status
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

        setScooters(result.data.scooters);
      } catch (err) {
        console.error('Error fetching scooters:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchScooters();
  }, []);

  // If still loading or there's an error, don't render the layer yet
  if (loading || error) {
    return null;
  }

  // Map the API status to icon names
  const getIconName = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'available';
      case 'CHARGING':
        return 'charging';
      case 'MAINTENANCE':
        return 'disabled';
      case 'OCCUPIED':
        return 'occupied';
      default:
        return 'available';
    }
  };

  // Create GeoJSON feature collection for the scooters
  const scootersFeatures = featureCollection(
    scooters.map((scooter) =>
      point([parseFloat(scooter.location.longitude), parseFloat(scooter.location.latitude)], {
        id: scooter.id,
        status: scooter.status,
        battery: scooter.battery,
        iconName: getIconName(scooter.status),
        serial: scooter.serial_number,
      })
    )
  );

  return (
    <ShapeSource id="scooter-source" shape={scootersFeatures}>
      <SymbolLayer
        id="scooter-layer"
        style={{
          iconImage: ['get', 'iconName'],
          iconSize: 0.23,
          iconAllowOverlap: true,
          iconAnchor: 'center',
          // Optional: Add battery percentage as text
          textField: ['concat', ['get', 'battery'], '%'],
          textSize: 10,
          textOffset: [0, 2],
          textAnchor: 'top',
          textColor: '#333',
          textHaloColor: 'white',
          textHaloWidth: 1,
        }}
      />

      <Images images={{ available, charging, disabled, occupied }} />
    </ShapeSource>
  );
}

export default ScooterLayer;

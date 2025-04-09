import { useEffect, useState } from 'react';
import { ShapeSource, SymbolLayer, Images, Camera } from '@rnmapbox/maps';
import { featureCollection, point, Feature, Point, Properties } from '@turf/helpers';
import { useQuery, useSubscription } from '@apollo/client';
import { gql } from '@apollo/client';
import { Scooter, ScooterUpdate } from 'types/graphql';
import RideDrawer from './RideDrawer';

// Import scooter icons
//@ts-expect-error
import available from 'assets/available.png';
//@ts-expect-error
import charging from 'assets/charging.png';
//@ts-expect-error
import disabled from 'assets/disabled.png';
//@ts-expect-error
import occupied from 'assets/occupied.png';

const GET_SCOOTERS = gql`
  query GetScooters {
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
`;

const SCOOTER_UPDATED = gql`
  subscription OnScooterUpdated {
    scooterUpdated {
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
`;

type ScooterProperties = {
  id: string;
  status: string;
  battery: number;
  iconName: string;
  serial: string;
};

interface ScooterLayerProps {
  onScooterSelect?: (scooter: Scooter) => void;
}

function ScooterLayer({ onScooterSelect }: ScooterLayerProps) {
  const { loading, error, data } = useQuery(GET_SCOOTERS);
  const { data: subscriptionData } = useSubscription(SCOOTER_UPDATED);
  const [selectedScooter, setSelectedScooter] = useState<Scooter | null>(null);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isRiding, setIsRiding] = useState(false);

  // If still loading or there's an error, don't render the layer yet
  if (loading || error || !data?.scooters) {
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

  const handleScooterPress = (scooter: Scooter) => {
    if (isRiding) return; // Prevent selecting other scooters during a ride
    
    setSelectedScooter(scooter);
    setIsDrawerVisible(true);
    setIsMinimized(false);
    
    // Call the onScooterSelect callback if provided
    if (onScooterSelect) {
      onScooterSelect(scooter);
    }
  };

  const handleStartRide = () => {
    setIsRiding(true);
    // TODO: Implement start ride logic
    console.log('Starting ride with scooter:', selectedScooter?.id);
  };

  const handleStopRide = () => {
    setIsRiding(false);
    // TODO: Implement stop ride logic
    console.log('Stopping ride with scooter:', selectedScooter?.id);
  };

  // Create GeoJSON feature collection for the scooters
  const scootersFeatures = featureCollection(
    data.scooters.map((scooter: Scooter) =>
      point([parseFloat(scooter.location.longitude.toString()), parseFloat(scooter.location.latitude.toString())], {
        id: scooter.id,
        status: scooter.status,
        battery: scooter.battery,
        iconName: getIconName(scooter.status),
        serial: scooter.serial_number,
      } as ScooterProperties)
    )
  );

  return (
    <>
      <Images images={{ available, charging, disabled, occupied }} />
      <ShapeSource 
        id="scooter-source" 
        shape={scootersFeatures as any}
        onPress={(event: any) => {
          const feature = event.features[0];
          if (feature) {
            const scooter = data.scooters.find((s: Scooter) => s.id === feature.properties?.id);
            if (scooter) {
              handleScooterPress(scooter);
            }
          }
        }}
      >
        <SymbolLayer
          id="scooter-layer"
          style={{
            iconImage: ['get', 'iconName'],
            iconSize: 0.23,
            iconAllowOverlap: true,
            iconAnchor: 'center',
            textField: ['concat', ['get', 'battery'], '%'],
            textSize: 10,
            textOffset: [0, 2],
            textAnchor: 'top',
            textColor: '#333',
            textHaloColor: 'white',
            textHaloWidth: 1,
          }}
        />
      </ShapeSource>

      <RideDrawer
        isVisible={isDrawerVisible}
        onClose={() => {
          setIsDrawerVisible(false);
          setIsMinimized(false);
          if (!isRiding) {
            setSelectedScooter(null);
          }
        }}
        scooter={selectedScooter}
        onStartRide={handleStartRide}
        onStopRide={handleStopRide}
        isMinimized={isMinimized}
        onMinimize={() => setIsMinimized(true)}
        onExpand={() => setIsMinimized(false)}
      />
    </>
  );
}

export default ScooterLayer;

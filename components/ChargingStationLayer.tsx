import { useEffect, useState } from 'react';
import { ShapeSource, SymbolLayer, Images } from '@rnmapbox/maps';
import { featureCollection, point, Feature, Point, Properties } from '@turf/helpers';
import { useQuery, useSubscription } from '@apollo/client';
import { gql } from '@apollo/client';
import { ChargingStation, ChargingStationUpdate } from 'types/graphql';

// Import charging station icon
// @ts-expect-error
import chargingStationIcon from 'assets/charging-station.png';

const GET_CHARGING_STATIONS = gql`
  query GetChargingStations {
    chargingStations {
      id
      metadata
      location {
        latitude
        longitude
      }
    }
  }
`;

const CHARGING_STATION_UPDATED = gql`
  subscription OnChargingStationUpdated {
    chargingStationUpdated {
      id
      metadata
      location {
        latitude
        longitude
      }
    }
  }
`;

type ChargingStationProperties = {
  id: string;
  name: string;
  type: string;
};

export default function ChargingStationsLayer() {
  const { loading, error, data } = useQuery(GET_CHARGING_STATIONS);
  const { data: subscriptionData } = useSubscription(CHARGING_STATION_UPDATED);

  // If still loading or there's an error, don't render the layer yet
  if (loading || error || !data?.chargingStations) {
    return null;
  }

  // Parse metadata for each station to get name
  const stationsWithParsedMetadata = data.chargingStations.map((station: ChargingStation) => {
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
    stationsWithParsedMetadata.map((station: ChargingStation & { parsedMetadata: any }) =>
      point([parseFloat(station.location.longitude.toString()), parseFloat(station.location.latitude.toString())], {
        id: station.id,
        name: station.parsedMetadata.name || 'Charging Station',
        type: 'charging-station',
      } as ChargingStationProperties)
    )
  );

  return (
    <>
      <Images images={{ 'charging-station': chargingStationIcon }} />
      <ShapeSource id="charging-stations-source" shape={stationsFeatures as any}>
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
      </ShapeSource>
    </>
  );
}

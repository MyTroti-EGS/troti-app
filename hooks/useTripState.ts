import { useState, useEffect } from 'react';
import { useAuthSession } from '../providers/AuthProvider';
import { getTripStatus } from '../services/tripService';
import { Scooter } from 'types/graphql';

interface TripState {
  isRiding: boolean;
  startTime: Date | null;
  scooter: Scooter | null;
}

export function useTripState() {
  const { token } = useAuthSession();
  const [tripState, setTripState] = useState<TripState>({
    isRiding: false,
    startTime: null,
    scooter: null,
  });

  useEffect(() => {
    const checkTripStatus = async () => {
      if (!token?.current) return;

      try {
        const response = await getTripStatus(token.current);
        if (response.state === 'TRIP' && response.trip) {
          setTripState({
            isRiding: true,
            startTime: new Date(response.trip.startDate),
            scooter: {
              id: response.trip.scooterId,
              // Add other required scooter properties
              battery: 0,
              mac_address: '',
              serial_number: '',
              status: 'OCCUPIED',
              location: {
                latitude: 0,
                longitude: 0,
              },
            } as Scooter,
          });
        }
      } catch (error) {
        console.error('Error checking trip status:', error);
      }
    };

    checkTripStatus();
  }, [token]);

  return {
    tripState,
    setTripState,
  };
} 